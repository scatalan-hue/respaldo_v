import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { Functionality } from '../../../functionalities/functionality/entities/functionality.entity';
import { RolesService } from '../services/roles.service';

@Controller('role')
@ApiTags('Role')
export class RoleController {
  constructor(private readonly service: RolesService) {}

  @Get('functionalities/:idRole')
  @ApiParam({ name: 'idRole', description: 'id role' })
  async roleAndFunctionalities(@CurrentContext() context: IContext, @Param('idRole') idRole: string): Promise<Functionality[]> {
    return await this.service.functionalitiesByRole(context, undefined, idRole);
  }
}
