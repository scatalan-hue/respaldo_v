import { Injectable, NotFoundException } from '@nestjs/common';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';

import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { I18N_SPACE } from '../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../common/i18n/functions/response';
import { FileInfo } from '../../../../general/files/entities/file-info.entity';
import { FilesService } from '../../../../general/files/services/files.service';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { findOrCreateProductEvent, findOrCreateProductsEvent, findProductByIdEvent } from '../constants/events.constants';
import { FindProductsArgs } from '../dto/args/find-products.args';
import { CreateProductInput } from '../dto/inputs/create-products.input';
import { UpdateProductInput } from '../dto/inputs/update-products.input';
import { Product } from '../entities/products.entity';
import { ProductStatus } from '../enum/product-status.enum';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductInput,
  updateInputType: UpdateProductInput,
  findArgsType: FindProductsArgs,
});

@Injectable()
export class ProductService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly filesService: FilesService) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Product;

  private async findOrCreate(context: IContext, createInput: CreateProductInput): Promise<Product> {
    let product;

    if (createInput?.name)
      product = await this.findOneBy(context, {
        where: { name: createInput?.name },
      });

    if (!product) return await this.create(context, createInput);
    else return product;
  }

  async findOrCreateProducts(context: IContext, productInputs: CreateProductInput[]): Promise<Product[]> {
    const products = await Promise.all(productInputs.map((productInput) => this.findOrCreate(context, productInput)));

    return products;
  }

  async beforeMutation(context: IContext, repository: Repository<Product>, entity: Product, input: CreateProductInput | UpdateProductInput): Promise<Product> {
    if (input.logoInput) {
      const logo = await this.filesService.findOrCreateFileBySource(context, input.logoInput);

      if (!logo && !(logo instanceof FileInfo)) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.logo'));

      entity.logo = logo;
    }

    return entity;
  }

  async beforeCreate(context: IContext, repository: Repository<Product>, entity: Product, createInput: CreateProductInput): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, createInput);

    // entity.key = await bcrypt.hash(new Date().toISOString(), 10);
    entity.status = ProductStatus.Active;
  }

  @OnEvent(findOrCreateProductsEvent)
  async onFindOrCreateProductsEvent({ context, productInputs }: { context: IContext; productInputs: CreateProductInput[] }): Promise<Product[]> {
    return await this.findOrCreateProducts(context, productInputs);
  }

  @OnEvent(findOrCreateProductEvent)
  async onFindOrCreateProductEvent({ context, productInput }: { context: IContext; productInput: CreateProductInput }): Promise<Product> {
    return await this.findOrCreate(context, productInput);
  }

  @OnEvent(findProductByIdEvent)
  async onFindOneProductById({ context, id }: { context: IContext; id: string }): Promise<Product> {
    return await this.findOne(context, id);
  }
}
