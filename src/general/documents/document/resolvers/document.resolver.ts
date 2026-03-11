import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AdminOnly } from '../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../security/auth/utils/crud.utils';
import { Document } from '../entities/document.entity';
import { DocumentService, serviceStructure } from '../services/document.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: DocumentService,
  findOne: { name: 'document', decorators: [AdminOnly] },
  findAll: { name: 'documents', decorators: [AdminOnly] },
});

@Resolver((of) => Document)
export class DocumentResolver extends CrudResolverFrom(resolverStructure) {}
