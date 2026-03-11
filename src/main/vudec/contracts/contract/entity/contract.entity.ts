import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { LotContract } from '../../../lots/lot-contract/entities/lot-contract.entity';
import { Movement } from '../../../movement/entity/movement.entity';
import { OrganizationProduct } from '../../../organizations/organization-product/entities/organization-product.entity';
import { Taxpayer } from '../../../taxpayer/entity/taxpayer.entity';
import { ContractHistory } from '../../contract-history/entities/contract-history.entity';
import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';
import { ContractDocument } from '../../contract-document/entities/contract-document.entity';

@Entity('vudec_contract')
@ObjectType()
// @Index('UQ_CONTRACT_CONSECUTIVE_ORGPRODUCT', ['consecutive', 'organizationProductId'], {
//   unique: true,
// })
@Unique(['consecutive', 'organizationProductId']) 
export class Contract extends CrudEntity {
  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  consecutive: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  contractType: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  @Field(() => Number, { nullable: true })
  contractValue: number;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  contractDate: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  contractDateIni: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  contractDateEnd: Date;

  @Column({ name: 'organizationProductId', nullable: true })
  organizationProductId: string;

  // 2. Vinculas la relación con esa columna
  @ManyToOne(() => OrganizationProduct, (organizationProduct) => organizationProduct.contracts, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'organizationProductId' })
  @Field(() => OrganizationProduct, { nullable: true })
  organizationProduct?: OrganizationProduct;

  @Column({ name: 'taxpayerId', nullable: true })
  taxpayerId: string;

  @ManyToOne(() => Taxpayer, (taxpayer) => taxpayer.contracts, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'taxpayerId' })
  @Field(() => Taxpayer, { nullable: true })
  taxpayer?: Taxpayer;

  @OneToMany(() => Movement, (movement) => movement.contract, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Movement], { nullable: true })
  movements: Movement[];

  @OneToMany(() => LotContract, (lotContract) => lotContract.contract, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [LotContract], { nullable: true })
  lotContracts?: LotContract[];

  @OneToMany(() => ContractHistory, (history) => history.contract, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [ContractHistory], { nullable: true })
  history?: ContractHistory[];

  @OneToMany(() => Transaction, (transaction) => transaction.contract, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Transaction], { nullable: true })
  transactions?: Transaction[];

  @OneToMany(() => ContractDocument, (document) => document.contract, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [ContractDocument], { nullable: true })
  contractDocuments?: ContractDocument[];
}
