import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../../../patterns/crud-pattern/entities/crud-entity';
import { Organization } from '../../organization/entity/organization.entity';
import { Taxpayer } from '../../../taxpayer/entity/taxpayer.entity';

@Entity('vudec_organization_taxpayer')
@ObjectType()
export class OrganizationTaxpayer extends CrudEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @ManyToOne(() => Organization, (organization) => organization.organizationTaxpayers, { lazy: true, nullable: false })
  @Field(() => Organization, { nullable: true })
  organization?: Organization;

  @ManyToOne(() => Taxpayer, (taxpayer) => taxpayer.organizationTaxpayers, {
    lazy: true,
    nullable: false,
  })
  @Field(() => Taxpayer, { nullable: true })
  taxpayer?: Taxpayer;
}
