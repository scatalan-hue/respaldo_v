import { registerEnumType } from '@nestjs/graphql';

export enum FileExtension {
  Pdf = 'pdf',
}

registerEnumType(FileExtension, { name: 'FileExtension' });
