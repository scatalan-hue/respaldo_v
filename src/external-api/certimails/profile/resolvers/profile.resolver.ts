import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AdminOnly } from '../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../security/auth/utils/crud.utils';
import { Profile } from '../entities/profile.entity';
import { ProfileService, serviceStructure } from '../services/profile.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProfileService,
  create: { name: 'createProfile', decorators: [AdminOnly] },
  update: { name: 'updateProfile', decorators: [AdminOnly] },
  remove: { name: 'removeProfile', decorators: [AdminOnly] },
  findOne: { name: 'profile', decorators: [AdminOnly] },
  findAll: { name: 'profiles', decorators: [AdminOnly] },
});

@Resolver(() => Profile)
export class ProfileResolver extends CrudResolverFrom(resolverStructure) {
  @ResolveField(() => String, { name: 'url' })
  async getUrl(@Parent() profile: Profile, @CurrentContext() context): Promise<String> {
    return process.env.CERTIMAILS_URL + 'WebServices_API.Publicadores.Email.ARequestLogin.aspx?' + profile.externalId;
  }
}
