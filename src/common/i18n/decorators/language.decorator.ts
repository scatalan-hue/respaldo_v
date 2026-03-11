import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ContextUtils } from '../../../patterns/crud-pattern/utils/context.utils';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = ContextUtils.getRequest(context);
    const language = request.headers['language'];

    if (language) {
      request['context'] = { language };
    } else {
      request['context'] = { language: 'es' };
    }

    return next.handle().pipe();
  }
}
