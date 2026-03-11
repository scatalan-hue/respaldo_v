import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { IContext } from '../../patterns/crud-pattern/interfaces/context.interface';
import { AuditLevel } from '../enum/audit-level.enum';

export class ContextualizedException extends HttpException {
  constructor(
    public readonly context: IContext,
    public readonly exception: HttpStatus,
    public readonly level: AuditLevel,
    message: string,
  ) {
    super(message, exception);
  }
}
