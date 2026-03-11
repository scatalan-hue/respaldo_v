import { registerEnumType } from '@nestjs/graphql';

export enum MovementTypeValue {
  Porcentaje = 'Porcentaje',
  Fijo = 'Fijo',
  Empty = ''
}

registerEnumType(MovementTypeValue, { name: 'MovementTypeValue' });
