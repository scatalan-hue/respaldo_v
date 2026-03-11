import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CreateOrganizationInput } from '../dto/inputs/create-organization.input';
import { ResponseOrganization } from '../dto/models/response-create-organization.model';
import { OrganizationService } from '../services/organization.service';
import { OrganizationViewService } from '../services/views/organization.view.service';
import { Response } from 'express';
import { Transactional } from '../../../../../patterns/crud-pattern/decorators/transactional.decorator';

@ApiTags('Organizations')
// @ApiBearerAuth()
@Controller()
export class OrganizationController {
  constructor(
    private readonly organizationServices: OrganizationService,
    private readonly organizationViewService: OrganizationViewService,
  ) {}

  @Post('createOrganization')
  @Transactional()
  @ApiBody({ type: CreateOrganizationInput, required: true, isArray: false })
  async organization(@CurrentContext() context: IContext, @Body() organizationInput: CreateOrganizationInput): Promise<ResponseOrganization | string> {
    const response = await this.organizationServices.findOrCreate(context, organizationInput);

    return response;
  }

  @Get('organization/reportOrganizations')
  @ApiOperation({ summary: 'Descargar archivo Excel' })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel generado con éxito',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async report(@CurrentContext() context: IContext, @Res() res: Response) {
    await this.organizationViewService.organizationsReport(context, res);
  }
}
