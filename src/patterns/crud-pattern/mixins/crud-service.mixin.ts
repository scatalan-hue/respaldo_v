import { Injectable, Type, mixin } from '@nestjs/common';
import { DeepPartial, MissingDeleteDateColumnError, Repository } from 'typeorm';

import { ActionTypeAudit } from '../../../general/audit/enums/action-audit.enum';
import { DefaultArgs } from '../classes/args/default.args';
import { getAutoIncrementKey } from '../decorators/auto-increment.decorator';
import { StandardActions } from '../enums/standard-actions.enum';
import { IContext } from '../interfaces/context.interface';
import { ICrudService } from '../interfaces/crud-service.interface';
import { IDataEntity } from '../interfaces/data-entity.interface';
import { ICreateEventsHandler, IHardRemoveEventsHandler, IRemoveEventsHandler, IUpdateEventsHandler } from '../interfaces/event-handlers';
import { IFindArgs } from '../interfaces/find-args.interface';
import { ICrudServiceStructure } from '../interfaces/structures/crud-service-structure.interface';
import { Constructable } from '../types/constructable.type';
import { DataService } from './data-service.mixin';

export function CrudServiceFrom<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  structure: ICrudServiceStructure<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>,
): Type<ICrudService<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>> {
  const { entityType, createInputType, updateInputType, contextType, findArgsType } = structure;

  return CrudService(entityType, createInputType, updateInputType, findArgsType, contextType);
}

export function CrudService<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  entityType: Constructable<EntityType>,
  createInputType: Constructable<CreateInputType>,
  updateInputType: Constructable<UpdateInputType>,
  findArgsType?: Constructable<FindArgsType>,
  contextType?: Constructable<ContextType>,
): Type<ICrudService<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>> {
  @Injectable()
  class CrudService
    extends DataService(entityType, findArgsType, contextType)
    implements ICrudService<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>
  {
    async create(
      context: ContextType,
      createInput: CreateInputType,
      eventHandler: ICreateEventsHandler<PrimaryKeyType, EntityType, CreateInputType, ContextType> = this,
    ): Promise<EntityType> {
      const repository = this.getRepository(context);

      let entity;

      try {
        entity = repository.create(createInput);

        await eventHandler.beforeCreate(context, repository, entity, createInput);

        const autoIncrementKey: string = getAutoIncrementKey(entityType);

        if (autoIncrementKey !== undefined) entity.id = await this.autoIncrement(context, repository, entity.id, autoIncrementKey);

        const responseEntity = await repository.save(entity);

        await this.Audit(context, StandardActions.Create, ActionTypeAudit.Create, undefined, entity.id as string, undefined, responseEntity);

        await eventHandler.afterCreate(context, repository, responseEntity, createInput);

        return responseEntity;
      } catch (error) {
        this.Audit(context, StandardActions.Create, ActionTypeAudit.Error, error?.message, entity.id, undefined, entity);
        throw error;
      }
    }

    async autoIncrement(
      context: ContextType,
      repository: Repository<EntityType>,
      primaryKey: PrimaryKeyType,
      autoincrementKey: string,
    ): Promise<PrimaryKeyType> {
      let val: number;

      if (typeof primaryKey !== 'object') {
        val = (await repository.createQueryBuilder('tt').select(`MAX(tt.id)`, 'max').getRawOne<{ max: number }>()).max;
      } else {
        delete primaryKey[autoincrementKey];

        val = (await repository.createQueryBuilder('tt').where({ id: primaryKey }).select(`MAX(tt.id.${autoincrementKey})`, 'max').getRawOne<{ max: number }>())
          .max;
      }

      primaryKey[autoincrementKey] = (val ?? 0) + 1;

      return primaryKey;
    }

    async update(
      context: ContextType,
      id: PrimaryKeyType,
      updateInput: UpdateInputType,
      eventHandler: IUpdateEventsHandler<PrimaryKeyType, EntityType, UpdateInputType, ContextType> = this,
    ): Promise<EntityType> {
      const repository = this.getRepository(context);

      let entity;

      let valueBefore: EntityType;

      try {
        entity = await this.findOne(context, id, true);

        valueBefore = { ...entity };
        updateInput.id = entity.id;

        await eventHandler.beforeUpdate(context, repository, entity, updateInput);

        Object.assign(entity, updateInput);

        const responseEntity = await repository.save(entity);

        this.Audit(context, StandardActions.Update, ActionTypeAudit.Update, undefined, entity.id, valueBefore, responseEntity);

        await eventHandler.afterUpdate(context, repository, responseEntity, updateInput);

        return responseEntity;
      } catch (error) {
        this.Audit(context, StandardActions.Update, ActionTypeAudit.Error, error?.message, entity?.id || undefined, valueBefore, entity);

        throw error;
      }
    }

    async remove(
      context: ContextType,
      id: PrimaryKeyType,
      eventHandler: IRemoveEventsHandler<PrimaryKeyType, EntityType, ContextType> = this,
    ): Promise<EntityType> {
      const repository = this.getRepository(context);

      let entity: EntityType;

      let responseEntity: EntityType;

      let valueBefore: EntityType;

      try {
        entity = await this.findOne(context, id, true);

        valueBefore = { ...entity };

        await eventHandler.beforeRemove(context, repository, entity);

        responseEntity = await repository.softRemove(entity);

        await this.Audit(context, StandardActions.SoftRemove, ActionTypeAudit.Delete, undefined, entity.id, valueBefore, responseEntity);

        await eventHandler.afterRemove(context, repository, responseEntity);
      } catch (error) {
        if (error instanceof MissingDeleteDateColumnError) {
          await this.Audit(context, StandardActions.Remove, ActionTypeAudit.Error, error?.message, undefined, valueBefore, undefined);

          responseEntity = await repository.remove(entity);

          await eventHandler.afterRemove(context, repository, responseEntity);
        } else {
          await this.Audit(context, StandardActions.SoftRemove, ActionTypeAudit.Error, error?.message, undefined, valueBefore, undefined);

          throw error;
        }

        responseEntity.id = id;
      }

      return responseEntity;
    }

    async hardRemove(
      context: ContextType,
      id: PrimaryKeyType,
      eventHandler: IHardRemoveEventsHandler<PrimaryKeyType, EntityType, ContextType> = this,
    ): Promise<EntityType> {
      const repository = this.getRepository(context);

      let entity: EntityType;

      let responseEntity: EntityType;

      let valueBefore: EntityType;

      try {
        entity = await this.findOne(context, id, true, true);

        valueBefore = { ...entity };

        await eventHandler.beforeHardRemove(context, repository, entity);

        responseEntity = await repository.remove(entity);

        responseEntity.id = id;

        await this.Audit(context, StandardActions.Remove, ActionTypeAudit.Delete, undefined, entity.id, responseEntity);

        await eventHandler.afterHardRemove(context, repository, responseEntity);

        return responseEntity;
      } catch (error) {
        await this.Audit(context, StandardActions.Remove, ActionTypeAudit.Error, error?.message, undefined, entity, undefined);

        throw error;
      }
    }

    //these methods exists to be overridden
    async beforeCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void> {}
    async beforeUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void> {}
    async beforeRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> {}
    async beforeHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> {}

    async afterCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void> {}
    async afterUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void> {}
    async afterRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> {}
    async afterHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> {}
  }

  return mixin(CrudService);
}
