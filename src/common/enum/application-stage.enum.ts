import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationStage {
  TermsConditions = 'termsConditions',
  Data = 'data',
  Signer = 'signer',
  DocumentType = 'documentType',
  Attachments = 'attachments',
  Confirm = 'confirm',
  Pending = 'pending',
}

registerEnumType(ApplicationStage, { name: 'ApplicationStage' });
