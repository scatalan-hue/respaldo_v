import { UserDocumentTypes } from '../../../common/enum/document-type.enum';

export interface JwtPayload {
  // Standard passport information
  email: string;
  name: string;
  lastName: string;
  type: string;
  identificationType: UserDocumentTypes;
  identificationNumber: string;
  organization?: string; // NIT
  product?: string; // CMS - SWIT - SIIAFE

  // JWT standard information
  iat?: number;
  exp?: number;
  id?: string;
  hasAuthorized?: boolean;
  guest?: boolean;
  document?: string;
}
