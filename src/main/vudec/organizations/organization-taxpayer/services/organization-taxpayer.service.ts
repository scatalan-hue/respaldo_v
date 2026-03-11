import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../../common/i18n/functions/response';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { findTaxpayerByIdEvent } from '../../../taxpayer/constants/events.constants';
import { Taxpayer } from '../../../taxpayer/entity/taxpayer.entity';
import { findOrganizationByIdEvent } from '../../organization/constants/events.constants';
import { Organization } from '../../organization/entity/organization.entity';
import { CreateOrganizationTaxpayerInput } from '../dto/inputs/create-organization-taxpayer.input';
import { UpdateOrganizationTaxpayerInput } from '../dto/inputs/update-organization-taxpayer.input';
import { OrganizationTaxpayer } from '../entities/organization-taxpayer.entity';
import { findOrCreateOrganizationTaxpayerEvent } from '../constants/events.constants';

export const serviceStructure = CrudServiceStructure({
  entityType: OrganizationTaxpayer,
  createInputType: CreateOrganizationTaxpayerInput,
  updateInputType: UpdateOrganizationTaxpayerInput,
});

@Injectable()
export class OrganizationTaxpayerService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.OrganizationTaxpayer;

  async beforeMutation(
    context: IContext,
    repository: Repository<OrganizationTaxpayer>,
    entity: OrganizationTaxpayer,
    input: CreateOrganizationTaxpayerInput | UpdateOrganizationTaxpayerInput,
    type: string,
  ): Promise<OrganizationTaxpayer> {
    const { organizationId, taxpayerId } = input;

    if (taxpayerId) {
      const [taxpayer] = await this.eventEmitter.emitAsync(findTaxpayerByIdEvent, {
        context,
        id: taxpayerId,
      });

      if (!taxpayer && !(taxpayer instanceof Taxpayer))
        throw new NotFoundException(
          sendResponse(context, this.I18N_SPACE, 'beforeMutation.taxpayer', {
            taxpayerId,
          }),
        );

      entity.taxpayer = taxpayer;
    }

    if (organizationId) {
      const [organization] = await this.eventEmitter.emitAsync(findOrganizationByIdEvent, {
        context,
        id: organizationId,
      });

      if (!organization && !(organization instanceof Organization))
        throw new NotFoundException(
          sendResponse(context, this.I18N_SPACE, 'beforeMutation.organization', {
            organizationId,
          }),
        );

      entity.organization = organization;
    }

    if (type === 'create') {
      const organizationTaxpayer = await this.findOneBy(context, {
        where: {
          organization: {
            id: organizationId,
          },
          taxpayer: {
            id: taxpayerId,
          },
        },
      });

      if (organizationTaxpayer) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.organizationTaxpayer'));
    }

    return entity;
  }

  async beforeCreate(
    context: IContext,
    repository: Repository<OrganizationTaxpayer>,
    entity: OrganizationTaxpayer,
    createInput: CreateOrganizationTaxpayerInput,
  ): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, createInput, 'create');
  }

  async beforeUpdate(
    context: IContext,
    repository: Repository<OrganizationTaxpayer>,
    entity: OrganizationTaxpayer,
    updateInput: UpdateOrganizationTaxpayerInput,
  ): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, updateInput, 'update');
  }

  async findOrCreateOrganizationTaxpayer(context: IContext, input: CreateOrganizationTaxpayerInput): Promise<OrganizationTaxpayer> {
    const { organizationId, taxpayerId } = input;

    const organizationTaxpayer = await this.findOneBy(context, {
      where: {
        organization: {
          id: organizationId,
        },
        taxpayer: {
          id: taxpayerId,
        },
      },
    });

    if (organizationTaxpayer) return organizationTaxpayer;
    else return await this.create(context, input as CreateOrganizationTaxpayerInput);
  }

  @OnEvent(findOrCreateOrganizationTaxpayerEvent, { suppressErrors: false })
  async onFindOrCreateOrganizationTaxpayer({ context, input }: { context: IContext; input: CreateOrganizationTaxpayerInput }): Promise<OrganizationTaxpayer> {
    return await this.findOrCreateOrganizationTaxpayer(context, input);
  }
}
