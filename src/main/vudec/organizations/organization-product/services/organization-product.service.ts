import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../../common/i18n/functions/response';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { findProductByIdEvent } from '../../../product/constants/events.constants';
import { findOrganizationByIdEvent } from '../../organization/constants/events.constants';
import {
  createOrFindOrganizationProductEvent,
  createOrganizationProductEvent,
  findOrganizationProductByIdEvent,
  findOrganizationProductByKeyEvent,
  findOrganizationProductEvent,
} from '../constants/events.constants';
import { FindOrganizationProductsArgs } from '../dto/args/find-organization-products.args';
import { CreateOrganizationProductInput } from '../dto/inputs/create-organization-product.input';
import { UpdateOrganizationProductInput } from '../dto/inputs/update-organization-product.input';
import { OrganizationProduct } from '../entities/organization-product.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: OrganizationProduct,
  createInputType: CreateOrganizationProductInput,
  updateInputType: UpdateOrganizationProductInput,
  findArgsType: FindOrganizationProductsArgs,
});

@Injectable()
export class OrganizationProductService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.OrganizationProduct;

  async beforeMutation(
    context: IContext,
    repository: Repository<OrganizationProduct>,
    entity: OrganizationProduct,
    input: CreateOrganizationProductInput | UpdateOrganizationProductInput,
    type: string,
  ): Promise<OrganizationProduct> {
    const { organizationId, productId } = input;

    if (productId) {
      const [product] = await this.eventEmitter.emitAsync(findProductByIdEvent, {
        context,
        id: productId,
      });

      if (!product)
        throw new NotFoundException(
          sendResponse(context, this.I18N_SPACE, 'beforeMutation.product', {
            id: productId,
          }),
        );

      entity.product = product;
    }

    if (organizationId) {
      const [organization] = await this.eventEmitter.emitAsync(findOrganizationByIdEvent, {
        context,
        id: organizationId,
      });

      if (!organization) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.organization', { id: organizationId }));

      entity.organization = organization;
    }

    if (type === 'create') {
      const organizationProduct = await this.findOneBy(context, {
        where: {
          organization: { id: organizationId },
          product: { id: productId },
        },
      });

      if (organizationProduct) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.organizationProduct'));
    }

    return entity;
  }

  async beforeCreate(
    context: IContext,
    repository: Repository<OrganizationProduct>,
    entity: OrganizationProduct,
    createInput: CreateOrganizationProductInput,
  ): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, createInput, 'create');

    entity.key = await bcrypt.hash(new Date().toISOString(), 10);
  }

  async beforeUpdate(
    context: IContext,
    repository: Repository<OrganizationProduct>,
    entity: OrganizationProduct,
    updateInput: UpdateOrganizationProductInput,
  ): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, updateInput, 'update');
  }

  async findOrCreate(context: IContext, input: CreateOrganizationProductInput, create: boolean): Promise<OrganizationProduct> {
    let organizationProduct;

    organizationProduct = await this.findOneBy(context, {
      where: {
        organization: { id: input.organizationId },
        product: { id: input.productId },
      },
    });

    if (!organizationProduct && create) return await this.create(context, input as CreateOrganizationProductInput);

    return organizationProduct;
  }

  @OnEvent(createOrganizationProductEvent)
  async onCreateOrganizationProduct({ context, input }: { context: IContext; input: CreateOrganizationProductInput }): Promise<OrganizationProduct> {
    return await this.create(context, input as CreateOrganizationProductInput);
  }

  @OnEvent(createOrFindOrganizationProductEvent)
  async onCreateOrFindOrganizationProduct({ context, input }: { context: IContext; input: CreateOrganizationProductInput }): Promise<OrganizationProduct> {
    return await this.findOrCreate(context, input as CreateOrganizationProductInput, true);
  }

  @OnEvent(findOrganizationProductEvent, { suppressErrors: false })
  async onFindOrganizationProduct({ context, organizationId, productId }: { context: IContext; organizationId: string; productId: string }): Promise<OrganizationProduct> {
    return await this.findOneBy(context, { where: { organization: { id: organizationId }, product: { id: productId } } }, true);
  }

  @OnEvent(findOrganizationProductByKeyEvent)
  async onFindOrganizationProductByKey({ context, key }: { context: IContext; key: string }): Promise<OrganizationProduct> {
    return await this.findOneBy(context, { where: { key } });
  }
}
