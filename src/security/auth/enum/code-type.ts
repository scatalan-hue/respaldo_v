import { registerEnumType } from '@nestjs/graphql';

export enum CodeTypes {
  Register = 'register',
  SignatureElectronic = 'signatureElectronic',
}

registerEnumType(CodeTypes, { name: 'CodeTypes' });
