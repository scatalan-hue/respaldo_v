import { registerEnumType } from '@nestjs/graphql';

export enum PersonTypes {
  Natural = 'natural',
  Legal = 'legal',
}

registerEnumType(PersonTypes, { name: 'PersonTypes' });
