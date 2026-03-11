import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../../security/auth/utils/crud.utils';
import { OrganizationView } from '../../entity/views/organization.view.entity';
import { OrganizationViewService, serviceStructure } from '../../services/views/organization.view.service';
import { IContext } from '../../../../../../patterns/crud-pattern/interfaces/context.interface';
import { Product } from '../../../../product/entities/products.entity';
import { CurrentContext } from '../../../../../../patterns/crud-pattern/decorators/current-context.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: OrganizationViewService,
  findAll: {
    name: 'organizationsView',
    decorators: [AnyUser],
  },
});

@Resolver(() => OrganizationView)
export class OrganizationViewResolver extends CrudResolverFrom(resolverStructure) {
  @ResolveField(() => [Product], { name: 'products', nullable: true })
  products(@Parent() organizationView: OrganizationView, @CurrentContext() context: IContext): Promise<Product[]> {
    return this.service.organizationProducts(context, organizationView);
  }
}
