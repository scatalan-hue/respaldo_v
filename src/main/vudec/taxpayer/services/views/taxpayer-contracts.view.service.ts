import { Injectable } from '@nestjs/common';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FindTaxpayerContractsViewArgs } from '../../dto/args/find-taxpayer-contracts.args';
import { TaxpayerContractsView } from '../../entity/views/taxpayer-contracts.view.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: TaxpayerContractsView,
  findArgsType: FindTaxpayerContractsViewArgs,
});

@Injectable()
export class TaxpayerContractsViewService extends CrudServiceFrom(serviceStructure) {}
