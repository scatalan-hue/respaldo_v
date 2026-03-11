import { Inject, Injectable, NotFoundException, Optional, Type, mixin } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindManyOptions, FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';

import { ActionTypeAudit } from '../../../general/audit/enums/action-audit.enum';
import { DefaultArgs } from '../classes/args/default.args';
import { MetadataPagination } from '../classes/args/metadata-pagination.args';
import { StandardActions } from '../enums/standard-actions.enum';
import { QueryBuilderHelper } from '../helpers/QueryBuilder.helper';
import { IAuditService } from '../interfaces/audit-service.interface';
import { IContext } from '../interfaces/context.interface';
import { IDataEntity } from '../interfaces/data-entity.interface';
import { IDataService } from '../interfaces/data-service.interface';
import { FilterableFieldInfo } from '../interfaces/filterable-field.interface';
import { IFindArgs } from '../interfaces/find-args.interface';
import { Constructable } from '../types/constructable.type';

export function DataService<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
  MetadataPaginationType extends MetadataPagination = MetadataPagination,
>(
  entityType: Constructable<EntityType>,
  findArgsType?: Constructable<FindArgsType>,
  contextType?: Constructable<ContextType>,
): Type<IDataService<PrimaryKeyType, EntityType, FindArgsType, ContextType>> {
  class QBHelper extends QueryBuilderHelper(entityType, findArgsType) {}

  @Injectable()
  class DataService implements IDataService<PrimaryKeyType, EntityType, FindArgsType, ContextType> {
    @Inject(IAuditService)
    @Optional()
    private readonly _auditService?: IAuditService;

    @InjectRepository(entityType)
    private readonly _repository: Repository<EntityType>;

    getRepository(context: ContextType) {
      if (context?.transactionManager) return context.transactionManager.getRepository(entityType);

      return this._repository;
    }

    async getQueryBuilder(context: ContextType, args?: FindArgsType, entity?: any): Promise<SelectQueryBuilder<EntityType>> {
      const repository = entity ? entity : this.getRepository(context);

      return QBHelper.getQueryBuilder(repository, args);
    }

    async find(context: ContextType, options?: FindManyOptions<EntityType>): Promise<EntityType[]> {
      const repository = this.getRepository(context);
      return repository.find(options);
    }

    async findAll(context: ContextType, args?: FindArgsType): Promise<EntityType[]> {
      const queryBuilder = await this.getQueryBuilder(context, args);

      const response = await (await queryBuilder).getMany();

      return response;
    }

    async Count(context: ContextType, args?: FindArgsType, entity?: any): Promise<MetadataPaginationType> {
      let queryBuilder: any;

      if (entity) queryBuilder = this.getQueryBuilder(undefined, args, entity);
      else
        queryBuilder = this.getQueryBuilder(context, {
          ...args,
          pagination: undefined,
          orderBy: undefined,
        });

      const gr = await queryBuilder;

      const totalItems = await gr.select(`COUNT(*) as count`).getRawMany();
      const itemsPerPage = args.pagination.take;
      const totalPages = Math.ceil(totalItems[0].count / itemsPerPage);
      const currentPage = Math.ceil((args.pagination.skip + 1) / itemsPerPage);

      return {
        totalItems: totalItems[0].count,
        itemsPerPage,
        totalPages,
        currentPage,
      } as MetadataPaginationType;
    }

    async findOne(context: ContextType, id: PrimaryKeyType, orFail?: boolean, withDeleted?: boolean): Promise<EntityType> {
      const repository = this.getRepository(context);

      let entity;

      if (!withDeleted) {
        entity = await repository.findOneBy({
          id,
        } as FindOptionsWhere<EntityType>);
      } else {
        entity = await repository.findOne({
          withDeleted: true,
          where: { id: id as any },
        });
      }

      if (orFail && !entity) throw new NotFoundException(`${entityType.name} with id: ${JSON.stringify(id)} not found`);

      return entity;
    }

    async findOneBy(context: ContextType, options?: FindManyOptions<EntityType>, orFail?: boolean, withDeleted?: boolean): Promise<EntityType> {
      const repository = this.getRepository(context);

      let entity;

      if (!withDeleted) {
        entity = await repository.findOne(options);
      } else {
        entity = await repository.findOne({ withDeleted: true, ...options });
      }

      if (orFail && !entity) throw new NotFoundException(`${entityType.name} not found`);

      return entity;
    }

    getFilterableFields(targetClass: any): FilterableFieldInfo[] {
      const filterableFields: FilterableFieldInfo[] = [];

      // Obtener todas las propiedades de la clase
      const propertyNames = Object.getOwnPropertyNames(targetClass.prototype);

      for (const propertyName of propertyNames) {
        // Obtener metadatos de Reflect y verificar si tiene el decorador FilterableField
        const isFilterable = !!Reflect.getMetadata('graphql:filterableField', targetClass.prototype, propertyName);

        filterableFields.push({
          propertyName,
          isFilterable,
        });
      }

      return filterableFields;
    }

    async Audit(
      context: ContextType,
      action: StandardActions,
      type: ActionTypeAudit,
      message: string,
      objectId?: PrimaryKeyType,
      valueBefore?: object,
      valueAfter?: object,
    ): Promise<void> {
      if (context.disableAudits) return;

      if (!this._auditService) return;

      const serviceName = this.constructor.name;

      this._auditService.Audit(context, serviceName, action, type, message, JSON.stringify(objectId), valueBefore, valueAfter);
    }

    async findViewEntity(entity: any, args?: FindArgsType): Promise<any> {
      const queryBuilder = this.getQueryBuilder(undefined, args, entity);

      return (await queryBuilder).getMany();
    }
  }

  return mixin(DataService);
}
