import { TransactionRowDto } from '../../validators/save-transaction.validator';
import { TypeDoc } from 'src/main/vudec/taxpayer/enums/taxpayer-type.enum';
import * as ExcelJS from 'exceljs';

export class TransactionLoadMapper {
  constructor(private readonly COL: Record<string, number>) { }

  public mapRow(worksheet: ExcelJS.Worksheet, rowNumber: number): TransactionRowDto {
    const row = worksheet.getRow(rowNumber);

    const getColumn = (key: string): number => {
      const col = this.COL[key];

      if (typeof col !== 'number' || col <= 0) throw new Error(`Columna inválida para "${key}": ${col}`);

      return col;
    };

    const readCell = (key: string, caseType?: 'upper' | 'lower' | 'none'): string => {
      const col = getColumn(key);
      return this.getRawTrimmedCell(row.getCell(col), caseType || 'upper');
    };

    return {
      reversion: readCell('reversion'),
      contractNumber: readCell('contractNumber'),
      contractValue: readCell('contractValue'),
      contractDate: readCell('contractDate'),
      contractStartDate: readCell('contractStartDate'),
      contractEndDate: readCell('contractEndDate'),
      movementDate: readCell('movementDate'),
      movementValue: readCell('movementValue'),
      stampNumber: readCell('stampNumber'),
      firstName: readCell('firstName'),
      secondName: readCell('secondName',), // 
      firstLastName: readCell('firstLastName'),
      secondLastName: readCell('secondLastName'),
      docNumber: readCell('docNumber'),
      docType: readCell('docType'),
      email: readCell('email', 'lower'),
      phone: readCell('phone'),
    };
  }

  private getRawTrimmedCell(cell: ExcelJS.Cell, caseType: 'upper' | 'lower' | 'none' = 'upper'): string {
    const value = cell.value;
    if (value === null || value === undefined) return '';
    try {
      let result = '';
      if (typeof value === 'string') result = String(value).trim();
      else if (typeof value === 'number') result = String(value).trim();
      else if (value instanceof Date) result = String(cell.text || '').trim();
      else if (typeof value === 'object') {
        if ('text' in value) result = String(value.text).trim();
        else if ('result' in value) result = String(value.result).trim();
      }

      if (caseType === 'upper') return result.toUpperCase();
      if (caseType === 'lower') return result.toLowerCase();
      return result;
    } catch { return ''; }
    return '';
  }
}

export function parseNumericValue(value?: string): number | undefined {
  if (!value || value === '') return undefined;
  try {
    const cleaned = String(value).replace(/[,\s]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  } catch {
    return undefined;
  }
}

export function parseDocType(docType?: string): TypeDoc | undefined {
  if (!docType) return undefined;

  const cleaned = String(docType)
    .normalize('NFD')
    .replace(/[^A-Za-z]/g, '')

  const docTypeMap: Record<string, TypeDoc> = {
    CC: TypeDoc.CC,
    CEDULA: TypeDoc.CC,
    CEDULAC: TypeDoc.CC,
    TI: TypeDoc.TI,
    TARJETAIDENTIDAD: TypeDoc.TI,
    TE: TypeDoc.TE,
    TARJETAEXTRANJERIA: TypeDoc.TE,
    CE: TypeDoc.CE,
    RC: TypeDoc.RC,
    NIT: TypeDoc.NIT,
    NITEXT: TypeDoc.NIT,
    PAS: TypeDoc.PAS,
  };

  return docTypeMap[cleaned];
}

export function parseReversion(reversionStr?: string): boolean {
  return String(reversionStr || '') === 'SI';
}