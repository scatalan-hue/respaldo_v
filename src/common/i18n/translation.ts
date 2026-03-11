import { I18nContext } from 'nestjs-i18n';

export class Translations {
  public translateText(i18n: I18nContext, message: string, args: object) {
    return i18n.t(`test.${message}`, { args });
  }

  public guard(i18n: I18nContext, message: string, args: object) {
    return i18n.t(`guard.${message}`, { args });
  }
}
