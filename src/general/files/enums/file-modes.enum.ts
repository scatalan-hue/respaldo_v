import { registerEnumType } from '@nestjs/graphql';

export enum FileModes {
  buffer = 'BUFFER',
  mongo = 'MONGODB',
  url = 'URL',
}

registerEnumType(FileModes, { name: 'FileModes' });
