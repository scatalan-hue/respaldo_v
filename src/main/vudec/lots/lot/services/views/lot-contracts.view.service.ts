import { Injectable } from '@nestjs/common';
import { IContext } from '../../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FindLotContractsViewArgs } from '../../dto/args/find-lot-contracts.args';
import { LotContractsView } from '../../entity/views/lot-contracts.view.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: LotContractsView,
  findArgsType: FindLotContractsViewArgs,
});

@Injectable()
export class LotContractsViewService extends CrudServiceFrom(serviceStructure) {
  async lotContractView(context: IContext, args?: FindLotContractsViewArgs): Promise<LotContractsView> {
    return this.findOneBy(context, {
      where: {
        ...(args?.lotId && { lotId: args.lotId }),
        ...(args?.contractId && { contractId: args.contractId }),
        ...(args?.taxpayerId && { taxpayerId: args.taxpayerId }),
      },
    });
  }
}
