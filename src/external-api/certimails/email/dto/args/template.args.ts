import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TemplateExternalType } from '../../interface/email.enum';
import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class TemplateExternal {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => ID)
  profileId: string;

  @IsNotEmpty()
  @IsEnum(TemplateExternalType)
  @Field(() => TemplateExternalType)
  typeSend: TemplateExternalType;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  type?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  subType?: string;
}

@ObjectType()
export class TemplateExternalResponse {
  @IsNotEmpty()
  @Field(() => String)
  guid: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  type?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  subType?: string;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  global?: boolean;
}
