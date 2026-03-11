import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../../main/vudec/organizations/organization/entity/organization.entity';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { User } from '../../../security/users/entities/user.entity';
import { Department } from '../../department/entities/department.entity';

@Entity({ name: 'grl_city' })
@ObjectType()
export class City extends CrudEntity {
  @Column()
  @Field(() => Int)
  code: number;

  @Column()
  @Field(() => String)
  name: string;

  @ManyToOne(() => Department, undefined, { lazy: true })
  @Field(() => Department, { nullable: true })
  department: Department;

  @OneToMany(() => User, (user) => user.city, { lazy: true })
  user: User[];

  @OneToMany(() => Organization, (organizations) => organizations.city, {
    lazy: true,
  })
  organizations?: Organization[];
}
