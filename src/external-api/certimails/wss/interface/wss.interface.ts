export interface IWssRequest {
  ApiKey: string;
  Subject: string;
  PersNom: string;
  PersNumDoc: string;
  TelIndicativo: string;
  TelNumber: string;
  type: string;
  TemplateMessage: IWssTemplate;
  WssDosPasos: boolean;
  LotGUID: string;
  LotName: string;
}

class IWssTemplate {
  guid: string;
  metadata?: string;
}

//Estructura de Response
export interface IWssResponse {
  Status: number;
  WssGUID: string;
  WssEtapa: string;
  WssId: string;
  HasError: boolean;
  ErrMessage: string;
}
