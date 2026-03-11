import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateAuditInput } from './create-audit.input';

@InputType()
export class UpdateAuditInput extends PartialType(CreateAuditInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
