import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../../security/auth/utils/crud.utils';
import { LotView } from '../../entity/views/lot.view.entity';
import { LotViewService, serviceStructure } from '../../services/views/lot.view.service';
import { Organization } from 'src/main/vudec/organizations/organization/entity/organization.entity';
import { findOrganizationByIdEvent } from 'src/main/vudec/organizations/organization/constants/events.constants';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: LotViewService,
  findAll: {
    name: 'lotsView',
    decorators: [AnyUser],
  }
});

@Resolver(() => LotView)
export class LotViewResolver extends CrudResolverFrom(resolverStructure) {

  @ResolveField(() => Organization, { name: 'organization' })
  async organization(@Parent() lotView: LotView, @CurrentContext() context: IContext): Promise<Organization> {
    return await this.service.organizationLotsView(context, lotView.organizationId);
  }

}
