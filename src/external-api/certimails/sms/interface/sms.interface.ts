import { SmsRecipient } from '../dto/args/sms.args';

export interface ISmsDestinatary {
  SmsDesTel: string;
  SmsDesNom: string;
  SmsDesApe: string;
  SmsDesEmail: string;
}

export interface ISmsRequest {
  ApiKey: string;
  FromEmail: string;
  FromEmailName: string;
  BodyType: string;
  Subject: string;
  Message: string;
  Destinatario: ISmsDestinatary;
  SmsDosPasos: boolean;
  LotGUID: string;
  LotName: string;
}

export class ISmsResponse {
  Status: number;
  SmsGUID: string;
  SmsEtapa: string;
  SmsId: string;
  HasError: boolean;
  ErrMessage: string;
}
