import { SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CrudServiceStructure } from '../../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FindLotViewArgs } from '../../dto/args/find-lot-view.args';
import { LotView } from '../../entity/views/lot.view.entity';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { findOrganizationByIdEvent } from 'src/main/vudec/organizations/organization/constants/events.constants';
import { Organization } from 'src/main/vudec/organizations/organization/entity/organization.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: LotView,
  findArgsType: FindLotViewArgs,
});

@Injectable()
export class LotViewService extends CrudServiceFrom(serviceStructure) {

  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async getQueryBuilder(context: IContext, args?: FindLotViewArgs): Promise<SelectQueryBuilder<LotView>> {
    const qb = await super.getQueryBuilder(context, args);

    if (!args?.['where']?.['organizationParentId']?._eq && context?.organization) {
      qb.andWhere(`(aa.organizationId = '${context.organization.id}')`);
    }

    return qb;
  }

  async organizationLotsView(context: IContext, organizationId: string): Promise<Organization> {
    const [organization] = await this.eventEmitter.emitAsync(findOrganizationByIdEvent, {
      context,
      id: organizationId,
    }) as [Organization];
    
    return organization;
  }
}
