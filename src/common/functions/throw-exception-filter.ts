import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlExceptionFilter, GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ExecutionContext } from '@nestjs/common';
import { I18nValidationException } from 'nestjs-i18n';

@Catch(HttpException)
export class ThrowExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Convertir el contexto a ExecutionContext
    const context = host as ExecutionContext;
    const gqlContext = GqlExecutionContext.create(context);

    if (gqlContext.getType() === 'graphql') {
      // Manejar la excepción en el contexto GraphQL
      throw new GraphQLError(exception.message, {
        extensions: {
          code: exception.name,
          status: exception.getStatus(),
        },
      });
    } else {
      // Manejar la excepción en el contexto HTTP (Swagger)
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();
      const message = exception.message || 'Internal server error';

      response.status(status).json({
        statusCode: status,
        message,
        error: exception.name,
      });
    }
  }
}
