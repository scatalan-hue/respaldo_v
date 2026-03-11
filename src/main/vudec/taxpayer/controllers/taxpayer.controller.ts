import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { AnyUser } from '../../../../security/auth/decorators/user-types.decorator';
import { SecurityAuthGuard } from '../../../../security/auth/guards/auth.guard';
import { FindTaxpayerViewArgs } from '../dto/args/find-taxpayer-view.args';
import { TaxpayerViewService } from '../services/views/taxpayer.view.service';

@ApiTags('Taxpayers')
@Controller('taxpayer')
export class TaxpayerController {
  constructor(private readonly taxpayerViewService: TaxpayerViewService) {}

  @Post('reportTaxpayers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar archivo Excel' })
  @AnyUser()
  @UseGuards(SecurityAuthGuard)
  async report(@CurrentContext() context: IContext, @Body() findTaxpayerViewArgs: FindTaxpayerViewArgs, @Res() res: Response) {
    await this.taxpayerViewService.taxpayersReport(context, findTaxpayerViewArgs, res);
  }
}
