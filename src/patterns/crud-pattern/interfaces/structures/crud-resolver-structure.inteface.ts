import { DeepPartial } from 'typeorm';
import { IContext } from '../context.interface';
import { IDataEntity } from '../data-entity.interface';
import { ICrudService } from '../crud-service.interface';
import { Constructable } from '../../types/constructable.type';
import { ICrudServiceStructure } from './crud-service-structure.interface';
import { IFindArgs } from '../find-args.interface';
import { DefaultArgs } from '../../classes/args/default.args';
import { PipeTransform, Type } from '@nestjs/common';

export interface ICrudQueryStructure {
  name: string;
  decorators?: (() => MethodDecorator)[];
}

export interface ICrudMutationStructure {
  name: string;
  decorators?: (() => MethodDecorator)[];
}

export interface ICrudResolverClassStructure<PrimaryKeyType> {
  create?: ICrudMutationStructure;
  update?: ICrudMutationStructure;
  remove?: ICrudMutationStructure;
  hardRemove?: ICrudMutationStructure;
  findOne?: ICrudQueryStructure;
  findAll?: ICrudQueryStructure;
  count?: ICrudQueryStructure;
  parameterDecorators?: ICrudResolverDecorators;
  classDecorators?: (() => ClassDecorator)[];
  primaryKey?: PrimaryKeyStructure<PrimaryKeyType>;
}

export interface PrimaryKeyStructure<PrimaryKeyType> {
  type: Constructable<PrimaryKeyType>;
  pipeTransforms?: Type<PipeTransform>[];
}

export interface ICrudResolverDecorators {
  currentContext: () => ParameterDecorator;
}

export interface ICrudResolverStructure<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends ICrudService<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
> extends ICrudServiceStructure<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>,
    ICrudResolverClassStructure<PrimaryKeyType> {
  serviceType: Constructable<ServiceType>;
}
