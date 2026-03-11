import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';
import { FindMovementViewArgs } from '../../dto/args/find-movement-view.args';
import { MovementsViewTotalsInput } from '../../dto/inputs/movement-view-total.input';
import { MovementsView } from '../../entity/views/movement.view.entity';
import { MovementViewService, serviceStructure } from '../../services/views/movement.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: MovementViewService,
  findAll: {
    name: 'movementsView',
    decorators: [AnyUser],
  },
});

@Resolver(() => MovementsView)
export class MovementViewResolver extends CrudResolverFrom(resolverStructure) {
  @AnyUser()
  @Query(() => MovementsViewTotalsInput, { name: 'movementsViewTotals' })
  async movementsViewTotals(
    @CurrentContext() context: IContext,
    @Args(undefined, { type: () => FindMovementViewArgs }) args,
  ): Promise<MovementsViewTotalsInput> {
    const response = await this.service.movementsViewTotals(context, args);
    return response;
  }
}
