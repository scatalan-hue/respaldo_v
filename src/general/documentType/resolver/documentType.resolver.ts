import { DocumentType } from '../entities/documentType.entity';
import { CrudResolverFrom } from '../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Resolver } from '@nestjs/graphql';
import { CrudResolverStructure } from '../../../security/auth/utils/crud.utils';
import { serviceStructure, DocumentTypeService } from '../services/documentType.service';
import { AdminOnly } from '../../../security/auth/decorators/user-types.decorator';
import { Public } from '../../../security/auth/decorators/public.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: DocumentTypeService,
  create: { name: 'createDocumentType', decorators: [AdminOnly] },
  update: { name: 'updateDocumentType', decorators: [AdminOnly] },
  remove: { name: 'removeDocumentType', decorators: [AdminOnly] },
  findOne: { name: 'documentType', decorators: [Public] },
  findAll: { name: 'documentTypes', decorators: [Public] },
});

@Resolver(() => DocumentType)
export class DocumentTypeResolver extends CrudResolverFrom(resolverStructure) {}
