import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import moment from 'moment';
import { FindManyOptions, FindOptionsRelationByString, Not, Repository } from 'typeorm';
import { UserDocumentTypes } from '../../../common/enum/document-type.enum';
import { generateRandomCode } from '../../../common/functions';
import { handleEvent } from '../../../common/functions/handle-event.function';
import { I18N_SPACE } from '../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../common/i18n/functions/response';
import { config } from '../../../config';
import { createOrganizationUserEvent } from '../../../main/vudec/organizations/organization-user/constants/events.constants';
import { Organization } from '../../../main/vudec/organizations/organization/entity/organization.entity';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { recoverPasswordEmailEvent } from '../../auth/constants/events.constants';
import { SignupEmailInput } from '../../auth/dto/inputs';
import { CreateTokenInput } from '../../auth/dto/inputs/createToken.input';
import { RoleFxAndUrlsResponse } from '../../roles/role/dto/inputs/create-and-remove-role-fx.input';
import { RoleFx } from '../../roles/role/entities/role-fx.entity';
import { Role } from '../../roles/role/entities/role.entity';
import { checkCodeEvent, registerCodeEvent } from '../../user-key/constants/events.constants';
import { createUserRolesEvent, replaceAllUserRolesEvent } from '../../user-role/constants/events.constants';
import { CreateUserRolesEventInput } from '../../user-role/dto/events/create-user-roles.input';
import { ReplaceAllUserRolesEventInput } from '../../user-role/dto/events/replace-all-user-roles.input';
import { UserRole } from '../../user-role/entities/user-role.entity';
import { createExternalUserInputEvent, findUserByEvent, findUserByIdEvent, getUserByIdEvent, updateUserEvent } from '../constants/events.constants';
import { FindUserArgs } from '../dto/args/find-users.args';
import { FindUserByIdEventInput } from '../dto/events/find-user-by-id.event';
import { UpdateUserEventInput } from '../dto/events/update-user.event';
import { CodeRecoverPasswordInput } from '../dto/inputs/code-recover-password.input';
import { CreateUserAuth0Input } from '../dto/inputs/create-user-auth0';
import { CreateUserInput } from '../dto/inputs/create-user.input';
import { RecoveryPasswordInput } from '../dto/inputs/recovery-password.input';
import { SendEmailRecoveryPasswordInput } from '../dto/inputs/send-recovery-password.input';
import { UpdatePasswordInput } from '../dto/inputs/update-password.input';
import { UpdateStatusUserAuth0 } from '../dto/inputs/update-status-user-auth0.input';
import { UpdateUserInformationInput } from '../dto/inputs/update-user-information.input';
import { UpdateUserPasswordInput } from '../dto/inputs/update-user-password.input';
import { UpdateUserInput } from '../dto/inputs/update-user.input';
import { User } from '../entities/user.entity';
import { UserStatusTypes } from '../enums/status-type.enum';
import { UserKeyOrigin } from '../enums/user-key-origin.enum';
import { UserTypes } from '../enums/user-type.enum';
import { OrdenType } from 'src/main/vudec/organizations/organization/enums/organization-orden.enum';

export const serviceStructure = CrudServiceStructure({
  entityType: User,
  createInputType: CreateUserInput,
  updateInputType: UpdateUserInput,
  findArgsType: FindUserArgs,
});

@Injectable()
export class UsersService extends CrudServiceFrom(serviceStructure) {
  private context: IContext;

  constructor(
    @Inject(config.KEY)
    private readonly configService: ConfigType<typeof config>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.User;
  private readonly JWT_SECRET: string = process.env.JWT_SECRET;

  private async hash(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, 10);
  }

  async createUserAuth0(context: IContext, user: CreateUserAuth0Input) {
    const repository = this.getRepository(context);
    const createUser = repository.create(user);

    createUser.type = UserTypes.User;

    return await repository.save(createUser);
  }

  async updateUserAuth0(context: IContext, user: UpdateStatusUserAuth0) {
    const repository = this.getRepository(context);

    await repository.update(user.id, {
      password: await this.hash(user.password),
      identificationType: user.identificationType,
      identificationNumber: user.identificationNumber,
      status: UserStatusTypes.Active,
      type: UserTypes.User,
    });

    const updatedUser = await this.findOneById(context, user.id, true);

    return updatedUser;
  }

