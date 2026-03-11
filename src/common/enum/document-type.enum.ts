import { registerEnumType } from '@nestjs/graphql';

export enum UserDocumentTypes {
  CitizenshipCard = 'c.c', // Cedula de ciudadania
  IdentityCard = 't.i', // Tarjeta de identidad
  ForeignerIdentityCard = 'c.e', // Cedula de extranjeria
  ForeignerCard = 't.e', // Tarjeta de extranjeria
  Nit = 'nit', // NIT
  DiplomaticCard = 'c.d', // Carnet diplomatico
  Passport = 'p.a', // Pasaporte
  SpecialPermissionToStay = 'p.e.p', // Permiso especial de permanencia
  TemporaryProtectionPermit = 'p.p.t', // permiso de protección temporal
  SafeConduct = 's.c', // Salvoconducto
  ForeignNit = 'nit.ext', // NIT de extranjería
  CivilRegistry = 'r.c', // Registro civil
}

registerEnumType(UserDocumentTypes, { name: 'UserDocumentTypes' });
