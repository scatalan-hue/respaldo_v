import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Organization } from '../../../main/vudec/organizations/organization/entity/organization.entity';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Public } from '../../auth/decorators/public.decorator';
import { AdminOnly, AnyUser } from '../../auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../auth/utils/crud.utils';
import { RoleFxAndUrlsResponse } from '../../roles/role/dto/inputs/create-and-remove-role-fx.input';
import { Role } from '../../roles/role/entities/role.entity';
import { CodeRecoverPasswordInput } from '../dto/inputs/code-recover-password.input';
import { RecoveryPasswordInput } from '../dto/inputs/recovery-password.input';
import { SendEmailRecoveryPasswordInput } from '../dto/inputs/send-recovery-password.input';
import { UpdatePasswordInput } from '../dto/inputs/update-password.input';
import { UpdateUserInformationInput } from '../dto/inputs/update-user-information.input';
import { UpdateUserPasswordInput } from '../dto/inputs/update-user-password.input';
import { ResponseEmailRecoveryPasswordModel } from '../dto/models/response-email-recovery-password.model';
import { User } from '../entities/user.entity';
import { UsersService, serviceStructure } from '../services/users.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: UsersService,
  create: {
    name: 'createUser',
    decorators: [AdminOnly],
  },
  update: {
    name: 'updateUser',
    decorators: [AdminOnly],
  },
  remove: {
    name: 'removeUser',
    decorators: [AdminOnly],
  },
  findOne: {
    name: 'user',
    decorators: [AnyUser],
  },
  findAll: {
    name: 'users',
    decorators: [AnyUser],
  },
});

@Resolver((of) => User)
export class UsersResolver extends CrudResolverFrom(resolverStructure) {
  @Mutation(() => User)
  @Public()
  resetSuperAdmin(@CurrentContext() context: IContext) {
    return this.service.resetSuperAdmin(context);
  }

  @Mutation(() => User, { name: 'updatePassword' })
  @Public()
  async updatePassword(@CurrentContext() context: IContext, @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordInput): Promise<User> {
    return await this.service.updatePassword(context, updatePasswordInput);
  }

  @Mutation(() => User, { name: 'updateUserInformation' })
  @AnyUser()
  updateUserInformation(
    @CurrentContext() context: IContext,
    @Args('updateUserInformationInput')
    updateUserInformationInput: UpdateUserInformationInput,
  ): Promise<User> {
    return this.service.updateUserInformation(context, updateUserInformationInput);
  }

  @Mutation(() => User, { name: 'updateUserPassword' })
  @AnyUser()
  updateUserPassword(
    @CurrentContext() context: IContext,
    @Args('updateUserPasswordInput')
    updateUserPasswordInput: UpdateUserPasswordInput,
  ): Promise<User> {
    return this.service.updateUserPassword(context, updateUserPasswordInput);
  }

  @Mutation(() => User, { name: 'recoveryPassword' })
  @Public()
  updatePasswordByRecoveryPasswordEmail(
    @CurrentContext() context: IContext,
    @Args('recoveryPasswordInput') recoveryPasswordInput: RecoveryPasswordInput,
  ): Promise<User> {
    return this.service.updatePasswordByRecoveryPasswordEmail(context, recoveryPasswordInput);
  }

  @Query(() => String, { name: 'codeRecoverPassword' })
  @Public()
  codeRecoverPassword(
    @CurrentContext() context: IContext,
    @Args('codeRecoverPasswordInput')
    codeRecoverPasswordInput: CodeRecoverPasswordInput,
  ): Promise<string> {
    return this.service.codeRecoverPassword(context, codeRecoverPasswordInput);
  }

  @Mutation(() => ResponseEmailRecoveryPasswordModel, { name: 'sendEmailRecoveryPassword' })
  @Public()
  sendEmailRecoveryPassword(
    @CurrentContext() context: IContext,
    @Args('sendEmailRecoveryPasswordInput') sendEmailRecoveryPasswordInput: SendEmailRecoveryPasswordInput,
  ): Promise<{ expCode: number }> {
    return this.service.sendEmailRecoveryPassword(context, sendEmailRecoveryPasswordInput);
  }

  @ResolveField(() => [Role], { name: 'roles', nullable: true })
  roles(@Parent() user: User, @CurrentContext() context: IContext): Promise<Role[]> {
    return this.service.getRoles(context, user);
  }

  @ResolveField(() => [RoleFxAndUrlsResponse], {
    name: 'permissions',
    nullable: true,
  })
  async permissions(@Parent() user: User, @CurrentContext() context: IContext): Promise<RoleFxAndUrlsResponse[]> {
    return await this.service.getPermissions(context, user);
  }

  @ResolveField(() => String, { name: 'fullName' })
  fullName(@Parent() user: User, @CurrentContext() context: IContext): Promise<string> {
    return this.service.fullName(context, user);
  }

  @ResolveField(() => [Organization], { name: 'organizations' })
  organizations(@Parent() user: User, @CurrentContext() context: IContext): Promise<Organization[]> {
    return this.service.userOrganizations(context, user);
  }
}
