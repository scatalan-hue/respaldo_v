import { SelectQueryBuilder } from 'typeorm';
import { Response } from 'express';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../../common/i18n/functions/response';
import { createExcelReportEvent } from '../../../../../general/documents/document/constants/events.constants';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FindMovementViewArgs } from '../../dto/args/find-movement-view.args';
import { MovementsViewTotalsInput } from '../../dto/inputs/movement-view-total.input';
import { MovementsView } from '../../entity/views/movement.view.entity';
import { movement_fields } from '../../report/movement-report';

export const serviceStructure = CrudServiceStructure({
  entityType: MovementsView,
  findArgsType: FindMovementViewArgs,
});

@Injectable()
export class MovementViewService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Movement;

  async getQueryBuilder(context: IContext, args?: FindMovementViewArgs): Promise<SelectQueryBuilder<MovementsView>> {
    const qb = await super.getQueryBuilder(context, args);

    if (args?.contractId) {
      qb.andWhere(`(aa.contractId = '${args?.contractId}')`);
    }

    if (args?.lotId) {
      qb.andWhere(`(aa.lotId = '${args?.lotId}')`);
    }

    return qb;
  }

  async movementsViewTotals(context: IContext, args?: FindMovementViewArgs): Promise<MovementsViewTotalsInput> {
    if (!args['where']) args['where'] = {};

    args['where'].isRevert = { _eq: false };

    const movements: MovementsView[] = await this.findAll(context, args);

    const total = movements.reduce(
      (acc, movement) => {
        acc.totalLiquidated += movement.liquidatedValue;
        acc.totalPaid += movement.paidValue;
        return acc;
      },
      { totalLiquidated: 0, totalPaid: 0 },
    );

    return total;
  }

  async movementsReport(context: IContext, args: FindMovementViewArgs, res: Response) {
    const movements: MovementsView[] = await this.findAll(context, args);

    const [workbook] = await this.eventEmitter.emitAsync(createExcelReportEvent, {
      context,
      data: movements?.map((movement) => ({
        ...movement,
        type: sendResponse(context, this.I18N_SPACE, `TypeMovement.${movement.type}`),
        status: sendResponse(context, this.I18N_SPACE, `MovementStatus.${movement.status}`),
      })),
      fields: movement_fields,
      fileName: `reporte_movimientos`,
      sheetName: 'Movimientos',
      res,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_movimientos.xlsx"');

    await workbook.xlsx.write(res);
    res.status(HttpStatus.OK).end();
  }
}
