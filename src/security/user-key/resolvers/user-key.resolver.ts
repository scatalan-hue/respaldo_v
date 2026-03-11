import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Public } from '../../auth/decorators/public.decorator';
import { CrudResolverStructure } from '../../auth/utils/crud.utils';
import { UserKey } from '../entities/user-key.entity';
import { UsersKeyService, serviceStructure } from '../services/users-key.service';
import { AuthResultToken } from '../types/user-key.type';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: UsersKeyService,
});

@Resolver(() => UserKey)
export class UserKeyResolver extends CrudResolverFrom(resolverStructure) {
  @Query(() => AuthResultToken, { name: 'authByToken' })
  @Public()
  async authByToken(@CurrentContext() context: IContext, @Args('authToken') authToken: string): Promise<AuthResultToken> {
    return await this.service.authByCode(context, authToken);
  }
}
