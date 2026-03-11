import { ViewColumn, ViewEntity } from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import V_VUDEC_TRANSACTION_HISTORY_QUERY from '../queries/transaction-history.view.query';
import { TransactionAction } from '../../../transaction/enum/transaction-action.enum';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_TRANSACTION_HISTORY_QUERY)
@ObjectType()
export class TransactionHistoryView {
  @ViewColumn()
  @Field(() => ID, { nullable: false })
  id: string;

  @ViewColumn()
  @Field(() => Date, { nullable: false })
  receptionDate: Date;

  @ViewColumn()
  @Field(() => Int, { nullable: true })
  sequence?: number;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractNumber?: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractValue?: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  taxpayerId?: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  taxpayer: string;

  @ViewColumn()
  @Field(() => TransactionAction, { nullable: false })
  action: TransactionAction;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  message?: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  data?: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  transactionId?: string;

}
