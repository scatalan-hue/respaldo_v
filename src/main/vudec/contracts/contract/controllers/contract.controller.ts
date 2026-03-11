import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { Transactional } from '../../../../../patterns/crud-pattern/decorators/transactional.decorator';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { SecurityAuthGuard } from '../../../../../security/auth/guards/auth.guard';
import { ExternalApiKey } from '../../../../../security/decorators/external-api-key.decorator';
import { FindContractViewArgs } from '../dto/args/find-contract-view.args';
import { CreateContractInput } from '../dto/inputs/create-contract.input';
import { Contract } from '../entity/contract.entity';
import { ContractService } from '../services/contract.service';
import { ContractViewService } from '../services/views/contract.view.service';

@ApiTags('Contracts')
@Controller()
export class ContractController {
  constructor(
    private readonly contractServices: ContractService,
    private readonly contractViewService: ContractViewService,
  ) {}

  @Post('createContract')
  @ApiHeader({
    name: 'api-key',
  })
  @ExternalApiKey()
  @Transactional()
  @ApiBody({ type: CreateContractInput, required: true, isArray: false })
  async contract(@CurrentContext() context: IContext, @Body() contractInput: CreateContractInput): Promise<Contract> {
    const response = await this.contractServices.findOrCreate(context, contractInput);

    return response;
  }

  @Post('contract/reportContracts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar archivo Excel' })
  @AnyUser()
  @UseGuards(SecurityAuthGuard)
  async report(@CurrentContext() context: IContext, @Body() findContractViewArgs: FindContractViewArgs, @Res() res: Response) {
    await this.contractViewService.contractsReport(context, findContractViewArgs, res);
  }
}
