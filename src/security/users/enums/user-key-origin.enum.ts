import { registerEnumType } from '@nestjs/graphql';

export enum UserKeyOrigin {
  TwoSteps = 'twoSteps',
  RecoverPassword = 'recoverPassword',
  AuthenticationLink = 'authLink',
}

registerEnumType(UserKeyOrigin, { name: 'UserKeyOrigin' });
