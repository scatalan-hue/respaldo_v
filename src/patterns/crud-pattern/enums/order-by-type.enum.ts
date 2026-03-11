import { registerEnumType } from '@nestjs/graphql';

export enum OrderByTypes {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(OrderByTypes, { name: 'OrderTypes' });