  private checkUserPassword(password: string, user: User) {
    const { password: currentPassword } = user;

    if (!bcrypt.compareSync(password, currentPassword)) throw new BadRequestException('There was a problem validating the current password.');

    return true;
  }

  private checkPasswordConfirm(password: string, passwordConfirm: string) {
    if (password !== passwordConfirm) throw new BadRequestException('confirmationPassword must be equal to password');

    return true;
  }

  async resetSuperAdmin(context: IContext): Promise<User> {
    const repository = this.getRepository(context);

    const saEmail = this.configService.sa.email;
    const saPassword = this.configService.sa.password;

    let user = await this.findOneByEmail(context, saEmail);

    const password = await this.hash(saPassword);

    if (!user) {
      user = repository.create({
        email: saEmail,
        password,
        name: 'super admin',
        type: UserTypes.SuperAdmin,
        status: UserStatusTypes.Active,
      });
    } else {
      user.password = password;
    }

    return repository.save(user);
  }

  async partialCreation(context: IContext, createInput: SignupEmailInput): Promise<User> {
    const repository = this.getRepository(context);

    const { email, identificationType, identificationNumber } = createInput;

    const findUser = await repository.findOne({
      where: [
        {
          email,
        },
        {
          identificationType,
          identificationNumber,
        },
      ],
    });

    if (findUser && findUser.email == email) {
      throw new BadRequestException(`User with email: ${email} already exists in the database`);
    } else if (findUser) {
      throw new BadRequestException(`User with document: ${identificationType} ${identificationNumber} already exists in the database`);
    }

    const newUser = repository.create({ ...createInput, status: UserStatusTypes.Active });

    await repository.save(newUser);

    return newUser;
  }

  async beforeCreate(context: IContext, repository: Repository<User>, entity: User, createInput: CreateUserInput): Promise<void> {
    if (createInput?.type === UserTypes.SuperAdmin && (context.user as User)?.type !== UserTypes.SuperAdmin)
      throw new ForbiddenException(`only a superAdmin can create a new superAdmin user`);

    if (createInput?.type !== UserTypes.Public) {
      const sameEmailUser = await this.findOneBy(context, {
        where: { email: createInput.email, type: Not(UserTypes.Public) },
      });

      if (sameEmailUser) throw new BadRequestException(`Usuario con email ${createInput.email} ya existe`);
    }

    if (createInput.password) {
      entity.password = await this.hash(createInput.password);
    }

    if (createInput.temporalPassword) {
      entity.tempPassword = createInput.password;
    }

    entity.email = String(createInput.email || '')
      .trim()
      ?.toLowerCase();
    entity.name = String(createInput.name || '').trim();
    entity.middleName = String(createInput.middleName || '').trim();
    entity.lastName = String(createInput.lastName || '').trim();
    entity.secondSurname = String(createInput.secondSurname || '').trim();
  }

