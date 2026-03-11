import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { createExcelReportEvent, createExcelReportUrlEvent } from '../../../../../../general/documents/document/constants/events.constants';
import { IContext } from '../../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { Product } from '../../../../product/entities/products.entity';
import { FindOrganizationViewArgs } from '../../dto/args/find-organization-view.args';
import { OrganizationView } from '../../entity/views/organization.view.entity';
import { organization_fields } from '../../report/organization-report';

export const serviceStructure = CrudServiceStructure({
  entityType: OrganizationView,
  findArgsType: FindOrganizationViewArgs,
});

@Injectable()
export class OrganizationViewService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async organizationsReport(context: IContext, res: Response) {
    const organizations: OrganizationView[] = await this.find(context);

    const [workbook] = await this.eventEmitter.emitAsync(createExcelReportEvent, {
      context,
      data: organizations,
      fields: organization_fields,
      fileName: `reporte_organizaciones`,
      sheetName: 'Organizaciones',
      res,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_organizaciones.xlsx"');

    await workbook.xlsx.write(res);
    res.status(HttpStatus.OK).end();
  }

  async organizationProducts(context: IContext, organizationView: OrganizationView): Promise<Product[]> {
    const currentOrganization = await this.findOne(context, organizationView.id, false);

    const organizationProducts = (await currentOrganization?.organizationProducts) ?? [];

    const products = await Promise.all(organizationProducts.map(async (orgProduct) => orgProduct.product));

    return products;
  }
}
