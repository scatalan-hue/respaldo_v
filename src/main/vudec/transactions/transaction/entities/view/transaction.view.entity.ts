import { ViewColumn, ViewEntity } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { Status } from '../../../../contracts/contract/enum/contract-status.enum';
import V_VUDEC_TRANSACTIONS_QUERY from '../queries/transaction.view.query';
import { TransactionAction } from '../../enum/transaction-action.enum';
import { TransactionStatus } from '../../enum/transaction-status.enum';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_TRANSACTIONS_QUERY)
@ObjectType()
export class TransactionView {
  @ViewColumn()
  @Field(() => ID, { nullable: false })
  id: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  productName: string;

  @ViewColumn()
  @Field(() => ID, { nullable: false })
  productId: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  productUrl?: string;

  @ViewColumn()
  @Field(() => Date, { nullable: false })
  receptionDate?: Date;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  document?: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractNumber?: string;

  @ViewColumn()
  @Field(() => ID, { nullable: false })
  taxpayerId: string;

  @ViewColumn()
  @Field(() => String, { nullable: false })
  taxpayer: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractValue?: string;

  @ViewColumn()
  @Field(() => TransactionStatus, { nullable: false })
  status: TransactionStatus;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  description?: string;

  @ViewColumn()
  @Field(() => TransactionAction, { nullable: true })
  actionType?: TransactionAction;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  errorMessage?: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  totalStampValue?: string;
}