  async beforeUpdate(context: IContext, repository: Repository<User>, entity: User, updateInput: UpdateUserInput): Promise<void> {
    const { email, identificationNumber }: UpdateUserInput = updateInput;

    if (updateInput?.type === UserTypes.SuperAdmin && (context.user as User)?.type !== UserTypes.SuperAdmin)
      throw new ForbiddenException(`Sólo un superAdmin puede actualizar un nuevo usuario superAdmin`);

    if (updateInput?.type !== UserTypes.Public) {
      if (updateInput?.email && email !== entity?.email) {
        const [userWithNewEmail] = await this.eventEmitter.emitAsync(findUserByEvent, {
          context,
          options: { where: { email, id: Not(entity?.id) } },
        });
        if (userWithNewEmail) {
          throw new BadRequestException('Ya existe un usuario con este correo electrónico');
        }
      }
    }

    if (updateInput?.identificationNumber && identificationNumber !== entity?.identificationNumber) {
      const [userWithNewIdentificationNumber] = await this.eventEmitter.emitAsync(findUserByEvent, {
        context,
        options: { where: { identificationNumber, id: Not(entity?.id) } },
      });
      if (userWithNewIdentificationNumber) {
        throw new BadRequestException('Ya existe un usuario con este numero de identificación');
      }
    }

    if (updateInput?.password) entity.password = await this.hash(updateInput?.password);

    entity.email = String(updateInput?.email || '')
      .trim()
      ?.toLowerCase();
    entity.name = updateInput?.name ? String(updateInput?.name || '').trim() : entity?.name;
    entity.middleName = updateInput?.middleName ? String(updateInput?.middleName || '').trim() : entity?.middleName;
    entity.lastName = updateInput?.lastName ? String(updateInput?.lastName || '').trim() : entity?.lastName;
    entity.secondSurname = updateInput?.secondSurname ? String(updateInput?.secondSurname || '').trim() : entity?.secondSurname;
  }
  /*  async beforeUpdate(context: IContext, repository: Repository<User>, entity: User, updateInput: UpdateUserInput): Promise<void> {
      // Validar creación/actualización de SuperAdmin
      if (updateInput?.type === UserTypes.SuperAdmin && (context.user as User)?.type !== UserTypes.SuperAdmin) {
        throw new ForbiddenException('Sólo un superAdmin puede actualizar un nuevo usuario superAdmin');
      }
  
      // Si se está actualizando el password
      if (updateInput.password) {
        entity.password = await this.hash(updateInput.password);
      }
  
      // Validaciones de cambio de estado
      if (updateInput.status) {
        const currentUser = await this.findOneById(context, entity.id, true);
  
        // Si el usuario está InactiveDefinitively, no se puede cambiar su estado
        if (currentUser.status === UserStatusTypes.InactiveDefinitively) {
          throw new ForbiddenException('No se puede modificar el estado de un usuario inactivo definitivamente');
        }
  
        // Si el usuario está Inactive, solo Admin o SuperAdmin pueden cambiar su estado
        if (currentUser.status === UserStatusTypes.Inactive) {
          const contextUser = context.user as User;
          if (contextUser?.type !== UserTypes.Admin && contextUser?.type !== UserTypes.SuperAdmin) {
            throw new ForbiddenException('Solo administradores pueden reactivar usuarios inactivos');
          }
        }
  
        // Si el usuario es Public, no puede cambiar estados
        const contextUser = context.user as User;
        if (contextUser?.type === UserTypes.Public || contextUser?.type === UserTypes.User) {
          throw new ForbiddenException('Usuarios públicos no pueden modificar estados');
        }
  
        // Si se está activando el usuario, limpiar los contadores de intentos
        if (updateInput.status === UserStatusTypes.Active) {
          updateInput.loginAttempts = 0;
          updateInput.attemptsCycles = 0;
          updateInput.lastFailedAttemptDate = null;
          updateInput.credentialsExpirationDate = null;
        }
      }
    }
  */
  async afterUpdate(context: IContext, repository: Repository<User>, entity: User, updateInput: UpdateUserInput): Promise<void> {
    if (updateInput.rolesId) {
      const userRolesUpdated = await handleEvent<UserRole[], ReplaceAllUserRolesEventInput>(
        this.eventEmitter,
        replaceAllUserRolesEvent,
        { context, userId: entity.id, roleIds: updateInput.rolesId },
        UserRole,
      );

      entity.userRoles = userRolesUpdated;
    }
  }

  async afterCreate(context: IContext, __repository: Repository<User>, entity: User, createInput: CreateUserInput): Promise<void> {
    if (createInput.rolesId) {
      const userRolesCreated = await handleEvent<UserRole[], CreateUserRolesEventInput>(
        this.eventEmitter,
        createUserRolesEvent,
        { context, userId: entity.id, roleIds: createInput.rolesId },
        UserRole,
      );

      entity.userRoles = userRolesCreated;
    }
  }

  async beforeRemove(context: IContext, repository: Repository<User>, entity: User): Promise<void> {
    if (entity?.type === UserTypes.SuperAdmin && (context.user as User)?.type !== UserTypes.SuperAdmin)
      throw new ForbiddenException(`only a superAdmin can remove a new superAdmin user`);
  }

