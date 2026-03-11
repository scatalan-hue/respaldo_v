import { UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { DefaultArgs } from '../../../patterns/crud-pattern/classes/args/default.args';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { ICrudService } from '../../../patterns/crud-pattern/interfaces/crud-service.interface';
import { IDataEntity } from '../../../patterns/crud-pattern/interfaces/data-entity.interface';
import { IFindArgs } from '../../../patterns/crud-pattern/interfaces/find-args.interface';
import { ICrudResolverStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-resolver-structure.inteface';
import { SecurityAuthGuard } from '../guards/auth.guard';
import { BeforeSecurityAuthGuard } from '../guards/before-auth.guard';

export function CrudResolverStructure<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends ICrudService<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  input: ICrudResolverStructure<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, ServiceType, FindArgsType, ContextType>,
): ICrudResolverStructure<PrimaryKeyType, EntityType, CreateInputType, UpdateInputType, ServiceType, FindArgsType, ContextType> {
  return {
    ...input,
    classDecorators: [() => UseGuards(BeforeSecurityAuthGuard), () => UseGuards(SecurityAuthGuard), ...(input.classDecorators ?? [])],
  };
}
