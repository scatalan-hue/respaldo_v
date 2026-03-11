import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntegrationController } from './controllers/integration.controller';
import { IntegrationManagerService } from './services/integration.manager.service';
import { IntegrationService } from './services/integration.service';

@Module({
  imports: [HttpModule],
  providers: [IntegrationManagerService, IntegrationService],
  controllers: [IntegrationController],
})
export class IntegrationModule {}
