import { Global, Module } from '@nestjs/common';
import { AuditModule } from '../../general/audit/audit.module';
import { IAuditService } from '../../patterns/crud-pattern/interfaces/audit-service.interface';
import { AuditHandlerResolver } from './audit.resolver';
import { AuditHandlerService } from './audit.service';

const AuditHandlerProvider = {
  provide: IAuditService, // Used as a symbol
  useClass: AuditHandlerService,
};

@Global()
@Module({
  providers: [AuditHandlerResolver, AuditHandlerService, AuditHandlerProvider],
  exports: [AuditHandlerProvider],
  imports: [AuditModule],
})
export class AuditHandlerModule {}
