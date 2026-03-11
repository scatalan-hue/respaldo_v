import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Profile } from '../../../../../external-api/certimails/profile/entities/profile.entity';
import { CrudEntity } from '../../../../../patterns/crud-pattern/entities/crud-entity';
import { Contract } from 'src/main/vudec/contracts/contract/entity/contract.entity';
import { Lot } from '../../../lots/lot/entity/lot.entity';
import { Movement } from '../../../movement/entity/movement.entity';
import { Product } from '../../../product/entities/products.entity';
import { Organization } from '../../organization/entity/organization.entity';
import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';

@Entity('vudec_organization_product')
@ObjectType()
export class OrganizationProduct extends CrudEntity {
  @Column({ nullable: false })
  @Field({ nullable: false })
  key: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  url: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  urlTest: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @ManyToOne(() => Organization, (organization) => organization.organizationProducts, {
    lazy: true,
    nullable: false,
  })
  @Field(() => Organization, { nullable: true })
  organization?: Organization;

  @ManyToOne(() => Profile, (item) => item.id, { lazy: true })
  @Field(() => Profile)
  profile: Profile;

  @ManyToOne(() => Product, (product) => product.organizationProducts, {
    lazy: true,
    nullable: false,
  })
  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => [Contract], { nullable: true })
  @OneToMany(() => Contract, (contract) => contract.organizationProduct, {
    lazy: true,
  })
  contracts: Contract[];

  @Field(() => [Movement], { nullable: true })
  @OneToMany(() => Movement, (movement) => movement.organizationProduct, {
    lazy: true,
  })
  movements: Movement[];

  @Field(() => [Lot], { nullable: true })
  @OneToMany(() => Lot, (lot) => lot.organizationProduct, {
    lazy: true,
  })
  lots: Lot[];

  @Field(() => [Transaction], { nullable: true })
  @OneToMany(() => Transaction, (transaction) => transaction.organizationProduct, {
    lazy: true,
  })
  transactions: Transaction[];
}
