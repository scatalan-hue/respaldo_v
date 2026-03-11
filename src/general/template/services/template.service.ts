import { Injectable } from '@nestjs/common';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { Template } from '../entities/template.entity';
import { CreateTemplateInput } from '../dto/inputs/create-template.input';
import { UpdateTemplateInput } from '../dto/inputs/update-template.input';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { Repository } from 'typeorm';
import { FilesService } from 'src/general/files/services/files.service';

export const serviceStructure = CrudServiceStructure({
  entityType: Template,
  createInputType: CreateTemplateInput,
  updateInputType: UpdateTemplateInput,
});

@Injectable()
export class TemplateService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly fileService: FilesService) {
    super();
  }

  async beforeCreate(context: IContext, repository: Repository<Template>, entity: Template, createInput: CreateTemplateInput): Promise<void> {
    entity.file = await this.fileService.findOne(context, createInput.fileId);
  }
}
