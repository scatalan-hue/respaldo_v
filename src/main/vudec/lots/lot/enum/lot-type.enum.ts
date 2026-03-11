import { registerEnumType } from '@nestjs/graphql';

export enum LotType {
  Daily = 'DAILY',
  Custom = 'CUSTOM',
}

registerEnumType(LotType, { name: 'LotType' });
