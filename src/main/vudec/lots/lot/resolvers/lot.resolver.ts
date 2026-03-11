import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';

import { Mutation, Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Public } from 'src/security/auth/decorators/public.decorator';
import { CurrentContext } from '../../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { ExternalApiKey } from '../../../../../security/decorators/external-api-key.decorator';
import { FindLotArgs } from '../dto/args/find-lot.args';
import { Lot } from '../entity/lot.entity';
import { LotService, serviceStructure } from '../services/lot.services';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: LotService,
  create: { name: 'createLot', decorators: [AnyUser] },
  findOne: { name: 'lot', decorators: [Public] },
  findAll: { name: 'lots', decorators: [Public] },
  findArgsType: FindLotArgs,
});

@Resolver(() => Lot)
export class LotResolver extends CrudResolverFrom(resolverStructure) {
  @Mutation(() => Lot, { name: 'findOrCreateDailyLot' })
  @AnyUser()
  @ExternalApiKey()
  async findOrCreateDailyLot(@CurrentContext() context: IContext): Promise<Lot> {
    return this.service.findOrCreateDailyLot(context);
  }
}
