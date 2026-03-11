import { registerEnumType } from '@nestjs/graphql';

export enum ProductName {
  Swit = 'SWIT',
  Siiafe = 'SIIAFE',
  Digisign = 'DIGISIGN',
  Govco = 'GOVCO',
}

registerEnumType(ProductName, { name: 'ProductName' });
