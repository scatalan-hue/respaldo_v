import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AdminOnly } from '../../../auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../auth/utils/crud.utils';
import { CreateRoleInput } from '../dto/inputs/create-role.input';
import { Role } from '../entities/role.entity';
import { RolesService, serviceStructure } from '../services/roles.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: RolesService,
  remove: {
    name: 'removeRole',
    decorators: [AdminOnly],
  },
  findOne: {
    name: 'role',
    decorators: [AdminOnly],
  },
  findAll: {
    name: 'roles',
    decorators: [AdminOnly],
  },
});

@Resolver(() => Role)
export class RolesResolver extends CrudResolverFrom(resolverStructure) {
  // @Mutation(() => [Role], { name: 'createDefaultRoles' })
  // @SuperAdminOnly()
  // createDefaultRoles(@CurrentContext() context: IContext): Promise<Role[]> {
  //   return this.service.createDefaultRoles(context);
  // }

  @Mutation(() => Role, { name: 'createRole' })
  @AdminOnly()
  async createRole(
    @CurrentContext() context: IContext,
    @Args('createRoleInput')
    createRoleInput: CreateRoleInput,
  ): Promise<Role> {
    return await this.service.createRole(context, createRoleInput);
  }
}
