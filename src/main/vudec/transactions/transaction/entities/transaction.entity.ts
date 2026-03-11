import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { Taxpayer } from 'src/main/vudec/taxpayer/entity/taxpayer.entity';
import { TransactionHistory } from '../../transaction-history/entities/transaction-history.entity';
import { TransactionAction } from '../enum/transaction-action.enum';
import { ValidationResponse } from '../enum/validation-response.enum';
import { Contract } from 'src/main/vudec/contracts/contract/entity/contract.entity';
import { OrganizationProduct } from 'src/main/vudec/organizations/organization-product/entities/organization-product.entity';
import { Movement } from 'src/main/vudec/movement/entity/movement.entity';
import { ContractDocument } from 'src/main/vudec/contracts/contract-document/entities/contract-document.entity';

@Entity('vudec_transaction')
@ObjectType()
export class Transaction extends CrudEntity {

  @Column({ nullable: false, type: "varchar", length: 50 })
  @Field(() => String)
  key: string;

  @Column({ nullable: true, type: "varchar", length: "400" })
  @Field(() => String, { nullable: true })
  description?: string;

  @Column({ nullable: true, type: "varchar", length: "max" })
  @Field(() => String, { nullable: false })
  data?: string;

  @Column({ nullable: true, type: "varchar", length: "40" })
  @Field(() => String, { nullable: true })
  documentPrincipal?: string;

  @Column({ nullable: true, type: "varchar", length: "100" })
  @Field(() => String, { nullable: true })
  contractNumber?: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  @Field(() => Number, { nullable: true })
  contractValue?: number;

  @Column({ name: 'taxpayerId', nullable: false })
  taxpayerId: string;

  @ManyToOne(() => Taxpayer, (taxpayer) => taxpayer.transactions, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'taxpayerId' })
  @Field(() => Taxpayer, { nullable: true })
  taxpayer?: Taxpayer;

  @Column({ default: TransactionStatus.PENDING })
  @Field(() => TransactionStatus)
  status: TransactionStatus;

  @Column({ default: TransactionAction.REGISTER })
  @Field(() => TransactionAction)
  action: TransactionAction;

  @Column({ default: ValidationResponse.PENDING })
  @Field(() => ValidationResponse)
  validation: ValidationResponse;

  @Column({ nullable: true, type: "varchar", length: "max" })
  @Field(() => String, { nullable: true })
  message?: string;

  @Column({ name: 'contractId', nullable: true })
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.transactions, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'contractId' })
  @Field(() => Contract, { nullable: true })
  contract?: Contract;

  @Column({ name: 'parentId', nullable: true })
  parentId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.childrens, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  @Field(() => Transaction, { nullable: true })
  parent?: Transaction;

  @Column({ name: 'organizationProductId', nullable: true })
  organizationProductId: string;

  @ManyToOne(() => OrganizationProduct, (organizationProduct) => organizationProduct.contracts, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'organizationProductId' })
  @Field(() => OrganizationProduct, { nullable: true })
  organizationProduct?: OrganizationProduct;

  @OneToMany(() => TransactionHistory, (transactionHistory) => transactionHistory.transaction, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [TransactionHistory], { nullable: true })
  transactionHistories?: TransactionHistory[];

  @OneToMany(() => Movement, (movement) => movement.transaction, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Movement], { nullable: true })
  movements?: Movement[];

  @OneToMany(() => ContractDocument, (document) => document.transaction, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [ContractDocument], { nullable: true })
  contractDocuments?: ContractDocument[];

  @OneToMany(() => Transaction, (transaction) => transaction.parent, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [Transaction], { nullable: true })
  childrens?: Transaction[];
}
