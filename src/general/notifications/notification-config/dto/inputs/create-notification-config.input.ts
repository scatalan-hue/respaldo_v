import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationTypes } from '../../enums/notification-type.enum';
import { NotificationSubtypes } from '../../enums/notification-subtype.enum';

@InputType()
export class CreateNotificationConfigInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => ID)
  @IsString()
  @IsUUID()
  profileId: string;

  @Field(() => NotificationTypes)
  @IsString()
  type: NotificationTypes;

  @Field(() => String)
  @IsString()
  subtype: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasEmail?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasTwoStepsEmail?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasSms?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasTwoStepsSms?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasWss?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasTwoStepsWss?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasPush?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasTwoStepsPush?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  emailPrincipalCode?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  emailDuplicateCode?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  smsBody?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  wssCode?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  html?: string;
}
