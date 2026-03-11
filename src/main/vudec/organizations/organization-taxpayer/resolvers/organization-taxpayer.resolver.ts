import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';

import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { OrganizationTaxpayer } from '../entities/organization-taxpayer.entity';
import { OrganizationTaxpayerService, serviceStructure } from '../services/organization-taxpayer.service';

export const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: OrganizationTaxpayerService,
  findOne: { name: 'organizationTaxpayer', decorators: [AnyUser] },
  findAll: { name: 'organizationTaxpayers', decorators: [AnyUser] },
});

@Resolver(() => OrganizationTaxpayer)
export class OrganizationTaxpayerResolver extends CrudResolverFrom(resolverStructure) {}
