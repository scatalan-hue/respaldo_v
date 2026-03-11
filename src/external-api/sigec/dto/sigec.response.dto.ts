export class ReportContractResponse {
  httpstatus: number;
  data: {
    platform: string;
    type: number;
    actDocumentCode: string;
    generatorFactValue: number;
    payerDocumentParametricTypeCode: string;
    taxpayerDocumentNumber: string;
    taxpayerName: string;
    generatorFactStartDate: string;
    generatorFactEndDate: string;
    parametricActDocumentCodeType: string;
  };
  message: string;
}
export class RegisterLiquidationResponse {
  httpstatus: number;
  data: {
    type: number;
    actDocumentCode: string;
    stampNumber: string;
    liquidatedValue: number;
    liquidatedValueId: string;
    taxpayerDocumentNumber: string;
    payerDocumentParametricTypeCode: string;
  };
  message: string;
}
export class RegisterPaymentResponse {
  httpstatus: number;
  data: {
    type: number;
    paymentDate: string;
    valuePaid: number;
    liquidatedValueId: string;
    paidValueId: string;
  };
  message: string;
}
