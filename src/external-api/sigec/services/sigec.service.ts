import { BadRequestException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { RegisterLiquidationRequest, RegisterPaymentRequest, ReportContractRequest } from '../dto/sigec.request.dto';
import { SigecManager } from './sigec.manager.service';
import { RegisterLiquidationResponse, RegisterPaymentResponse, ReportContractResponse } from '../dto/sigec.response.dto';
import { SigecEvents } from '../enums/sigec-events-type.enum';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { DatosGovResponse } from '../dto/datos-gov.response.dto';

@Injectable()
export class SigecService {
  constructor(
    private readonly sigecManager: SigecManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onApplicationBootstrap() {
    this.eventEmitter.emit('sigec.service.ready');
  }

  @OnEvent(SigecEvents.ReportContract, { suppressErrors: false })
  async handleReportContract({ context, data, token }: { context: IContext; data: ReportContractRequest; token: string }): Promise<ReportContractResponse> {
    try {
      return await this.sigecManager.reportContract(context, data, token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @OnEvent(SigecEvents.RegisterLiquidation, { suppressErrors: false })
  async handleRegisterLiquidation({ context, data, token }: { context: IContext; data: RegisterLiquidationRequest; token: string }): Promise<RegisterLiquidationResponse> {
    try {
      return await this.sigecManager.registerLiquidation(context, data, token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @OnEvent(SigecEvents.RegisterPayment, { suppressErrors: false })
  async handleRegisterPayment({ context, data, token }: { context: IContext; data: RegisterPaymentRequest; token: string }): Promise<RegisterPaymentResponse> {
    try {
      return await this.sigecManager.registerPayment(context, data, token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @OnEvent(SigecEvents.ValidateContract, { suppressErrors: false })
  async validateContract({ context, contractId }: { context: IContext; contractId: string }): Promise<DatosGovResponse> {
    return await this.sigecManager.validateContract(context, contractId);
  }
}