  async findOneByEmail(context: IContext, email: string, orFail?: boolean): Promise<User> {
    const repository = this.getRepository(context);

    const user = await repository.findOneBy({ email });

    if (orFail && !user) throw new NotFoundException(`Usuario con correo: ${email} no encontrado`);

    return user;
  }

  async findOneById(context: IContext, id: string, orFail?: boolean): Promise<User> {
    const repository = this.getRepository(context);

    const user = await repository.findOne({
      where: {
        id,
      },
    });

    if (orFail && !user) throw new NotFoundException(`User with id: ${id} not found`);

    return user;
  }

  async findOneByIdentificationNumber(context: IContext, identificationNumber: string, identificationType: UserDocumentTypes, orFail?: boolean): Promise<User> {
    const repository = this.getRepository(context);

    const user = await repository.findOneBy({
      identificationNumber,
      identificationType,
    });

    if (orFail && !user) throw new NotFoundException(`User with identification number: ${identificationNumber} not found`);

    return user;
  }

  async sendEmailRecoveryPassword(context: IContext, passwordRecoveryInput: SendEmailRecoveryPasswordInput): Promise<{ expCode: number }> {
    const { email } = passwordRecoveryInput;

    const user = await this.findOneByEmail(context, email, true);

    if (user?.type === UserTypes.Public || user?.type === UserTypes.SuperAdmin)
      throw new BadRequestException('Esta cuenta no admite recuperación de contraseña.');

    const code = generateRandomCode(context, 5);

    const dateExp = new Date(moment.tz(process.env.TZ).add(5, 'minutes').add(5, 'seconds').format('YYYY-MM-DDTHH:mm:ss'));

    const expCode = Math.floor(dateExp.getTime() / 1000);

    await this.eventEmitter.emitAsync(registerCodeEvent, {
      context,
      code,
      user,
      origin: UserKeyOrigin.RecoverPassword,
      dateExp,
    });

    await this.eventEmitter.emitAsync(recoverPasswordEmailEvent, { context, user, code, expCode });
    // return sendResponse(context, this.I18N_SPACE, 'sendEmailRecoveryPassword.response');
    return { expCode };
  }

