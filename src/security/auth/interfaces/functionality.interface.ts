import { ExecutionContext } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export interface ExtendedExecutionContext extends ExecutionContext {
  user: any;
  organization: any;
  transactionManager?: EntityManager;
  disableAudits?: boolean;
}
