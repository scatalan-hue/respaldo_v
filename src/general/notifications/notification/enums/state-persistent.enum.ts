import { registerEnumType } from '@nestjs/graphql';

export enum StatePersistent {
  Send = 'send',
  Receive = 'receive',
  Open = 'open',
  NoPersistent = '',
}

registerEnumType(StatePersistent, { name: 'StatePersistent' });