  async updatePassword(context: IContext, updatePasswordInput: UpdatePasswordInput): Promise<User> {
    const { token, password, passwordConfirm } = updatePasswordInput;

    const repository = this.getRepository(context);

    this.checkPasswordConfirm(password, passwordConfirm);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwt.secret,
      });

      const { id } = payload;

      const user = await this.findOneById(context, id, true);

      const hashedPassword = await this.hash(password);

      await repository.update(user.id, { password: hashedPassword });

      return user;
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }

  async hasFunctionality(context: IContext, key: string, userId: string): Promise<boolean> {
    const user: User = await this.findOneBy(context, { where: { id: userId, userRoles: { role: { roleFx: { functionality: { key } } } } } });

    return user ? true : false;
  }

  async getRoles(context: IContext, user: User): Promise<Role[]> {
    let roles: Role[] = [];

    const rolesFromUser: UserRole[] = await user?.userRoles;

    for (let i = 0; i < rolesFromUser.length; i++) {
      const userRole: UserRole = await rolesFromUser[i];

      const role: Role = await userRole.role;

      roles.push(role);
    }

    return roles;
  }

  async getPermissions(context: IContext, user: User): Promise<RoleFxAndUrlsResponse[]> {
    const roles = await this.getRoles(context, user);

    if (!roles?.length) return [];

    const roleFxList: RoleFx[] = [];

    for (const role of roles) {
      const roleFx = (await role.roleFx) || [];
      for (const fx of roleFx) {
        const roleFxUrls = await fx.roleFxUrls;
        roleFxList.push({
          ...fx,
          functionality: await fx.functionality,
          roleFxUrls,
        });
      }
    }

    const groupedPermissions = new Map<string, Set<string>>();

    for (const item of roleFxList) {
      const permission = item.functionality.key;
      if (!groupedPermissions.has(permission)) {
        groupedPermissions.set(permission, new Set());
      }

      for (const roleFxUrl of item.roleFxUrls) {
        const functionality = await roleFxUrl.functionality;
        groupedPermissions.get(permission).add(functionality.url);
      }
    }

    return Array.from(groupedPermissions.entries()).map(([permission, urls]) => ({
      permission,
      urls: Array.from(urls),
    }));
  }

  async userOrganizations(context: IContext, user: User): Promise<Organization[]> {
    let organizations: Organization[] = [];

    const currentUser = await this.findOne(context, user.id, false);

    const organizationUsers = await currentUser?.organizationUsers;

    for (let i = 0; i < organizationUsers.length; i++) {
      const { organization } = organizationUsers[i];

      const organizationLoaded = await organization;

      //if (organizationLoaded.ordenType !== OrdenType.CentralizeEntity) {
      organizations.push(organizationLoaded);
      //}
    }

    return organizations;
  }

  async updateUserInformation(context: IContext, updateUserInformationInput: UpdateUserInformationInput): Promise<User> {
    const repository = this.getRepository(context);

    const { name: userName, lastName } = updateUserInformationInput;

    const {
      user: { id, name: currentName, lastName: currentLastName },
    } = context;

    const name = `${userName ? userName : currentName} ${lastName ? lastName : currentLastName}`;

    await repository.update(id, { name, ...updateUserInformationInput });

    const updatedUser = await this.findOneById(context, id, true);

    return updatedUser;
  }

  async createExternalUserInput({ context, user }: { context: IContext; user: CreateTokenInput }): Promise<User> {
    let userOrganizationFound = await this.findOneBy(context, {
      where: {
        organizationUsers: {
          organization: { id: context?.organization?.id },
        },
        identificationNumber: String(user?.identificationNumber),

        type: user?.type && user?.type === UserTypes.Public ? UserTypes.Public : Not(UserTypes.Public),
      },
    });

    const { name, lastName, email, identificationNumber, type } = user;

    if (!userOrganizationFound) {
      const userFound = await this.findOneBy(context, {
        where: {
          identificationNumber: String(user?.identificationNumber),
          type: user?.type && user?.type === UserTypes.Public ? UserTypes.Public : Not(UserTypes.Public),
        },
      });

      if (userFound) {
        await this.eventEmitter.emitAsync(createOrganizationUserEvent, {
          context,
          createInput: {
            organizationId: context?.organization?.id,
            userId: userFound?.id,
          },
        });

        return userFound;
      } else {
        if (user?.type !== UserTypes.Public) {
          const userFoundByEmail = await this.findOneBy(context, {
            where: {
              email: user?.email,
              type: Not(UserTypes.Public),
            },
          });

          if (userFoundByEmail) throw new BadRequestException('Ya existe un usuario con el mismo correo electrónico');
        }

        const temporalPassword = generateRandomCode(context, 12);

        const userCreated = await this.create(context, {
          name,
          lastName,
          identificationNumber: String(identificationNumber),
          email,
          hasExternalCreation: true,
          temporalPassword: true,
          type: type ?? UserTypes.User,
          password: temporalPassword,
          status: UserStatusTypes.Active,
        });

        await this.eventEmitter.emitAsync(createOrganizationUserEvent, {
          context,
          createInput: {
            organizationId: context.organization.id,
            userId: userCreated.id,
          },
        });

        // Condición se quita después de hacer pruebas.
        // if (type !== UserTypes.Admin && type !== UserTypes.Public)
        //   this.eventEmitter.emitAsync(temporalPasswordEvent, {
        //     context,
        //     user: userCreated,
        //     code: temporalPassword,
        //   });

        return userCreated;
      }
    }

    return userOrganizationFound;
  }

  async updateUserPassword(context: IContext, updateUserPasswordInput: UpdateUserPasswordInput): Promise<User> {
    const { currentPassword, newPassword, newPasswordConfirm } = updateUserPasswordInput;

    this.checkPasswordConfirm(newPassword, newPasswordConfirm);

    const {
      user: { id },
    } = context;

    const currentUser = await this.findOneById(context, id, true);

    this.checkUserPassword(currentPassword, currentUser);

    const repository = this.getRepository(context);

    await repository.update(id, { password: await this.hash(newPassword) });

    return currentUser;
  }

  async fullName(context: IContext, user: User): Promise<string> {
    const { name, lastName } = user;

    return `${name ?? ''} ${lastName ?? ''}`;
  }

  async updatePasswordByRecoveryPasswordEmail(context: IContext, { token, password, passwordConfirm }: RecoveryPasswordInput): Promise<User> {
    const user: User = await this.validateAndRetrieveUserByToken(context, password, passwordConfirm, token);

    const userUpdated = await this.update(context, user.id, {
      id: user.id,
      password,
      temporalPassword: false,
      tempPassword: null,
      // credentialsExpirationDate: null,
    });

    return userUpdated;
  }

  async validateAndRetrieveUserByToken(context: IContext, password: string, passwordConfirm: string, token: string): Promise<User> {
    this.checkPasswordConfirm(password, passwordConfirm);

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: this.JWT_SECRET });

      const { email } = payload;

      return await this.getUserByEmail(context, email, true, true);
    } catch (error) {
      throw new ForbiddenException(sendResponse(context, this.I18N_SPACE, 'validateAndRetrieveUserByToken.error'));
    }
  }

  async getUserByEmail(context: IContext, email: string, orFail?: boolean, isSimple: boolean = false): Promise<User> {
    const relations: string[] = isSimple ? [] : [];

    const user: User = await this.findOneBy(context, { where: { email }, relations: relations });

    if (orFail && !user) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'findOneByEmail.userOrFail', { email }));

    return user;
  }

  async codeRecoverPassword(context: IContext, codeRecoverPasswordInput: CodeRecoverPasswordInput): Promise<string> {
    const { code, email } = codeRecoverPasswordInput;

    const user = await this.findOneByEmail(context, email, true);

    const [result] = await this.eventEmitter.emitAsync(checkCodeEvent, {
      context,
      code,
      user,
      origin: UserKeyOrigin.RecoverPassword,
    });

    if (!result) throw new BadRequestException('Código Invalido');

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return token;
  }

  async findUserById({
    context,
    id,
    relations,
    orFail,
  }: {
    context: IContext;
    id: string;
    orFail?: boolean;
    relations?: FindOptionsRelationByString;
  }): Promise<User> {
    const user = await this.findOneBy(context, {
      where: {
        id,
      },
      ...(relations && { relations }),
    });
    if (orFail && !user)
      throw new NotFoundException(
        sendResponse(context, this.I18N_SPACE, 'findOneById.userOrFail', {
          id,
        }),
      );

    return user;
  }

  async getUserById({ context, id }: FindUserByIdEventInput): Promise<User> {
    return await this.findOneBy(context, { where: { id } });
  }

  async updateUser({ context, input }: UpdateUserEventInput): Promise<User> {
    return await this.update(context, input.id, input);
  }

  @OnEvent(updateUserEvent)
  async onUpdateUser(input: UpdateUserEventInput): Promise<User> {
    return await this.updateUser(input);
  }

  @OnEvent(findUserByIdEvent)
  async onFindUserById({
    context,
    id,
    relations,
    orFail = true,
  }: {
    context: IContext;
    id: string;
    relations?: FindOptionsRelationByString;
    orFail?: boolean;
  }): Promise<User> {
    return await this.findUserById({ context, id, relations, orFail });
  }

  @OnEvent(findUserByEvent)
  async onFindUserBy({ context, options }: { context: IContext; options: FindManyOptions }): Promise<User> {
    return await this.findOneBy(context, options);
  }

  @OnEvent(createExternalUserInputEvent, { suppressErrors: false })
  async onCreateExternalUserInput({ context, user }: { context: IContext; user: CreateTokenInput }): Promise<User> {
    return await this.createExternalUserInput({
      context,
      user,
    });
  }

  @OnEvent(getUserByIdEvent)
  async onGetUserById({ context, id }: FindUserByIdEventInput): Promise<User> {
    return await this.getUserById({ context, id });
  }
}
