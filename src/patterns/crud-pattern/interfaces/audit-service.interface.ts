import { ActionTypeAudit } from '../../../general/audit/enums/action-audit.enum';
import { StandardActions } from '../enums/standard-actions.enum';
import { IContext } from './context.interface';

export interface IAuditService {
  Audit(
    context: IContext,
    serviceName: string,
    action: StandardActions,
    type: ActionTypeAudit,
    message: string,
    objectId?: string,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}

export const IAuditService = Symbol('IAuditService');
