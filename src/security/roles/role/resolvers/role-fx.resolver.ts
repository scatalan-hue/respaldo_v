import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AdminOnly } from '../../../auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../auth/utils/crud.utils';
import { CreateAndRemoveRoleFxInput } from '../dto/inputs/create-and-remove-role-fx.input';
import { RoleFx } from '../entities/role-fx.entity';
import { RolesFxService, serviceStructure } from '../services/roles-fx.service';
import { RoleFxUrl } from '../../role-fx-url/entities/role-fx-url.entity';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: RolesFxService,
  findOne: {
    name: 'roleFx',
    decorators: [AdminOnly],
  },
  findAll: {
    name: 'rolesFx',
    decorators: [AdminOnly],
  },
});

@Resolver(() => RoleFx)
export class RoleFxResolver extends CrudResolverFrom(resolverStructure) {
  @Mutation(() => [RoleFx], { name: 'replaceAllRolesFx' })
  @AdminOnly()
  async replaceAllRolesFx(
    @CurrentContext() context: IContext,
    @Args('replaceAllRolesFxInput') replaceAllRolesFxInput: CreateAndRemoveRoleFxInput,
  ): Promise<RoleFx[]> {
    return this.service.replaceAllRolesFx(context, replaceAllRolesFxInput);
  }

  // @ResolveField(() => RoleFxUrl, { name: 'roleFxUrls' })
  // async getUrl(@Parent() roleFx: RoleFx, @CurrentContext() context): Promise<String> {
  //   return
  // }
}
