import { Resolver } from '@nestjs/graphql';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { TemplateService, serviceStructure } from '../services/template.service';
import { AdminOnly } from 'src/security/auth/decorators/user-types.decorator';
import { Public } from 'src/security/auth/decorators/public.decorator';
import { Template } from '../entities/template.entity';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TemplateService,
  create: { name: 'createTemplate', decorators: [AdminOnly] },
  update: { name: 'updateTemplate', decorators: [AdminOnly] },
  remove: { name: 'removeTemplate', decorators: [AdminOnly] },
  findOne: { name: 'template', decorators: [Public] },
  findAll: { name: 'templates', decorators: [Public] },
});

@Resolver(() => Template)
export class TemplateResolver extends CrudResolverFrom(resolverStructure) {}
