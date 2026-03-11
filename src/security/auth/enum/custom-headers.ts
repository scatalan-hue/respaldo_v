import { registerEnumType } from '@nestjs/graphql';

export enum CustomHeaders {
  Apikey = 'api-key',
  Language = 'language',
  ProductId = 'product-id',
  OrganizationId = 'organization-id',
}

registerEnumType(CustomHeaders, { name: 'CustomHeaders' });
