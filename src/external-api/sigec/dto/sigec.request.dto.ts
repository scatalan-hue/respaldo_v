export class ReportContractRequest {
  id: number;
  platform: number;
  actDocumentCode: string;
  generatorFactValue: number;
  payerDocumentParametricTypeCode: string;
  taxpayerDocumentNumber: string;
  taxpayerName: string;
  generatorFactStartDate: string;
  generatorFactEndDate: string;
  parametricActDocumentCodeType: string;
  type: number;
}

export class RegisterLiquidationRequest {
  actDocumentCode: string;
  factCodeGenerator: string;
  liquidatedValueId: string;
  liquidatedValue: number;
  payerDocumentParametricTypeCode: string;
  taxpayerDocumentNumber: string;
  stampNumber: string;
  type: number;
}

export class RegisterPaymentRequest {
  liquidatedValueId: string;
  paidValueId: string;
  paymentDate: string;
  type: string;
  valuePaid: number;
}
