import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FunctionalityService } from '../services/functionality.service';

@Controller('functionalities')
@ApiTags('Functionality')
export class FunctionalityController {
  constructor(private readonly service: FunctionalityService) {}
  @Get()
  functionalities() {
    return this.service.findAllFunctionalities({ user: undefined });
  }
}
