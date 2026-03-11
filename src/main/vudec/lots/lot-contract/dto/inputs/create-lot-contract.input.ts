import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateLotContractInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  lotId?: string;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  contractId?: string;
}
