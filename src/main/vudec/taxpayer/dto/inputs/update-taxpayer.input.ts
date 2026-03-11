import { Field, ID, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateTaxpayerInput } from './create-taxpayer.input';

@InputType()
export class UpdateTaxpayerInput extends OmitType(PartialType(CreateTaxpayerInput), ['name']) {
  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name: string;
}
