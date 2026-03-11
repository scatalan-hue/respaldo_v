import { Inject, Injectable, LoggerService, Optional } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ActionTypeAudit } from '../../general/audit/enums/action-audit.enum';
import { AuditService } from '../../general/audit/services/audit.service';
import { StandardActions } from '../../patterns/crud-pattern/enums/standard-actions.enum';
import { IAuditService } from '../../patterns/crud-pattern/interfaces/audit-service.interface';
import { IContext } from '../../patterns/crud-pattern/interfaces/context.interface';

@Injectable()
export class AuditHandlerService implements IAuditService {
  @Inject(AuditService)
  @Optional()
  private readonly _auditService?: AuditService;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async Audit(
    context: IContext,
    serviceName: string,
    action: StandardActions,
    type: ActionTypeAudit,
    message: string = 'Row affected',
    objectId?: string,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void> {
    this.logger.log('*** AUDIT START ***');
    this.logger.log(`service name: ${serviceName}, action:${action} `);

    if (valueBefore) {
      this.logger.log('*** Before ***');
      this.logger.log(valueBefore);
    }

    if (valueAfter) {
      this.logger.log('*** After ***');
      this.logger.log(valueAfter);
    }

    this._auditService.create(context, {
      action,
      type,
      message: message,
      valueAfter: JSON.stringify(valueAfter),
      valueBefore: JSON.stringify(valueBefore),
    });
  }
}
