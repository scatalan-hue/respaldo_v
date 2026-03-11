import { Resolver } from '@nestjs/graphql';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { OrganizationProductService, serviceStructure } from '../services/organization-product.service';
import { OrganizationProduct } from '../entities/organization-product.entity';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';

export const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: OrganizationProductService,
  create: { name: 'createOrganizationProduct', decorators: [AnyUser] },
  findOne: { name: 'organizationProduct', decorators: [AnyUser] },
  findAll: { name: 'organizationProducts', decorators: [AnyUser] },
});

@Resolver(() => OrganizationProduct)
export class OrganizationProductResolver extends CrudResolverFrom(resolverStructure) {}
