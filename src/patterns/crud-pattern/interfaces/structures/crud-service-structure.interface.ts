import { DeepPartial } from 'typeorm';
import { IContext } from '../context.interface';
import { Constructable } from '../../types/constructable.type';
import { IFindArgs } from '../find-args.interface';
import { DefaultArgs } from '../../classes/args/default.args';
import { IDataEntity } from '../data-entity.interface';

export interface ICrudServiceStructure<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
> {
  entityType: Constructable<EntityType>;
  createInputType?: Constructable<CreateInputType>;
  updateInputType?: Constructable<UpdateInputType>;
  findArgsType?: Constructable<FindArgsType>;
  contextType?: Constructable<ContextType>;
}

export function CrudServiceStructure<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  input: ICrudServiceStructure<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>,
): ICrudServiceStructure<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType> {
  return input;
}
