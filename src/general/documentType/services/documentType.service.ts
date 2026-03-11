import { Injectable } from '@nestjs/common';
import { DocumentType } from '../entities/documentType.entity';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { CreateDocumentTypeInput } from '../dto/create-document-type.input';
import { UpdateDocumentTypeInput } from '../dto/update-document-type.input';

export const serviceStructure = CrudServiceStructure({
  entityType: DocumentType,
  createInputType: CreateDocumentTypeInput,
  updateInputType: UpdateDocumentTypeInput,
});

@Injectable()
export class DocumentTypeService extends CrudServiceFrom(serviceStructure) {}
