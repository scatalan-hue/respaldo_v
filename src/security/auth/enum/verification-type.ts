import { registerEnumType } from '@nestjs/graphql';

export enum VerificationTypes {
  Email = 'emailVerification',
  Phone = 'phoneVerification',
}

registerEnumType(VerificationTypes, { name: 'VerificationTypes' });
