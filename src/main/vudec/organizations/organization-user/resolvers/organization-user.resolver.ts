import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';

import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { OrganizationUser } from '../entities/organization-user.entity';
import { OrganizationUserService, serviceStructure } from '../services/organization-user.service';

export const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: OrganizationUserService,
  create: { name: 'createOrganizationUser', decorators: [AnyUser] },
  findOne: { name: 'organizationUser', decorators: [AnyUser] },
  findAll: { name: 'organizationUsers', decorators: [AnyUser] },
});

@Resolver(() => OrganizationUser)
export class OrganizationUserResolver extends CrudResolverFrom(resolverStructure) {}
