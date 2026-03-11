import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { Contract } from '../../contract/entity/contract.entity';
import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';

@Entity('vudec_contract_document')
@ObjectType()
export class ContractDocument extends CrudEntity {
  @Column({ nullable: false, type: 'varchar', length: 1000 })
  @Field(() => String, { nullable: false })
  description: string;

  @Column({ nullable: false, type: 'varchar', length: 40 })
  @Field(() => String, { nullable: false })
  document: string;

  @Column({ nullable: false, type: 'varchar', length: 40 })
  @Field(() => String, { nullable: false })
  typeDocument: string;

  @Column({ nullable: false, type: 'varchar', length: 2083 })
  @Field(() => String, { nullable: false })
  url: string;

  @Column({ name: 'contractId', nullable: false })
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.contractDocuments, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'contractId' })
  @Field(() => Contract, { nullable: false })
  contract?: Contract;

  @Column({ name: 'transactionId', nullable: false })
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.contractDocuments, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'transactionId' })
  @Field(() => Transaction, { nullable: true })
  transaction?: Transaction;

}
