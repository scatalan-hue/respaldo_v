import { registerEnumType } from '@nestjs/graphql';

export enum UserStatusTypes {
  Active = 'active',
  Inactive = 'inactive',
  InactiveDefinitively = 'inactiveDefinitively',
  InactiveByAttempts = 'inactiveByAttempts',
  InactiveTemporary = 'inactiveTemporary',
}

registerEnumType(UserStatusTypes, { name: 'UserStatusTypes' });
