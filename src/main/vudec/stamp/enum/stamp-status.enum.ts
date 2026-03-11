import { registerEnumType } from '@nestjs/graphql';

export enum StampStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

registerEnumType(StampStatus, { name: 'StampStatus' });
