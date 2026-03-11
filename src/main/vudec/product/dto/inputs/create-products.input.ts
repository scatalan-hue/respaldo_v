import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateFileBySourceInput } from '../../../../../general/files/dto/inputs/create-file-by-source.input';
import { ProductName } from '../../enum/product-name.enum';

@InputType()
export class CreateProductInput {
  @Field(() => ProductName, { nullable: false })
  @IsEnum(ProductName)
  @IsNotEmpty()
  @ApiProperty({ enum: ProductName })
  name: ProductName;

  @Field(() => CreateFileBySourceInput, { nullable: true })
  @IsOptional()
  @ApiProperty()
  logoInput?: CreateFileBySourceInput;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  url?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  urlTest?: string;
}
