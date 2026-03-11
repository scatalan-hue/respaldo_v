import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ViewColumn, ViewEntity } from 'typeorm';
import V_VUDEC_MOVEMENT_PAYMENT_QUERY from '../queries/movement-payment.view.query';

@ViewEntity(V_VUDEC_MOVEMENT_PAYMENT_QUERY)
@ObjectType()
export class MovementPaymentView {
  @ViewColumn()
  @Field(() => String, { nullable: true })
  id: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  expenditureNumber: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  documentUrl: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractConsecutive: string;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  date: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  taxpayerId: string;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  organizationId: string;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  totalLiquidatedValue: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  totalPaidValue: number;

  @ViewColumn()
  @Field(() => Boolean, { nullable: true })
  isOldest: boolean;
}
