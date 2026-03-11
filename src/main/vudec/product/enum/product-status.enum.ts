import { registerEnumType } from '@nestjs/graphql';

export enum ProductStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

registerEnumType(ProductStatus, { name: 'ProductStatus' });
