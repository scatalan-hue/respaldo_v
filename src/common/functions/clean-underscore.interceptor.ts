import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TrimAndRenameInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const gqlContext = GqlExecutionContext.create(context);

    const isGraphQL = !!gqlContext.getContext().req;
    const isRest = !!httpContext.getRequest();

    if (isRest) {
      return next.handle().pipe(
        map(async (data) => {
          return await this.processData(data);
        }),
      );
    } else if (isGraphQL) {
      return next.handle().pipe(
        map(async (data) => {
          return await data;
        }),
      );
    }
  }

  private processData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.processData(item));
    } else if (data && typeof data === 'object' && data !== null) {
      let dataformat = this.trimStrings(data);

      return this.renameKeys(dataformat);
    }
    return data;
  }

  private trimStrings(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.trimStrings(item));
    } else if (obj && typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim();
          obj[key] = obj[key].replace(/�/g, '');
        } else if (obj[key] instanceof Date) {
          // No modificar instancias de Date
          continue;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = this.trimStrings(obj[key]);
        }
      }
    }
    return obj;
  }

  private renameKeys(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.renameKeys(item));
    } else if (obj && typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      for (const key in obj) {
        if (!(obj[key] instanceof Date)) {
          const newKey = key.replace(/^__|__$/g, '');
          newObj[newKey] = this.renameKeys(obj[key]);
        } else {
          const newKey = key.replace(/^__|__$/g, '');
          newObj[newKey] = obj[key];
        }
      }
      return newObj;
    }
    return obj;
  }
}
