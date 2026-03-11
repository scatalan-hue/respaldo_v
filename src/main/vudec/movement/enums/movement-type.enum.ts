import { registerEnumType } from '@nestjs/graphql';

export enum TypeMovement {
  Register = 'REGISTER',
  Adhesion = 'ADHESION',
  Apply = 'APPLY',
  Amendment = 'AMENDMENT', // OTROSÍ
  Assignment = 'ASSIGNMENT' // CESIÓN DE CONTRATO
}

registerEnumType(TypeMovement, { name: 'TypeMovement' });
