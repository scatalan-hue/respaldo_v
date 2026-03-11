import { BadRequestException, Injectable, ValidationError, ValidationPipe } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class I18nValidation extends ValidationPipe {
  constructor(private readonly i18n?: I18nService) {
    super({
      exceptionFactory: (errors: ValidationError[]) => this.buildError(errors),
    });
  }

  private buildError(errors: ValidationError[]): BadRequestException {
    const translatedErrors = errors.map((error) => this.translateError(error));

    throw new BadRequestException(translatedErrors[0]);
  }

  private translateError(error: ValidationError) {
    const translatedConstraints = Object.keys(error.constraints || {}).reduce((acc, key) => {
      const constraint = error.constraints[key];
      const [translationKey, customArgs] = constraint.split('|', 2);

      let translateResponse: string;

      translateResponse = this.i18n.translate(`validation.${customArgs ? translationKey : key}`, {
        args: customArgs
          ? { ...JSON.parse(customArgs), property: error.property }
          : {
              property: error.property,
              value: error.value,
            },
      });

      return [...acc, `validation.${customArgs ? translationKey : key}` === translateResponse ? translationKey : translateResponse];
    }, []);

    return translatedConstraints.join(',').concat(error.children?.map((child) => this.translateError(child)).join(','));
  }
}
