import { registerEnumType } from '@nestjs/graphql';

export enum MovementRegisterType {
  Register = 0,
  Amendment = 1,
}

registerEnumType(MovementRegisterType, { name: 'MovementRegisterType' });

export const getMovementRegisterTypeName = (value: MovementRegisterType): string => {
  return MovementRegisterType[value];
};