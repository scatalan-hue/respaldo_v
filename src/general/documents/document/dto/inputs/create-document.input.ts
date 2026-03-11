import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Organization } from '../../../../../main/vudec/organizations/organization/entity/organization.entity';
import { Product } from '../../../../../main/vudec/product/entities/products.entity';

@InputType()
export class CreateDocumentInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasFinalDocument?: boolean;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  consecutiveId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  externalId?: string;

  @Field(() => Organization, { nullable: true })
  @IsOptional()
  organizationId?: Organization;

  @Field(() => Product, { nullable: true })
  @IsOptional()
  productId?: Organization;
}
