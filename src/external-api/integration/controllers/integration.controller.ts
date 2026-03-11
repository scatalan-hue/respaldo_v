import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { ExternalApiKey } from 'src/security/decorators/external-api-key.decorator';
import { IntegrationService } from '../services/integration.service';
import { Transactional } from '../../../patterns/crud-pattern/decorators/transactional.decorator';

@ApiTags('external-integration')
@Controller('external-integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('heartbeat')
  @ExternalApiKey()
  @Transactional()
  async organization(@CurrentContext() context: IContext): Promise<string[]> {
    return await this.integrationService.GetPendingDocs(context);
  }
}
