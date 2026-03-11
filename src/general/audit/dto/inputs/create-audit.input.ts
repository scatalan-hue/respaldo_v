import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { StandardActions } from '../../../../patterns/crud-pattern/enums/standard-actions.enum';
import { ActionTypeAudit } from '../../enums/action-audit.enum';

@InputType()
export class CreateAuditInput {
  @Field(() => StandardActions)
  @IsEnum(StandardActions)
  @IsString()
  @IsNotEmpty()
  action: StandardActions;

  @Field(() => ActionTypeAudit)
  @IsEnum(ActionTypeAudit)
  @IsString()
  @IsNotEmpty()
  type: ActionTypeAudit;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  details?: String;

  @Field(() => String)
  @IsString()
  @IsOptional()
  valueAfter?: String;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  valueBefore?: String;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ip?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
