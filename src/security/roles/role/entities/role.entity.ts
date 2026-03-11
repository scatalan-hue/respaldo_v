import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';
import { UserRole } from '../../../user-role/entities/user-role.entity';
import { UserTypes } from '../../../users/enums/user-type.enum';
import { RoleFx } from './role-fx.entity';

@Entity('sec_role')
@ObjectType()
export class Role extends CrudEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({ nullable: true })
  @Field(() => UserTypes, { nullable: true })
  defaultForType: UserTypes;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role, {
    lazy: true,
  })
  @Field(() => [UserRole], { nullable: true })
  userRoles?: UserRole[];

  @OneToMany(() => RoleFx, (roleFx) => roleFx.role, {
    cascade: true,
    lazy: true,
  })
  @Field(() => [RoleFx])
  roleFx: RoleFx[];
}
