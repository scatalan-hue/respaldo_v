import { HttpMethod } from "../enums/http-method.enum";

interface WebserviceCallConfig {
    serviceName: string;
    url: string;
    method: HttpMethod;
    requestData?: any;
    headers?: any;
}

export interface WebserviceLogEventPayload {
    config: WebserviceCallConfig;
    responseOrError: any;
    isError?: boolean;
    organizationProductId: string;
    transactionId?: string;
    movementId?: string;
}