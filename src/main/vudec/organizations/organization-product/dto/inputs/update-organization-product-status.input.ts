import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ProductStatus } from '../../../../product/enum/product-status.enum';

@InputType()
export class UpdateOrganizationProductStatusInput {
  @Field(() => ID, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @Field(() => ProductStatus, { nullable: false })
  @IsNotEmpty()
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
