import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';
import { Functionality } from '../../../functionalities/functionality/entities/functionality.entity';
import { RoleFxUrl } from '../../role-fx-url/entities/role-fx-url.entity';
import { Role } from '../../role/entities/role.entity';

@Entity({ name: 'sec_role_fx' })
@ObjectType()
export class RoleFx extends CrudEntity {
  @ManyToOne(() => Role, (role) => role.roleFx, { lazy: true, nullable: true })
  @Field(() => Role, { nullable: true })
  role?: Role;

  @ManyToOne(() => Functionality, (functionality) => functionality.roleFx, { lazy: true, nullable: true })
  @Field(() => Functionality, { nullable: true })
  functionality?: Functionality;

  @OneToMany(() => RoleFxUrl, (roleFxUrl) => roleFxUrl.roleFx, { nullable: true, cascade: true, lazy: true })
  @Field(() => [RoleFxUrl], { nullable: true })
  roleFxUrls?: RoleFxUrl[];
}
