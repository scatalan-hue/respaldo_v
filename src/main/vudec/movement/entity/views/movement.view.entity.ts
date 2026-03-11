import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { ViewColumn, ViewEntity } from 'typeorm';
import { MovementStatus } from '../../enums/movement-status.enum';
import { TypeMovement } from '../../enums/movement-type.enum';
import V_VUDEC_MOVEMENTS_QUERY from '../queries/movement.view.query';
import { MovementTypeValue } from '../../enums/movement-type-value.enum copy';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_MOVEMENTS_QUERY)
@ObjectType()
export class MovementsView {
  @ViewColumn()
  @Field(() => ID, { nullable: false })
  id: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  organizationId: string;

  @ViewColumn()
  @Field(() => ID, { nullable: false })
  stampId: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  productName: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  productId: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  description: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  logoProductUrl: string;

  @ViewColumn()
  @Field(() => MovementTypeValue, { nullable: true })
  typeValue: MovementTypeValue;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  documentUrl: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  expenditureNumber: string;

  @ViewColumn()
  @Field(() => Boolean, { nullable: true })
  isRevert: boolean;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  stampName: string;

  @ViewColumn()
  @Field(() => TypeMovement, { nullable: true })
  type: TypeMovement;

  @ViewColumn()
  @Field(() => MovementStatus, { nullable: true })
  status: MovementStatus;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  movementDate: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  liquidatedValue: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  value: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  paidValue: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  documentValue: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  taxBasisValue: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  percentageValue: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  fixedValue: number;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  lotId: string;
  
  @ViewColumn()
  @Field(() => String, { nullable: true })
  transactionId: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractId: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  message: string;
}
