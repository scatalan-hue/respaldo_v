import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
import moment from 'moment';

@Scalar('DateTime', (type) => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type';

  parseValue(value: string): Date {
    return new Date(process.env.STATE == 'dev' ? value : this.convert(value));
  }

  serialize(value: Date): string {
    if (value instanceof Date) {
      return process.env.STATE == 'dev' ? value.toISOString() : this.convert(value);
    } else if (moment(value).isValid()) {
      return process.env.STATE == 'dev' ? value : this.convert(value);
    }
    return null;
  }

  parseLiteral(ast: any): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }

  convert(value: Date | string): string {
    const fechaEnUTC5 = moment.utc(value).tz(process.env.TZ);
    return fechaEnUTC5.format();
  }
}
