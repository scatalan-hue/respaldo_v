import { DeepPartial, Repository } from 'typeorm';

import { IContext } from '../context.interface';
import { IDataEntity } from '../data-entity.interface';

export interface ICreateEventsHandler<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  ContextType extends IContext,
> {
  beforeCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void>;

  afterCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void>;
}

export interface IUpdateEventsHandler<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ContextType extends IContext,
> {
  beforeUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void>;

  afterUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void>;
}

export interface IRemoveEventsHandler<PrimaryKeyType, EntityType extends IDataEntity<PrimaryKeyType>, ContextType extends IContext> {
  beforeRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;

  afterRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;
}

export interface IHardRemoveEventsHandler<PrimaryKeyType, EntityType extends IDataEntity<PrimaryKeyType>, ContextType extends IContext> {
  beforeHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;

  afterHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;
}
