import { Args, Query, Resolver } from '@nestjs/graphql';
import { MetadataPagination } from '../../../../patterns/crud-pattern/classes/args/metadata-pagination.args';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../security/auth/utils/crud.utils';
import { FindUserViewArgs } from '../../dto/args/find-user-view.args';
import { UserView } from '../../entities/views/user.view.entity';
import { UserViewService, serviceStructure } from '../../services/views/user.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: UserViewService,
});

@Resolver(() => UserView)
export class UserViewResolver extends CrudResolverFrom(resolverStructure) {
  @AnyUser()
  @Query(() => [UserView], { name: 'usersView' })
  async usersView(@CurrentContext() context: IContext, @Args(undefined, { type: () => FindUserViewArgs }) args): Promise<UserView[]> {
    return await this.service.usersView(context, args);
  }

  @AnyUser()
  @Query(() => MetadataPagination, { name: 'usersViewCount' })
  async Count(@CurrentContext() context: IContext, @Args(undefined, { type: () => FindUserViewArgs }) args): Promise<MetadataPagination> {
    return await this.service.usersViewCount(context, args);
  }
}
