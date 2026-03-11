import { registerEnumType } from '@nestjs/graphql';

export enum ActionTypeAudit {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Error = 'error',
}

registerEnumType(ActionTypeAudit, { name: 'ActionTypeAudit' });
