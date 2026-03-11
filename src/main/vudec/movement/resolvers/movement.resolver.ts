import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';

import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Public } from 'src/security/auth/decorators/public.decorator';
import { FindMovementArgs } from '../dto/args/find-movement.args';
import { Movement } from '../entity/movement.entity';
import { MovementService, serviceStructure } from '../services/movement.service';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: MovementService,
  findOne: { name: 'movement', decorators: [Public] },
  findAll: { name: 'movements', decorators: [Public] },
  findArgsType: FindMovementArgs,
});

@Resolver(() => Movement)
export class MovementResolver extends CrudResolverFrom(resolverStructure) {
  /*@Mutation((returns) => Movement, { name: 'sendMovement' })
  @Public()
  async sendMovement(@Args({ name: 'movId', type: () => String }) movId: string, @CurrentContext() context: IContext) {
    await this.service.sendMovementSigec(context, movId);
  }*/

  @Mutation((returns) => String, { name: 'sendMovementsToSigec' })
  @AnyUser()
  async sendMovementsToSigec(
    @Args({ name: 'contractId', type: () => String }) contractId: string,
    @Args({ name: 'lotId', type: () => String, nullable: true }) lotId: string,
    @Args({ name: 'taxpayerId', type: () => String, nullable: true }) taxpayerId: string,
    @CurrentContext() context: IContext,
  ): Promise<string> {
    return await this.service.sendMovementsToSigec(context, contractId, lotId);
  }
}
