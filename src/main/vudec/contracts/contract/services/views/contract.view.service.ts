import { Not } from 'typeorm';
import { Response } from 'express';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { sendResponse } from 'src/common/i18n/functions/response';
import { createExcelReportEvent } from 'src/general/documents/document/constants/events.constants';
import { MetadataPagination } from 'src/patterns/crud-pattern/classes/args/metadata-pagination.args';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { LotContractsViewService } from 'src/main/vudec/lots/lot/services/views/lot-contracts.view.service';
import { sendMovementsToSigecEvent } from 'src/main/vudec/movement/constants/events.constants';
import { notifyContractsPendingEvent } from '../../constants/views/events.constants';
import { FindContractViewArgs } from '../../dto/args/find-contract-view.args';
import { ContractView } from '../../entity/views/contract.view.entity';
import { Status } from '../../enum/contract-status.enum';
import { contract_fields } from '../../report/contract-report';

// Define la estructura del servicio indicando la entidad a manejar (ContractView) y los argumentos de búsqueda (FindContractViewArgs)
export const serviceStructure = CrudServiceStructure({
  entityType: ContractView,
  findArgsType: FindContractViewArgs,
});

@Injectable()
export class ContractViewService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly lotContractsViewService: LotContractsViewService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Contract;

  private prepareWhereClause(args?: FindContractViewArgs): void {
    if (!args['where']) args['where'] = {};

    if (args?.organizationId) args['where'].organizationId = { _eq: args.organizationId };
    if (args?.taxpayerId) args['where'].taxpayerId = { _eq: args.taxpayerId };
    if (args?.lotId) args['where'].lotId = { _eq: args.lotId };
  }

  async contractsView(context: IContext, args?: FindContractViewArgs): Promise<ContractView[]> {
    this.prepareWhereClause(args);

    if (!args?.lotId) {
      return await this.findAll(context, args);
    }

    return await this.lotContractsViewService.findAll(context, args);
  }

  async contractsViewCount(context: IContext, args?: FindContractViewArgs): Promise<MetadataPagination> {
    this.prepareWhereClause(args);

    if (!args?.lotId) {
      return await this.Count(context, args);
    }

    return await this.lotContractsViewService.Count(context, args);
  }

  async notifyContractsPending(context: IContext): Promise<void> {
    const contracts = await this.find(context, { where: { status: Not(Status.Send) } });

    for (const contract of contracts) {
      await this.eventEmitter.emitAsync(sendMovementsToSigecEvent, {
        context,
        contractId: contract.id,
      });
    }
  }

  async contractsReport(context: IContext, args: FindContractViewArgs, res: Response) {
    await this.prepareWhereClause(args);

    const contracts: ContractView[] = await this.findAll(context, args);

    const [workbook] = await this.eventEmitter.emitAsync(createExcelReportEvent, {
      context,
      data: contracts?.map((contract) => ({
        ...contract,
        status: sendResponse(context, this.I18N_SPACE, `ContractStatus.${contract.status}`),
      })),
      fields: contract_fields,
      fileName: `reporte_contratos`,
      sheetName: 'Movimientos',
      res,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_contratos.xlsx"');

    await workbook.xlsx.write(res);
    res.status(HttpStatus.OK).end();
  }

  @OnEvent(notifyContractsPendingEvent)
  async onNotifyContractsPending({ context }: { context: IContext }): Promise<void> {
    await this.notifyContractsPending(context);
  }
}
