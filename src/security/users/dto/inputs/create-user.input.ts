import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserTypes } from '../../enums/user-type.enum';
import { UserDocumentTypes } from '../../../../common/enum/document-type.enum';
import { Transform } from 'class-transformer';
import { CustomPasswordScalar } from '../../scalars/password.scalar';
import { UserStatusTypes } from '../../enums/status-type.enum';

@InputType()
export class CreateUserInput {
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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  rolesId?: string[];

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

  @Field(() => CustomPasswordScalar, { nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field(() => UserDocumentTypes)
  @IsNotEmpty()
  identificationType?: UserDocumentTypes;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  credentialsExpirationDate?: Date;

  @Field(() => String)
  @IsNotEmpty()
  @IsNumber()
  identificationNumber?: string;

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

  @Field(() => UserStatusTypes, {
    nullable: true,
    defaultValue: UserStatusTypes.Active,
  })
  @IsNotEmpty()
  @IsOptional()
  status: UserStatusTypes;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  phoneCountryCode?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  phoneNumber?: string;

  @Field(() => ID, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @Field(() => ID, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @Field(() => ID, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  address?: string;

  @Field(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  hasRural?: boolean;

  @Field(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  hasExternalCreation?: boolean;

  @Field(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  temporalPassword?: boolean;

  @Field(() => UserTypes)
  type: UserTypes;

  tempPassword?: string;
}
