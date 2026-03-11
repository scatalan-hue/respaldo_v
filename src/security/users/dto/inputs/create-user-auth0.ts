import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserStatusTypes } from '../../enums/status-type.enum';

@InputType()
export class CreateUserAuth0Input {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  secondSurname?: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  dateIssue?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  legalRepresentativeIdentificationNumber?: string;

  @Field(() => String)
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field(() => UserStatusTypes)
  @IsOptional()
  @IsEnum(UserStatusTypes)
  status: UserStatusTypes;
}
