import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';

import { ActionTypeAudit } from '../../../general/audit/enums/action-audit.enum';
import { DefaultArgs } from '../classes/args/default.args';
import { MetadataPagination } from '../classes/args/metadata-pagination.args';
import { StandardActions } from '../enums/standard-actions.enum';
import { IContext } from '../interfaces/context.interface';
import { IDataEntity } from '../interfaces/data-entity.interface';
import { IFindArgs } from './find-args.interface';

export interface IDataService<
  PrimaryKeyType,
  EntityType extends IDataEntity<PrimaryKeyType>,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
  MetadataPaginationType extends MetadataPagination = MetadataPagination,
> {
  getRepository(context: ContextType): Repository<EntityType>;

  getQueryBuilder(context: ContextType, args?: FindArgsType): Promise<SelectQueryBuilder<EntityType>>;

  find(context: ContextType, options?: FindManyOptions<EntityType>): Promise<EntityType[]>;

  findAll(context: ContextType, args?: FindArgsType): Promise<EntityType[]>;

  Count(context: ContextType, args?: FindArgsType, entity?: any): Promise<MetadataPaginationType>;

  findOne(context: ContextType, id: PrimaryKeyType, orFail?: boolean, withDeleted?: boolean): Promise<EntityType>;

  findOneBy(context: ContextType, options?: FindManyOptions<EntityType>, orFail?: boolean, withDeleted?: boolean): Promise<EntityType>;

  Audit(
    context: ContextType,
    action: StandardActions,
    type: ActionTypeAudit,
    message: string,
    objectId?: PrimaryKeyType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;

  findViewEntity(entity: any, args?: FindArgsType): Promise<any>;
}
