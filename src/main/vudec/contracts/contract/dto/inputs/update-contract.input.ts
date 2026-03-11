import { IsNumber, IsOptional, IsString, IsUUID, Max } from 'class-validator';
import { InputType, Field, PartialType, ID, OmitType } from '@nestjs/graphql';
import { CreateContractInput } from './create-contract.input';
import { TypeMovement } from 'src/main/vudec/movement/enums/movement-type.enum';

@InputType()
export class UpdateContractInput extends OmitType(PartialType(CreateContractInput), ['consecutive', 'contractValue']) {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  consecutive?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Max(99999999999999.9999)
  contractValue?: number;

  typeMovements?: TypeMovement[];
}
