import { ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { EmailService } from '../service/email.service';
import { TemplateExternal, TemplateExternalResponse } from '../dto/args/template.args';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';

@Resolver()
export class EmailResolver {
  constructor(private readonly emailService: EmailService) {}

  @Query(() => [TemplateExternalResponse], { name: 'getCertimailsTemplates' })
  async getCertimailsTemplates(@CurrentContext() context, @Args('templateExternal') templateExternal: TemplateExternal): Promise<TemplateExternalResponse[]> {
    return this.emailService.getTemplates(templateExternal);
  }
}
