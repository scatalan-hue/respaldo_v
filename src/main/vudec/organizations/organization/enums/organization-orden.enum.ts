import { registerEnumType } from '@nestjs/graphql';

export enum OrdenType {
  Department = 'DEPARTMENT',
  Municipality = 'MUNICIPALITY',
  CentralizeEntity = 'CENTRALIZEENTITY',
}

registerEnumType(OrdenType, { name: 'OrdenType' });
