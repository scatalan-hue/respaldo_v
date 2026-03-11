import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { FileInfo } from '../../../../general/files/entities/file-info.entity';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';

import { OrganizationProduct } from '../../organizations/organization-product/entities/organization-product.entity';
import { ProductName } from '../enum/product-name.enum';
import { ProductStatus } from '../enum/product-status.enum';

@Entity('vudec_product')
@ObjectType()
export class Product extends CrudEntity {
  @Column({ unique: true, nullable: true })
  @Field(() => ProductName)
  name: ProductName;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ default: ProductStatus.Active })
  @Field(() => ProductStatus)
  status: ProductStatus;

  @JoinColumn()
  @OneToOne(() => FileInfo, (logo) => logo.id, {
    lazy: true,
    eager: true,
    nullable: true,
  })
  @Field(() => FileInfo, { nullable: true })
  logo?: FileInfo;

  @OneToMany(() => OrganizationProduct, (organizationProduct) => organizationProduct.product, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [OrganizationProduct], { nullable: true })
  organizationProducts?: OrganizationProduct[];
}
