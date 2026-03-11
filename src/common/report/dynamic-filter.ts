import { BadRequestException, Injectable } from '@nestjs/common';
import { Borders, Fill, Font } from 'exceljs';
import { SelectQueryBuilder } from 'typeorm';

export class Filter {
  filterName: string;
  fieldName: string;
  fieldAgregationName?: string;
  dataType: string;
  canfilter: boolean;
  cangroup: boolean;
  canorder: boolean;
  order?: number;
  reportOpt?: ReportOptions;
}
export class ReportOptions {
  columnWidth?: number;
  columnHidden?: boolean;
  columnName?: string;
  columnFmt?: string;
  cellConfig?: CellConfig;
  colConfig?: CellConfig;
}

export class CellConfig {
  cellFont?: Font;
  cellBorder?: Borders;
  cellFill?: Fill;
}
/**
 * !For more colors https://rgbacolorpicker.com/
 * !To parse https://rgbacolorpicker.com/hex-to-rgba
 * @param item
 * @returns
 */
export const defaultColConfig = () => {
  return {
    cellBorder: {
      bottom: { color: { argb: 'FF000000' }, style: 'thin' },
      left: { color: { argb: 'FF000000' }, style: 'thin' },
      right: { color: { argb: 'FF000000' }, style: 'thin' },
      top: { color: { argb: 'FF000000' }, style: 'thin' },
    },
    cellFill: {
      type: 'pattern',
      pattern: 'solid',
      bgColor: { argb: 'FFFFFF' }, //color de fuera default es black
      fgColor: { argb: 'ABAAAA' }, //color del contenido default es white
    },
    cellFont: { bold: true, color: { argb: 'FF000000' } },
  } as CellConfig;
};
export const defaultCellConfig = () => {
  return {
    cellBorder: {
      bottom: { color: { argb: 'FF000000' }, style: 'thin' },
      left: { color: { argb: 'FF000000' }, style: 'thin' },
      right: { color: { argb: 'FF000000' }, style: 'thin' },
      top: { color: { argb: 'FF000000' }, style: 'thin' },
    },
    cellFont: { bold: false, color: { argb: 'FF000000' } },
  } as CellConfig;
};

/**
 * Create a queueryBuilder class
 */
@Injectable()
export class QueryBuilder {
  /**
   * Builds qb
   * @param qb SelectQueryBuilder<Entity>
   * @param [fields] Fields based in Filter Class in common folder
   * @param [whereOptions] String based in dvExtreme framework see documentation about this stuff (Filter string is array object)
   * @param [groupOptions] String based in dvExtreme framework see documentation about this stuff (Group string is array object)
   * @param [orderOptions] String based in dvExtreme framework see documentation about this stuff (Order string is array object)
   * @returns qb Updated
   */
  BuildQB(qb: SelectQueryBuilder<any>, fields?: Filter[], whereOptions?: string, groupOptions?: string, orderOptions?: string) {
    //Si no hay opciones de filtro no se filtra nada
    if (!fields || fields.length === 0) {
      return qb;
    }

    //Filtros standards
    if (whereOptions) {
      const qbfx = this.buildQuery(JSON.parse(whereOptions), fields);
      qb.andWhere(qbfx.query);
      qb.setParameters(qbfx.fields);
    }

    //Agrupaciones
    if (groupOptions) {
      const obj = JSON.parse(groupOptions);

      if (!Array.isArray(obj)) {
        throw new BadRequestException('Please check group request');
      }

      const grp = obj[0]?.selector;
      if (!grp) {
        throw new BadRequestException('Please check group request');
      }

      const fieldgroup = fields.find((x) => x.filterName === grp && x.cangroup)?.fieldName;
      if (!fieldgroup || fieldgroup === '') {
        throw new BadRequestException(`Field ${grp} not found`);
      }
      qb.addGroupBy(fieldgroup);
      qb.select([`${fieldgroup} as key `]);
    }

    //Order (No aplica para agrupaciones [Por ahora])
    if (orderOptions) {
      const obj = JSON.parse(orderOptions);

      if (!Array.isArray(obj)) {
        throw new BadRequestException('Please check sort request');
      }

      const srt = obj[0]?.selector;
      const srtdesc = obj[0]?.desc;
      if (!srt) {
        throw new BadRequestException('Please check sort request');
      }

      const fieldsortable = fields.find((x) => x.filterName === srt && x.canorder).fieldName;
      qb.addOrderBy(fieldsortable, srtdesc ? 'DESC' : 'ASC');
    }

    return qb;
  }

