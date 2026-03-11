export interface IExternalTemplateRequest {
  ApiKey: string;
  TipoPlantilla: string;
  Type?: string;
  SubType?: string;
}

export interface IExternalTemplateResponse {
  GUID: string;
  Descripcion: string;
  Type?: string;
  SubType?: string;
  IsGlobal?: boolean;
}
