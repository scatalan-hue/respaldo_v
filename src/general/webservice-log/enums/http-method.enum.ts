import { registerEnumType } from '@nestjs/graphql';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

registerEnumType(HttpMethod, { name: 'HttpMethod' });