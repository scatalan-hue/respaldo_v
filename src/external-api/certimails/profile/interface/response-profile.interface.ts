export interface ResponseProfile {
  Response: Response;
}

interface Response {
  Status: number;
  ApiKey: string;
  HasError: boolean;
  ErrMessage: string;
}
