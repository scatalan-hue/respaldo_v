import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Transform } from '@nestjs/class-transformer';
import { CustomPasswordScalar } from '../../../users/scalars/password.scalar';
import { UserDocumentTypes } from '../../../../common/enum/document-type.enum';

@InputType()
export class SignupInput {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  middleName?: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  lastName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  secondSurname?: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsEmail()
  confirmationEmail: string;

  @Field(() => CustomPasswordScalar)
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  confirmationPassword: string;

  @Field(() => UserDocumentTypes)
  @IsNotEmpty()
  identificationType: UserDocumentTypes;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  identificationNumber: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  dateIssue?: Date;

  @Field(() => UserDocumentTypes, { nullable: true })
  @IsOptional()
  legalRepresentativeIdentificationType?: UserDocumentTypes;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  legalRepresentativeIdentificationNumber?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  phoneCountryCode: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsUUID()
  countryId: string;

  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsUUID()
  departmentId: string;

  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsUUID()
  cityId: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  hasRural: boolean;
}