  private buildQuery(baseFilters, expectedFields, fieldsCount?, isNegated?) {
    if (!Array.isArray(baseFilters)) throw new BadRequestException(JSON.stringify(baseFilters) + ' is not an array'); //

    if (!fieldsCount) fieldsCount = {};

    if (isNegated === undefined) isNegated = false;

    const unitary = ['!'];
    const binary = ['=', '<>', '>', '<=', '>=', '<', 'startswith', 'notstartswith', 'endswith', 'notendswith', 'contains', 'notcontains'];
    const binarySql = ['=', '!=', '>', '<=', '>=', '<', 'like', 'not like', 'like', 'not like', 'like', 'not like'];
    const complex = ['and', 'or'];

    //verificar si lo que me llego es un operador unitario
    if (unitary.includes(baseFilters[0])) {
      if (baseFilters.length !== 2) throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid unitary operator (should have 1 argument)');

      const argQuery = baseFilters[1];

      const resp = this.buildQuery(argQuery, expectedFields, fieldsCount, !isNegated); //invierto el valor de is negated y se lo paso a los decendientes

      return {
        type: 'unitary',
        children: [resp],
        query: resp.query,
        fields: { ...resp.fields },
      };
    } else if (binary.includes(baseFilters[1])) {
      if (baseFilters.length !== 3) throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid binary operator (should have 2 arguments)');

      const firstArg = baseFilters[0];
      const boolOperator = baseFilters[1];
      const secondArg = baseFilters[2];

      if (typeof firstArg !== 'string')
        throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid binary operator (first argument should be a string)');

      if (firstArg === '') throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid binary operator (first argument should not be empty)');

      const field = expectedFields.find((x) => x.filterName == firstArg && x.canfilter);

      if (field === undefined) throw new BadRequestException(JSON.stringify(baseFilters) + ' is invalid (filter field [' + firstArg + '] not expected)');

      const fieldDBName = field.fieldName; //nombre que se espera en la base de datos (con todo y prefijo del alias)

      if (Array.isArray(secondArg))
        throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid binary operator (second argument should not be an array)');

      if (typeof secondArg === 'object')
        throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid binary operator (second argument should not be an object)');

      if (secondArg === undefined)
        throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid binary operator (second argument should not be undefined)');

      if (fieldsCount[firstArg] === undefined) fieldsCount[firstArg] = 0;

      const fieldIx = ++fieldsCount[firstArg];

      const fieldName = firstArg + fieldIx;
      let fieldValue = secondArg;

      if (['startswith', 'notstartswith'].includes(boolOperator)) fieldValue = fieldValue + '%';

      if (['endswith', 'notendswith'].includes(boolOperator)) fieldValue = '%' + fieldValue;

      if (['contains', 'notcontains'].includes(boolOperator)) fieldValue = '%' + fieldValue + '%';

      const retFields = {};
      retFields[fieldName] = fieldValue;

      let opIdx = binary.indexOf(boolOperator); //index of operator

      if (isNegated)
        //si es negado invierto el operador
        opIdx = opIdx % 2 == 0 ? opIdx + 1 : opIdx - 1; //the complement on that operator

      const myQuery =
        fieldDBName +
        (['startswith', 'notstartswith', 'endswith', 'notendswith', 'contains', 'notcontains'].includes(boolOperator) ? '::text' : '') +
        ' ' +
        binarySql[opIdx] +
        ' :' +
        fieldName;

      return { type: 'binary', query: myQuery, fields: retFields };
    } else if (complex.includes(baseFilters[1])) {
      if (baseFilters.length < 3)
        throw new BadRequestException(JSON.stringify(baseFilters) + " is not a valid ( 'and','or' should have 2 or more conditions to join)");

      if (baseFilters.length % 2 == 0)
        throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid (there should be an even number of operators)');

      const myChildren = [];

      const firstArg = baseFilters[0];

      if (Array.isArray(firstArg)) {
        //primer argumento de la cadena de and, or
        const resp = this.buildQuery(firstArg, expectedFields, fieldsCount, isNegated);
        myChildren.push(resp);
      }

      let boolOperator = baseFilters[1];

      if (isNegated) boolOperator = boolOperator == 'and' ? 'or' : 'and'; //voltear operadores and y or cuando es negada la condicion

      if (baseFilters.length === 3) {
        //si solo son 2 argumentos
        const secondArg = baseFilters[2]; //primer argumento de de and, or

        if (Array.isArray(secondArg)) {
          const resp = this.buildQuery(secondArg, expectedFields, fieldsCount, isNegated);
          myChildren.push(resp);
        }
      } else {
        const resp = this.buildQuery(baseFilters.slice(2), expectedFields, fieldsCount, isNegated); //si son mas de dos envio el resto como si estuvieran entre parentesis
        myChildren.push(resp);
      }

      return {
        type: 'complex',
        children: myChildren,
        query:
          '(' +
          myChildren.reduce(function (a, b) {
            return a.query + ' ' + boolOperator + ' ' + b.query;
          }) +
          ')', //concateno entre parentesis los resultados de and & or
        fields: myChildren.reduce(function (a, b) {
          return { ...a.fields, ...b.fields };
        }),
      };
    }

    throw new BadRequestException(JSON.stringify(baseFilters) + ' is not a valid expression/condition');
  }
}
