import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class DocumentTransactionModel {

    @Field(() => Int, { nullable: false })
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    id: number;

    @Field(() => Int, { nullable: false })
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    yearCode: number;

    @Field(() => Int, { nullable: false })
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    documentCode: number;

    @Field(() => Int, { nullable: false })
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    type: number;

    @Field(() => String, { nullable: false })
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    subType: string;

    @Field(() => String, { nullable: false })
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    date: string;

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    searchDate?: string;

    @Field(() => String, { nullable: false })
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    guid: string;
    
    @Field(() => String, { nullable: false })
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    baseGuid: string;

    @Field(() => [DocumentTransactionDetailModel], { nullable: false })
    @IsNotEmpty()
    @ApiProperty()
    details: DocumentTransactionDetailModel[];
}


@InputType()
export class DocumentTransactionDetailModel {

    @Field(() => Int, { nullable: false })
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    transactionId: number;

    @Field(() => Int, { nullable: false })
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    itemId: number;

    @Field(() => String, { nullable: false })
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    logData: string;
}