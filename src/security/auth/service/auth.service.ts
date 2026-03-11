import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { default as moment, Moment, default as momentjs } from 'moment';
import { Not } from 'typeorm';
import { UserDocumentTypes } from '../../../common/enum/document-type.enum';
import { generateRandomCode } from '../../../common/functions';
import { I18N_SPACE } from '../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../common/i18n/functions/response';
import { TypeNotification } from '../../../general/notifications/notification/enums/type-notification.enum';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { checkCodeEvent, createCodeEvent, registerCodeEvent } from '../../user-key/constants/events.constants';
import { UserKeyExtraArgs } from '../../user-key/dto/args/user-key.args';
import { createExternalUserInputEvent, findUserByEvent, findUserByIdEvent, getUserByIdEvent, updateUserEvent } from '../../users/constants/events.constants';
import { User } from '../../users/entities/user.entity';
import { UserStatusTypes } from '../../users/enums/status-type.enum';
import { UserKeyOrigin } from '../../users/enums/user-key-origin.enum';
import { UserTypes } from '../../users/enums/user-type.enum';
import { UsersService } from '../../users/services/users.service';
import { getTokenAuthEvent, sendVerificationCodeToJwtEvent, signInWithUserEvent, signupEmailEvent } from '../constants/events.constants';
import { SignInInput as SigninInput, SignupEmailInput } from '../dto/inputs';
import { ApprovalTokenInput } from '../dto/inputs/approval-token.input';
import { CreateTokenInput } from '../dto/inputs/createToken.input';
import { RevokeCredentialInput } from '../dto/inputs/revoke-credential.input';
import { SendDoubleVerificationInput } from '../dto/inputs/send-double-verification.input';
import { SigninAdminInput } from '../dto/inputs/signin-admin.input';
import { ValidateTokenInput } from '../dto/inputs/validate-token.input';
import { VerificationTypes } from '../enum/verification-type';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthResponse } from '../types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly I18N_SPACE = I18N_SPACE.Auth;
  private readonly TZ: string = process.env.TZ;
  private readonly MAX_ATTEMPTS = 3;
  private readonly BLOCK_TIME_MINUTES = 5;
  private readonly MAX_CYCLES = 2;

  private getJwtToken(user: User, hasAuthorized: boolean): string {
    return this.jwtService.sign({ id: user.id, hasAuthorized });
  }

  private async checkToken(token: string): Promise<User> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });

      const { id } = payload;

      const user = await this.userService.findOneById({ user: undefined }, id, true);

      return user;
    } catch (e) {
      throw new BadRequestException('Token inválido');
    }
  }

  private async getJwtTokenWithAuth(context: IContext, user: User): Promise<string> {
    const { email, name, lastName, identificationType, identificationNumber, type } = user;

    const organization = await context.organization;
    const product = await context.product;

    const payload: JwtPayload = {
      email: email || '',
      name: name || '',
      lastName: lastName || '',
      identificationType: identificationType || UserDocumentTypes.CitizenshipCard,
      identificationNumber,
      type: type || '',
      hasAuthorized: true,
      organization: organization && organization.nit,
      product: product && product.name,
    };

    return this.jwtService.sign(payload);
  }

  async getTokenAuth(
    context: IContext,
    userInput: CreateTokenInput,
    userIn?: User,
    args?: UserKeyExtraArgs,
    expirable?: boolean,
  ): Promise<string | BadRequestException> {
    const { email, name, lastName, identificationNumber } = userInput;

    const organization = context.organization;

    const product = context.product;

    const organizationProduct = context.organizationProduct;

    let user = userIn;

    if (!user || !user.id) {
      [user] = await this.eventEmitter.emitAsync(findUserByEvent, {
        context,
        options: {
          where: [
            {
              identificationNumber: String(identificationNumber),
              organizationUsers: {
                organization: { id: organization?.id },
              },
              type: Not(UserTypes.Public),
            },
          ],
        },
      });
    }

    if (!user) {
      const [existingUserByEmail] = await this.eventEmitter.emitAsync(findUserByEvent, {
        context,
        options: {
          where: {
            email,
            organizationUsers: {
              organization: { id: organization?.id },
            },
            type: Not(UserTypes.Public),
          },
        },
      });

      if (existingUserByEmail) {
        user = existingUserByEmail;
      } else {
        if (name && (name || lastName)) {
          [user] = await this.eventEmitter.emitAsync(createExternalUserInputEvent, { context, user: userInput });

          if (!(user instanceof User)) {
            throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'getTokenAuth.notUser'));
          }
        } else {
          throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'getTokenAuth.notUser'));
        }
      }
    }

    if (!user) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'getTokenAuth.notUser'));

    let argsTo = {} as UserKeyExtraArgs;

    if (args) argsTo = args;

    if (organizationProduct) argsTo.credentialId = organizationProduct?.id;
    if (organization) argsTo.organizationId = organization?.id;
    if (product) argsTo.productId = product?.id;

    const [userKey] = await this.eventEmitter.emitAsync(createCodeEvent, context, user, UserKeyOrigin.AuthenticationLink, argsTo, expirable);

    if (userKey) return userKey.code;
    else return new InternalServerErrorException(sendResponse(context, this.I18N_SPACE, 'getTokenAuth.error'));
  }

  private async sendVerificationCode(type: VerificationTypes, context: IContext, user: User, code: string) {
    if (user.password) delete user.password;

    const origin = UserKeyOrigin.TwoSteps;

    await this.eventEmitter.emitAsync(registerCodeEvent, {
      context,
      code,
      user,
      origin,
    });

    if (type === VerificationTypes.Phone) {
      this.eventEmitter.emitAsync(sendVerificationCodeToJwtEvent, {
        context,
        user,
        code,
        type: TypeNotification.Sms,
      });
    } else if (type === VerificationTypes.Email) {
      this.eventEmitter.emitAsync(sendVerificationCodeToJwtEvent, {
        context,
        user,
        code,
        type: TypeNotification.Email,
      });
    }
  }

  async signUp(context: IContext, signupInput: SignupEmailInput): Promise<AuthResponse> {
    const confirmationCode = generateRandomCode(context, 6);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(signupInput.password, 10);

    const signupInputWithRandomCode = {
      ...signupInput,
      password: hashedPassword,
      confirmationCode,
      type: UserTypes.User,
    };

    const user = await this.userService.partialCreation(context, signupInputWithRandomCode);

    this.eventEmitter.emitAsync(signupEmailEvent, {
      context,
      user,
      confirmationCode,
    });

    const token = this.getJwtToken(user, true);

    return { token, user };
  }

  async generateJWT(user: User) {
    return this.getJwtToken(user, true);
  }

  async ResendCode(context: IContext, email: string): Promise<AuthResponse> {
    const confirmationCode = generateRandomCode(context, 6);

    const user = await this.userService.findOneByEmail(context, email, true);
    await this.userService.update(context, user.id, {
      id: user.id,
      confirmationCode,
    });

    this.eventEmitter.emitAsync(signupEmailEvent, {
      context,
      user,
      confirmationCode,
    });

    const token = this.getJwtToken(user, true);

    return { token, user };
  }

  private async handleFailedAttempt(context: IContext, user: User): Promise<void> {
    const updatedAttempts = user.loginAttempts + 1;
    const now = new Date();

    // Si alcanzó el máximo de intentos
    if (updatedAttempts >= this.MAX_ATTEMPTS) {
      // Incrementar ciclo y resetear intentos
      const updatedCycles = user.attemptsCycles + 1;

      // Si completó el máximo de ciclos, inactivar permanentemente
      if (updatedCycles >= this.MAX_CYCLES) {
        await this.userService.update(context, user.id, {
          id: user.id,
          ...user,
          status: UserStatusTypes.Inactive,
          loginAttempts: 0,
          attemptsCycles: updatedCycles,
          lastFailedAttemptDate: now,
        });
        throw new BadRequestException(`Usuario bloqueado permanentemente por exceder ${this.MAX_CYCLES} ciclos de intentos`);
      }

      // Bloqueo temporal por ciclo no final
      await this.userService.update(context, user.id, {
        id: user.id,
        ...user,
        status: UserStatusTypes.InactiveByAttempts,
        loginAttempts: 0,
        attemptsCycles: updatedCycles,
        lastFailedAttemptDate: now,
      });
      throw new BadRequestException(`Usuario bloqueado temporalmente por ${this.BLOCK_TIME_MINUTES} minutos`);
    }

    // Actualizar intentos fallidos
    await this.userService.update(context, user.id, {
      id: user.id,
      ...user,
      loginAttempts: updatedAttempts,
      lastFailedAttemptDate: now,
    });

    const remainingAttempts = this.MAX_ATTEMPTS - updatedAttempts;
    throw new BadRequestException(`Credenciales inválidas. Le quedan ${remainingAttempts} intentos antes del bloqueo temporal`);
  }

  private async checkBlockStatus(user: User): Promise<void> {
    // if (user.status === UserStatusTypes.Inactive) {
    //   throw new BadRequestException('Usuario inactivo por numero de intentos, contactar con el administrador');
    // }

    if (user.status === UserStatusTypes.InactiveDefinitively) {
      throw new BadRequestException('Usuario inactivo permanentemente');
    }

    if (user.status === UserStatusTypes.InactiveByAttempts) {
      if (!user.lastFailedAttemptDate) {
        throw new BadRequestException('Error en el estado del usuario');
      }

      const blockEndTime = moment(user.lastFailedAttemptDate).add(this.BLOCK_TIME_MINUTES, 'minutes');
      const now = moment();

      // if (now.isBefore(blockEndTime)) {
      //   const remainingMinutes = Math.ceil(moment.duration(blockEndTime.diff(now)).asMinutes());
      //   throw new BadRequestException(`Usuario bloqueado temporalmente. Intente nuevamente en ${remainingMinutes} minutos`);
      // }
    }
  }

  private async resetAttempts(context: IContext, user: User): Promise<void> {
    if (user.loginAttempts > 0 || user.status === UserStatusTypes.InactiveByAttempts) {
      await this.userService.update(context, user.id, {
        id: user.id,
        ...user,
        loginAttempts: 0,
        attemptsCycles: user.status === UserStatusTypes.InactiveByAttempts ? user.attemptsCycles : 0,
        status: UserStatusTypes.Active,
        lastFailedAttemptDate: null,
      });
    }
  }

  private async checkExpiredCredentials(context: IContext, user: User): Promise<void> {
    if (user.credentialsExpirationDate) {
      const now: Moment = moment.tz(this.TZ);
      const expDate: Moment = momentjs(user.credentialsExpirationDate).tz(this.TZ);

      if (!expDate.isValid() || now.isSameOrAfter(expDate) || user.status === UserStatusTypes.InactiveTemporary) {
        throw new BadRequestException('Credenciales expiradas');
      }
    }
  }

  async signIn(context: IContext, signinInput: SigninInput): Promise<AuthResponse> {
    const { email, password } = signinInput;

    const user = await this.userService.findOneBy(context, { where: { email, type: Not(UserTypes.Public) } }, true);

    if (user?.type !== UserTypes.SuperAdmin) {
      // Verificar credenciales expiradas primero
      await this.checkExpiredCredentials(context, user);

      // Si no están expiradas, entonces sí verificamos el estado de bloqueo y los intentos
      await this.checkBlockStatus(user);
    }

    // Verificar credenciales
    const isValidPassword = user.password && (await bcrypt.compareSync(password, user.password));

    if (user.status === UserStatusTypes.Inactive || !isValidPassword) {
      if (user?.type !== UserTypes.SuperAdmin) {
        await this.handleFailedAttempt(context, user);
      }

      throw new BadRequestException('Credenciales inválidas');
    }
    if (user?.type !== UserTypes.SuperAdmin) {
      await this.resetAttempts(context, user);
    }

    let token: string = await this.getJwtToken(user, true);

    return { token, user };
  }

  async signInUserAdmin(user: User, signInAdminInput: SigninAdminInput): Promise<AuthResponse> {
    const { phoneVerification, emailVerification } = user;

    const { verificationTypes } = signInAdminInput;

    const context = { user: undefined };

    let token: string;

    if (!phoneVerification && !emailVerification) {
      token = this.getJwtToken(user, true);
    } else {
      if (phoneVerification && emailVerification && !verificationTypes) throw new BadRequestException('Debe proporcionar un método de verificación');

      const code = generateRandomCode(context, 6);

      if (verificationTypes) {
        if (verificationTypes === VerificationTypes.Phone && !user.phoneNumber) throw new BadRequestException('Debe seleccionar otro método de verificación');

        await this.sendVerificationCode(verificationTypes, context, user, code);
      } else {
        // This validation is performed because there are users who register by e-mail and do not provide a phone.
        if (user.phoneVerification && !user.phoneNumber) throw new BadRequestException('You must select another verification method');

        if (user.phoneVerification && user.phoneNumber) await this.sendVerificationCode(VerificationTypes.Phone, context, user, code);

        if (user.emailVerification) await this.sendVerificationCode(VerificationTypes.Email, context, user, code);
      }

      token = this.getJwtToken(user, false);
    }

    return { token, user };
  }

  async validateUser(context: IContext, id: string): Promise<User> {
    const user = await this.userService.findOne(context, id, true);

    if (user.status === UserStatusTypes.Inactive) throw new UnauthorizedException('El usuario está inactivo');

    delete user.password;

    return user;
  }

  async validateFunctionality(context: IContext, key: string, userId: string): Promise<boolean> {
    return this.userService.hasFunctionality(context, key, userId);
  }

  async validateUserToken(validateTokenInput: ValidateTokenInput): Promise<User> {
    const { token } = validateTokenInput;

    const user = await this.checkToken(token);

    delete user.password;

    return user;
  }

  async approvalJwt(approvalTokenInput: ApprovalTokenInput): Promise<AuthResponse> {
    const { code, token } = approvalTokenInput;

    const user = await this.checkToken(token);

    const checkJwtCode = await this.eventEmitter.emitAsync(checkCodeEvent, {
      context: { user: undefined },
      code,
      user,
      origin: UserKeyOrigin.TwoSteps,
    });

    const checkJwtCodeEv = checkJwtCode[0];

    if (!checkJwtCodeEv) throw new BadRequestException('Código inválido');

    const newToken = this.getJwtToken(user, true);

    return { token: newToken, user };
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user, true);
    return { token, user };
  }

  async sendCodeDoubleVerification(sendDoubleVerificationInput: SendDoubleVerificationInput): Promise<string> {
    const { token, email, phoneNumber } = sendDoubleVerificationInput;

    if ((!email && !phoneNumber) || (email && phoneNumber)) throw new BadRequestException('Debe proporcionar al menos un método de envío del código.');

    const user = await this.checkToken(token);

    const currentUser = {
      ...user,
      email: email ? email : user.email,
      phoneNumber: phoneNumber ? phoneNumber : user.phoneNumber,
    };

    const context = { user: undefined };

    const type = email ? VerificationTypes.Email : VerificationTypes.Phone;

    const code = generateRandomCode(context, 6);

    this.sendVerificationCode(type, context, currentUser, code);

    return 'Código enviado exitosamente';
  }

  async signInByUser({ context, userId }: { context: IContext; userId: string }): Promise<string> {
    const [user] = await this.eventEmitter.emitAsync(findUserByIdEvent, {
      context,
      id: userId,
    });

    // if (user.hasExternalCreation)
    //   throw new ForbiddenException(
    //     sendI18nResponse(
    //       context,
    //       this.i18nService,
    //       this.I18N_SPACE,
    //       "onSignInByUser.hasExternalCreation",
    //       { email: user.email }
    //     )
    //   );

    if (!user.password) throw new UnauthorizedException('El usuario no tiene contraseña configurada');

    if (user.status === UserStatusTypes.Inactive) throw new UnauthorizedException('El usuario está inactivo');

    let token: string;

    token = await this.getJwtTokenWithAuth(context, user);

    return token;
  }

  private async validateAndGetUsers(context: IContext, userIds: string[]): Promise<User[]> {
    const users: User[] = [];

    for (const userId of userIds) {
      const [user] = await this.eventEmitter.emitAsync(getUserByIdEvent, {
        context,
        id: userId,
      });

      if (!(user instanceof User)) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      users.push(user);
    }

    return users;
  }

  private async updateUserCredentials(context: IContext, user: User, credentialsExpirationDate?: Date): Promise<void> {
    const { id } = user;

    if (credentialsExpirationDate) {
      await this.eventEmitter.emitAsync(updateUserEvent, {
        context,
        input: {
          id,
          credentialsExpirationDate,
          status: UserStatusTypes.InactiveTemporary,
          loginAttempts: 0,
          attemptsCycles: 0,
          lastFailedAttemptDate: null,
        },
      });
    }
  }

  async revokeCredential(context: IContext, { userIds, credentialsExpirationDate = moment.tz(this.TZ).toDate() }: RevokeCredentialInput): Promise<User[]> {
    // Validar y obtener usuarios
    const users = await this.validateAndGetUsers(context, userIds);

    // Actualizar credenciales para cada usuario
    await Promise.all(users.map((user) => this.updateUserCredentials(context, user, credentialsExpirationDate)));

    return users;
  }

  @OnEvent(signInWithUserEvent)
  async onSignInByUser({ context, userId }: { context: IContext; userId: string }): Promise<string> {
    return await this.signInByUser({
      context,
      userId,
    });
  }

  @OnEvent(getTokenAuthEvent)
  async onGetTokenAuth({
    context,
    userInput,
    userIn,
    args,
    expirable = true,
  }: {
    context: IContext;
    userInput: CreateTokenInput;
    userIn?: User;
    args?: UserKeyExtraArgs;
    expirable?: boolean;
  }): Promise<string | BadRequestException> {
    return await this.getTokenAuth(context, userInput, userIn, args, expirable);
  }
}
