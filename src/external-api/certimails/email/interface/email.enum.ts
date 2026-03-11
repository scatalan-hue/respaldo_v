import { registerEnumType } from '@nestjs/graphql';

export enum BodyType {
  Custom = 'CUSTOM',
  Code = 'CODE',
  WebMail = 'WEBMAIL',
}

registerEnumType(BodyType, { name: 'BodyType' });

export enum RecipientType {
  Destinatary = 'DESTINATARIO',
  Cc = 'CC',
  Bcc = 'BCC',
}

registerEnumType(RecipientType, { name: 'RecipientType' });

export enum AttachmentType {
  Url = 'URL',
  Base64 = 'BASE_64',
}

registerEnumType(AttachmentType, { name: 'AttachmentType' });

export enum TemplateExternalType {
  Sms = 'MENSAJE',
  Email = 'CORREO',
  Whatsapp = 'WHATSAPP',
  Push = 'PUSH',
}

registerEnumType(TemplateExternalType, { name: 'TemplateExternalType' });
