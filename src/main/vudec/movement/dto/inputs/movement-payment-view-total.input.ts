import { Field, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class MovementsPaymentViewTotalsInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsString()
  contractValue?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsString()
  totalLiquidated?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalPaid?: number;
}
