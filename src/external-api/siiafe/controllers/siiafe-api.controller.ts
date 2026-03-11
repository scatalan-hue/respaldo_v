import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { ExternalApiKey } from 'src/security/decorators/external-api-key.decorator';
import { SiiafeService } from '../services/siiafe-api.service';
import { Transactional } from '../../../patterns/crud-pattern/decorators/transactional.decorator';

@ApiTags('siiafe')
@Controller('siiafe')
export class SiiafeApiController {
  constructor(private readonly siiafeServices: SiiafeService) {}

  @Post('heartbeat')
  @ExternalApiKey()
  @Transactional()
  async organization(@CurrentContext() context: IContext): Promise<string[]> {
    return await this.siiafeServices.GetPendingDocs(context);
  }
}
