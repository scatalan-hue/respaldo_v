import { registerEnumType } from '@nestjs/graphql';

export enum WebserviceLogStatus {
  Success = 'SUCCESS',
  Error = 'ERROR',
  Pending = 'PENDING',
  Timeout = 'TIMEOUT'
}

registerEnumType(WebserviceLogStatus, { name: 'WebserviceLogStatus' });