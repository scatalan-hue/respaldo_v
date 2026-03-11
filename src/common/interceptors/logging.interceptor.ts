import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('RequestTiming');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        let path = 'unknown';

        // Detectar tipo de contexto
        const ctxType = context.getType<'http' | 'graphql' | 'rpc'>();

        if (ctxType === 'http') {
            const req = context.switchToHttp().getRequest();
            path = req.url;
        } else if (ctxType === 'graphql') {
            const gqlCtx = GqlExecutionContext.create(context);
            const info = gqlCtx.getInfo();
            path = `${info.parentType?.name}.${info.fieldName}`;
        }

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - now;
                console.log(`${path} took ${duration}ms`);
            }),
        );
    }
}