import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserTypes } from '../../../users/enums/user-type.enum';
import { UserDocumentTypes } from '../../../../common/enum/document-type.enum';

@InputType()
export class CreateTokenInput {
  @Field(() => String)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @Field(() => UserDocumentTypes, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  identificationType?: UserDocumentTypes;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  departmentId?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  cityId?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  countryId?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  type?: UserTypes;
}
