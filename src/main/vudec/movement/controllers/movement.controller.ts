import { Body, Controller, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { AnyUser } from '../../../../security/auth/decorators/user-types.decorator';
import { SecurityAuthGuard } from '../../../../security/auth/guards/auth.guard';
import { MovementViewService } from '../services/views/movement.view.service';
import { FindMovementViewArgs } from '../dto/args/find-movement-view.args';

@ApiTags('Movements')
@Controller('movement')
export class MovementController {
  constructor(private readonly movementViewService: MovementViewService) {}

  @Post('reportMovements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar archivo Excel' })
  @AnyUser()
  @UseGuards(SecurityAuthGuard)
  async report(@CurrentContext() context: IContext, @Body() findMovementViewArgs: FindMovementViewArgs, @Res() res: Response) {
    await this.movementViewService.movementsReport(context, findMovementViewArgs, res);
  }
}
