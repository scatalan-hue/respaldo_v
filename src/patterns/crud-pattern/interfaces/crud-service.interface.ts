import { DeepPartial, Repository } from 'typeorm';

import { IDataEntity } from './data-entity.interface';
import { IContext } from '../interfaces/context.interface';
import { IDataService } from '../interfaces/data-service.interface';
import { ICreateEventsHandler, IHardRemoveEventsHandler, IRemoveEventsHandler, IUpdateEventsHandler } from './event-handlers';
import { IFindArgs } from './find-args.interface';
import { DefaultArgs } from '../classes/args/default.args';

export interface ICrudService<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
> extends IDataService<PrimaryKeyType, EntityType, FindArgsType, ContextType> {
  create(
    context: ContextType,
    createInput: CreateInputType,
    eventHandler?: ICreateEventsHandler<PrimaryKeyType, EntityType, CreateInputType, ContextType>,
  ): Promise<EntityType>;

  update(
    context: ContextType,
    id: PrimaryKeyType,
    updateInput: UpdateInputType,
    eventHandler?: IUpdateEventsHandler<PrimaryKeyType, EntityType, UpdateInputType, ContextType>,
  ): Promise<EntityType>;

  remove(context: ContextType, id: PrimaryKeyType, eventHandler?: IRemoveEventsHandler<PrimaryKeyType, EntityType, ContextType>): Promise<EntityType>;

  hardRemove(context: ContextType, id: PrimaryKeyType, eventHandler?: IHardRemoveEventsHandler<PrimaryKeyType, EntityType, ContextType>): Promise<EntityType>;

  beforeCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void>;

  beforeUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void>;

  beforeRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;

  beforeHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;

  afterCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void>;

  afterUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void>;

  afterRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;

  afterHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void>;
}
