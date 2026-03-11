import { AxiosResponse, AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { createWebserviceLogEvent } from '../constants/events.constants';
import { CreateWebserviceLogInput } from '../dto/inputs/create-webservice-log.input';
import { UpdateWebserviceLogInput } from '../dto/inputs/update-webservice-log.input';
import { WebserviceLog } from '../entities/webservice-log.entity';
import { WebserviceLogStatus } from '../enums/webservice-log-status.enum';
import { WebserviceLogEventPayload } from '../interface/webservice-call-config.interface';
import { FindWebserviceLogArgs } from '../dto/args/webservice-log.args';
import { HttpMethod } from '../enums/http-method.enum';
import { WebservicePayloadModel } from '../dto/models/webservice-payload.model';

export const serviceStructure = CrudServiceStructure({
    entityType: WebserviceLog,
    createInputType: CreateWebserviceLogInput,
    updateInputType: UpdateWebserviceLogInput,
    findArgsType: FindWebserviceLogArgs
});

@Injectable()
export class WebserviceLogService extends CrudServiceFrom(serviceStructure) {

    private async logWebserviceCall(context: IContext, payload: WebserviceLogEventPayload): Promise<WebserviceLog> {
        const { config, responseOrError, isError = false } = payload;
        
        const requestPayload = {
            url: config.url,
            method: config.method,
            headers: config.headers || {},
            data: config.requestData
        };

        let createInput: CreateWebserviceLogInput;

        if (isError) {
            const error = responseOrError;
            const axiosError = error as AxiosError;
            const statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data || { error: error.message };
            const errorMessage = error?.response?.data?.message ?? error?.response?.message ?? error?.message ?? 'Unknown error';

            createInput = {
                serviceName: config.serviceName,
                endpoint: config.url,
                httpMethod: config.method,
                request: JSON.stringify(requestPayload),
                response: JSON.stringify(responseData),
                status: WebserviceLogStatus.Error,
                statusCode,
                errorMessage,
                userId: context.user?.id,
                transactionId: payload.transactionId,
                organizationProductId: payload.organizationProductId,
                movementId: payload.movementId,
            };
        } else {
            const response = responseOrError as AxiosResponse;
            
            createInput = {
                serviceName: config.serviceName,
                endpoint: config.url,
                httpMethod: config.method,
                request: JSON.stringify(requestPayload),
                response: JSON.stringify(response.data),
                status: WebserviceLogStatus.Success,
                statusCode: response.status,
                userId: context.user?.id,
                transactionId: payload.transactionId,
                organizationProductId: payload.organizationProductId,
                movementId: payload.movementId,
            };
        }

        return await this.create(context, createInput);
    }

    private async emitWebserviceLog(
        context: IContext,
        payload: WebservicePayloadModel
    ): Promise<void> {
        this.logWebserviceCall(
            context,
            {
                config: {
                    serviceName: payload.config.serviceName,
                    url: payload.config.url,
                    method: payload.config.method,
                    requestData: payload.config.requestData
                },
                responseOrError: payload.responseOrError,
                isError: payload.isError,
                organizationProductId: context.organizationProduct?.id,
                transactionId: context.transactionId,
                movementId: context.movementId,
            }
        );
    }


    @OnEvent(createWebserviceLogEvent, { suppressErrors: false })
    async onCreateWebserviceLog({ context, payload }: { context: IContext; payload: WebservicePayloadModel }): Promise<void> {
        return await this.emitWebserviceLog(context, payload);
    }
}