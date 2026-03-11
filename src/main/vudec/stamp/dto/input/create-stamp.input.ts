import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StampStatus } from '../../enum/stamp-status.enum';

@InputType()
export class CreateStampInput {
  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => String(value || "").trim())
  name?: string;

  @Field(() => String, { nullable: false })
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => String(value || "").trim())
  stampNumber: string;

  @Field(() => StampStatus, { nullable: true })
  @ApiProperty()
  @IsOptional()
  @IsEnum(StampStatus)
  status?: StampStatus;
}
