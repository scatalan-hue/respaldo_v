import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';
import { FindMovementPaymentViewArgs } from '../../dto/args/find-movement-payment.args';
import { MovementsPaymentViewTotalsInput } from '../../dto/inputs/movement-payment-view-total.input';
import { MovementPaymentView } from '../../entity/views/movement-payment.view.entity';
import { MovementsView } from '../../entity/views/movement.view.entity';
import { MovementPaymentViewService, serviceStructure } from '../../services/views/movement-payment.view.service';
import { FindMovementPaymentDetailsViewArgs } from '../../dto/args/find-movement-payment-details.args';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: MovementPaymentViewService,
  findAll: {
    name: 'movementPaymentsView',
    decorators: [AnyUser],
  },
});

@Resolver(() => MovementPaymentView)
export class MovementPaymentViewResolver extends CrudResolverFrom(resolverStructure) {
  @ResolveField(() => [MovementsView], { name: 'movements' })
  async movements(@Parent() movement: MovementPaymentView, @CurrentContext() context: IContext): Promise<MovementsView[]> {
    return await this.service.movements(context, movement);
  }

  @AnyUser()
  @Query(() => MovementsPaymentViewTotalsInput, { name: 'movementPaymentsViewTotals' })
  async movementPaymentsViewTotals(
    @CurrentContext() context: IContext,
    @Args(undefined, { type: () => FindMovementPaymentViewArgs }) args,
  ): Promise<MovementsPaymentViewTotalsInput> {
    return await this.service.movementPaymentsViewTotals(context, args);
  }

  @AnyUser()
  @Query(() => [MovementsView], { name: 'movementPaymentDetailsView' })
  async movementPaymentDetailsView(
    @CurrentContext() context: IContext,
    @Args(undefined, { type: () => FindMovementPaymentDetailsViewArgs }) args,
  ): Promise<MovementsView[]> {
    return await this.service.movementPaymentDetailsView(context, args);
  }
}
