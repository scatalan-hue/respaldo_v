import { ExecutionContext } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { ContextUtils } from '../../../patterns/crud-pattern/utils/context.utils';

function isExecutionContext(context: any): context is ExecutionContext {
  return context && typeof context.switchToHttp === 'function';
}

function isIContext(context: any): context is IContext {
  return context && 'user' in context;
}

export function sendResponse(
  context: IContext | ExecutionContext,
  space: string,
  path: string,
  args?: Record<string, string | number>,
  i18nService?: I18nService,
): string {
  try {
    let lang: string;
    let service: I18nService;

    if (i18nService) {
      service = i18nService;
    } else {
      const { service: i18nCtxService, lang: langI18nCtx } = I18nContext.current();

      service = i18nCtxService;
      lang = langI18nCtx;
    }

    if (isExecutionContext(context)) {
      const req = ContextUtils.getRequest(context);
      if (req.headers) {
        lang = req.headers.language;
      } else {
        lang = req.language;
      }
    } else if (isIContext(context)) {
      lang = context.language;
    }

    const jsonPath = `${space}.${path}`;

    return service.translate(jsonPath, {
      lang: lang,
      args,
    });
  } catch (error) {
    throw error;
  }
}
