import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { City } from '../../../../../general/city/entities/city.entity';
import { Department } from '../../../../../general/department/entities/department.entity';
import { FileInfo } from '../../../../../general/files/entities/file-info.entity';
import { CrudEntity } from '../../../../../patterns/crud-pattern/entities/crud-entity';
import { OrganizationProduct } from '../../organization-product/entities/organization-product.entity';
import { OrganizationTaxpayer } from '../../organization-taxpayer/entities/organization-taxpayer.entity';
import { OrganizationUser } from '../../organization-user/entities/organization-user.entity';
import { OrdenType } from '../enums/organization-orden.enum';
import { OrganizationStatus } from '../enums/organization-status.enum';

@Entity('vudec_organization')
@ObjectType()
export class Organization extends CrudEntity {
  @Column({ nullable: false, length: 400 })
  @Field(() => String, { nullable: false })
  name: string;

  @Column({ nullable: false, length: 200 })
  @Field(() => OrdenType, { nullable: false })
  ordenType: OrdenType;

  @Column({ nullable: true, type: 'varchar', length: 50 })
  @Field(() => OrganizationStatus, { nullable: true })
  status: OrganizationStatus;

  @Column({ nullable: false, unique: true })
  @Field(() => String, { nullable: false })
  nit: string;

  @Column({ nullable: true, type: 'varchar', length: '400' })
  @Field({ nullable: true })
  address?: string;

  @Column({ nullable: true, type: 'varchar', length: '400' })
  @Field({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  schedule?: string;

  @ManyToOne(() => Department, (department) => department.organizations, {
    lazy: true,
    nullable: true,
  })
  @Field(() => Department, { nullable: true })
  department?: Department;

  @ManyToOne(() => City, (city) => city.organizations, {
    lazy: true,
    nullable: true,
  })
  @Field(() => City, { nullable: true })
  city: City;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  email?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  phone?: string;

  @Column({ nullable: true, type: 'varchar', length: '400' })
  @Field(() => String, { nullable: true })
  token?: string;

  @JoinColumn()
  @OneToOne(() => FileInfo, (file) => file.id, {
    lazy: true,
    eager: true,
    nullable: true,
  })
  @Field(() => FileInfo, { nullable: true })
  logo?: FileInfo;

  @ManyToOne(() => Organization, (organizationParent) => organizationParent.organizationChildren, {
    lazy: true,
    nullable: true,
  })
  @Field(() => Organization, { nullable: true })
  organizationParent?: Organization;

  @OneToMany(() => Organization, (organizationParent) => organizationParent.organizationParent, {
    lazy: true,
    nullable: true,
  })
  organizationChildren?: Organization[];

  @OneToMany(() => OrganizationProduct, (organizationProduct) => organizationProduct.organization, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [OrganizationProduct], { nullable: true })
  organizationProducts?: OrganizationProduct[];

  @OneToMany(() => OrganizationTaxpayer, (organizationTaxpayer) => organizationTaxpayer.organization, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [OrganizationTaxpayer], { nullable: true })
  organizationTaxpayers?: OrganizationTaxpayer[];

  @OneToMany(() => OrganizationUser, (organizationUser) => organizationUser.organization, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [OrganizationUser], { nullable: true })
  organizationUsers?: OrganizationUser[];
}
