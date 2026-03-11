import { Column, Entity, Generated, JoinColumn, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { Taxpayer } from 'src/main/vudec/taxpayer/entity/taxpayer.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { TransactionStatus } from '../../transaction/enum/transaction-status.enum';
import { TransactionAction } from '../../transaction/enum/transaction-action.enum';

@Entity('vudec_transaction_history')
@ObjectType()
export class TransactionHistory extends CrudEntity {

  @Column()
  @Field(() => Number, { nullable: false })
  sequence: number;

  @Column({ nullable: true, type: "varchar", length: "max" })
  @Field(() => String, { nullable: true })
  data?: string;

  @Column({ nullable: true, type: "varchar", length: "100" })
  @Field(() => String, { nullable: true })
  contractNumber?: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  @Field(() => Number, { nullable: true })
  contractValue?: number;

  @Column({ name: 'taxpayerId', nullable: false })
  taxpayerId: string;
  
  @ManyToOne(() => Taxpayer, (taxpayer) => taxpayer.transactionHistories, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'taxpayerId' })
  @Field(() => Taxpayer, { nullable: true })
  taxpayer?: Taxpayer;

  @Column({ name: 'transactionId', nullable: false })
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.transactionHistories, {
    lazy: true,
    nullable: true,
  })
  @JoinColumn({ name: 'transactionId' })
  @Field(() => Transaction, { nullable: true })
  transaction?: Transaction;

  @Column({ default: TransactionAction.REGISTER })
  @Field(() => TransactionAction)
  action: TransactionAction;

  @Column({ nullable: true, type: "varchar", length: "200" })
  @Field(() => String, { nullable: true })
  message?: string;
}
