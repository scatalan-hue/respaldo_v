import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { createExcelReportEvent } from '../../../../../general/documents/document/constants/events.constants';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FindTaxpayerViewArgs } from '../../dto/args/find-taxpayer-view.args';
import { TaxpayerView } from '../../entity/views/taxpayer.view.entity';
import { taxpayer_fields } from '../../report/taxpayer-report';

export const serviceStructure = CrudServiceStructure({
  entityType: TaxpayerView,
  findArgsType: FindTaxpayerViewArgs,
});

@Injectable()
export class TaxpayerViewService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Taxpayer;

  async taxpayersReport(context: IContext, args: FindTaxpayerViewArgs, res: Response) {
    const taxpayers: TaxpayerView[] = await this.findAll(context, args);

    const [workbook] = await this.eventEmitter.emitAsync(createExcelReportEvent, {
      context,
      data: taxpayers,
      fields: taxpayer_fields,
      fileName: `reporte_terceros`,
      sheetName: 'Movimientos',
      res,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_terceros.xlsx"');

    await workbook.xlsx.write(res);
    res.status(HttpStatus.OK).end();
  }
}
