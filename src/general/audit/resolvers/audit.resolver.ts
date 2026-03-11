import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AdminOnly } from '../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../security/auth/utils/crud.utils';
import { Audit } from '../entities/audit.entity';
import { AuditService, serviceStructure } from '../services/audit.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: AuditService,
  findOne: { name: 'audit', decorators: [AdminOnly] },
  findAll: { name: 'audits', decorators: [AdminOnly] },
});

@Resolver(() => Audit)
export class AuditResolver extends CrudResolverFrom(resolverStructure) {}
