import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { Role } from '../../roles/role/entities/role.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'sec_user_role' })
@ObjectType()
export class UserRole extends CrudEntity {
  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role, (role) => role.userRoles, { lazy: true, nullable: false })
  role: Role;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.userRoles, { lazy: true, nullable: false })
  user: User;
}
