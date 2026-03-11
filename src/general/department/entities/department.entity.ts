import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../../main/vudec/organizations/organization/entity/organization.entity';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'grl_department' })
@ObjectType()
export class Department extends CrudEntity {
  @Column()
  @Field(() => Int)
  code: number;

  @Column({ type: 'nvarchar' })
  @Field(() => String)
  name: string;

  @ManyToOne(() => Country, undefined, { lazy: true })
  @Field(() => Country, { nullable: true })
  country: Country;

  @OneToMany(() => Organization, (organizations) => organizations.department, {
    lazy: true,
  })
  organizations?: Organization[];
}
