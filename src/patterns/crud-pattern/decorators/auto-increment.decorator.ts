import { SetMetadata } from '@nestjs/common';

const AUTO_INCREMENT_KEY: string = 'AutoIncrementKey';

export const AutoIncrement = <T>(key: keyof T) => SetMetadata(AUTO_INCREMENT_KEY, key);

export function getAutoIncrementKey(entityType): string {
  return Reflect.getMetadata(AUTO_INCREMENT_KEY, entityType);
}
