import { registerEnumType } from '@nestjs/graphql';

export enum TypeDoc {
  CC = 'CC',  // Cédula de Ciudadanía
  RC = 'RC',// Registro Civil
  TI = 'TI', // Tarjeta de Identidad
  TE = 'TE', // Tarjeta de Extranjería
  CE = 'CE', // Cédula de Extranjería
  NIT = 'NIT', // Número de Identificación Tributaria
  PAS = 'PAS', // Pasaporte
  DIE = 'DIE', // Documento de Identificación del Exterior
  PEP = 'PEP', // Permiso Especial de Permanencia
  NITE = 'NITE', // Número de Identificación Tributaria Especial
  NUIP = 'NUIP', // Número Único de Identificación Personal
  NITEXT = 'NITEXT', // Nit de Extranjería
}

registerEnumType(TypeDoc, { name: 'TypeDoc' });
