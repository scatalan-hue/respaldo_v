import { Resolver } from '@nestjs/graphql';
import { AuditHandlerService } from './audit.service';

@Resolver()
export class AuditHandlerResolver {
  constructor(private readonly auditHandlerService: AuditHandlerService) {}
}
