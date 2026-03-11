import { registerEnumType } from '@nestjs/graphql';

export enum UserTypes {
  User = 'user',
  Admin = 'admin',
  SuperAdmin = 'superAdmin',
  Public = 'public',
}

registerEnumType(UserTypes, { name: 'UserTypes' });
