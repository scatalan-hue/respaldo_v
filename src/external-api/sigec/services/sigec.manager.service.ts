import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RegisterLiquidationRequest, RegisterPaymentRequest, ReportContractRequest } from '../dto/sigec.request.dto';
import { RegisterLiquidationResponse, RegisterPaymentResponse, ReportContractResponse } from '../dto/sigec.response.dto';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { DatosGovResponse } from '../dto/datos-gov.response.dto';
import { HttpMethod } from 'src/general/webservice-log/enums/http-method.enum';
import { createWebserviceLogEvent } from 'src/general/webservice-log/constants/events.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

enum SigecMethod {
  reportContract = '/interoperabilityActoDocumento/registrar',
  registerLiquidation = '/interoperabilityLiquidacion/registrar',
  registerPayment = '/interoperabilityPago/registrar',
}

@Injectable()
export class SigecManager {

  constructor(
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async reportContract(context: IContext, data: ReportContractRequest, token: string): Promise<ReportContractResponse> {
    const url = `${process.env.SIGEC_URL}${SigecMethod.reportContract}`;
    let responseData: any, isError: boolean;
    
    try {
      const response = await firstValueFrom(this.httpService.post(url, data, { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token 
        } 
      }));

      responseData = response;
      isError = false;

      return response.data as ReportContractResponse;
    } catch (error) {
      
      responseData = error;
      isError = true;
      
      return { message: error?.response?.data?.message ?? error?.message } as ReportContractResponse;
    } finally {

      this.eventEmitter.emit(createWebserviceLogEvent, {
        context,
        payload: {
          config: {
            serviceName: 'reportContract',
            url,
            method: HttpMethod.POST,
            requestData: data
          },
          responseOrError: responseData,
          isError
        }
      });

    }
  }

  async registerLiquidation(context: IContext, data: RegisterLiquidationRequest, token: string): Promise<RegisterLiquidationResponse> {
    const url = `${process.env.SIGEC_URL}${SigecMethod.registerLiquidation}`;
    let responseData: any, isError: boolean;

    try {
      const response = await firstValueFrom(this.httpService.post(url, data, { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token 
        } 
      }));

      responseData = response;
      isError = false;

      return response.data as RegisterLiquidationResponse;
    } catch (error) {

      responseData = error;
      isError = true;

      return { message: error?.response?.data?.message ?? error?.message } as RegisterLiquidationResponse;
    } finally {

      this.eventEmitter.emit(createWebserviceLogEvent, {
        context,
        payload: {
          config: {
            serviceName: 'registerLiquidation',
            url,
            method: HttpMethod.POST,
            requestData: data
          },
          responseOrError: responseData,
          isError
        }
      });

    }
  }

  async registerPayment(context: IContext, data: RegisterPaymentRequest, token: string): Promise<RegisterPaymentResponse> {
    const url = `${process.env.SIGEC_URL}${SigecMethod.registerPayment}`;
    let responseData: any, isError: boolean;

    try {
      const response = await firstValueFrom(this.httpService.post(url, data, { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token 
        } 
      }));

      responseData = response;
      isError = false;

      return response.data as RegisterPaymentResponse;
    } catch (error) {

      responseData = error;
      isError = true;

      return { message: error?.response?.data?.message ?? error?.message } as RegisterPaymentResponse;
    } finally {

      this.eventEmitter.emit(createWebserviceLogEvent, {
        context,
        payload: {
          config: {
            serviceName: 'registerPayment',
            url,
            method: HttpMethod.POST,
            requestData: data
          },
          responseOrError: responseData,
          isError
        }
      });

    }
  }

  async validateContract(context: IContext, contractId: string): Promise<DatosGovResponse> {
    let responseData: any, isError: boolean;
    
    if (!contractId) {
      return { message: 'El id del contrato es obligatorio', error: true } as DatosGovResponse;
    }

    const url = `${process.env.VALIDATION_URL}${contractId}`;
    
    try {
      const response = await firstValueFrom(this.httpService.get(url));

      if (!response?.data?.[0]?.id_contrato) {
        throw new Error('Contrato no encontrado en Datos.gov');
      }

      const result = { data: response.data[0] };

      responseData = response;
      isError = false;

      return result;

    } catch (error) {
      const message = error?.response?.data?.message ?? error?.response?.message ?? error?.message ?? 'Error validando contrato en Datos.gov';
      const result = { message, error: true } as DatosGovResponse;

      responseData = error;
      isError = true;

      return result;
    } finally {

      this.eventEmitter.emit(createWebserviceLogEvent, {
        context,
        payload: {
          config: {
            serviceName: 'registerPayment',
            url,
            method: HttpMethod.POST,
            requestData: undefined
          },
          responseOrError: responseData,
          isError
        }
      });

    }
  }
}
