import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';
import { Functionality } from '../../../functionalities/functionality/entities/functionality.entity';
import { RoleFx } from '../../role/entities/role-fx.entity';

@Entity({ name: 'sec_role_fx_url' })
@ObjectType()
export class RoleFxUrl extends CrudEntity {
  @ManyToOne(() => Functionality, (functionality) => functionality.roleFx, { lazy: true, nullable: true })
  @Field(() => Functionality, { nullable: true })
  functionality?: Functionality;

  @ManyToOne(() => RoleFx, (roleFx) => roleFx.roleFxUrls, { lazy: true, nullable: true, onDelete: 'CASCADE' })
  @Field(() => RoleFx, { nullable: true })
  roleFx?: RoleFx;
}
