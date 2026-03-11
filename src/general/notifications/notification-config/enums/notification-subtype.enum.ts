import { NotificationTypes } from './notification-type.enum';

export enum NotificationSubtypesE {
  signUp = 'signUp',
  notifyStamps = 'notifyStamps',
  recoverPassword = 'recoverPassword',
  validateJwt = 'validateJwt',
  temporalPassword = 'temporalPassword',
  generalEmail = 'generalEmail',
  pqrs = 'pqrs',
  procedureRegistered = 'procedureRegistered',
  procedureApproved = 'procedureApproved',
  procedureRejected = 'procedureRejected',
  procedureAnswered = 'procedureAnswered',
  taxRegistered = 'taxRegistered',
  taxApproved = 'taxApproved',
  taxRejected = 'taxRejected',
  taxAnswered = 'taxAnswered',
  pqrsdfRegistered = 'pqrsdfRegistered',
  pqrsdfAnswered = 'pqrsdfAnswered',
  taskAssignment = 'taskAssignment',
  startSignature = 'startSignature',
  approveSignature = 'approveSignature',
  approveSignatureSignatories = 'approveSignatureSignatories',
  declineSignature = 'declineSignature',
  approveESignature = 'approveESignature',
  declineESignature = 'declmailSignature',
  scdpRequest = 'scdpRequest',
  cdpRequest = 'cdpRequest',
  opRequest = 'opRequest',
  srpRequest = 'srpRequest',
}

export const NotificationSubtypes = {
  [NotificationTypes.Token]: [
    {
      name: 'signUp',
    },
    {
      name: 'recoverPassword',
    },
    {
      name: 'validateJwt',
    },
  ],
};
