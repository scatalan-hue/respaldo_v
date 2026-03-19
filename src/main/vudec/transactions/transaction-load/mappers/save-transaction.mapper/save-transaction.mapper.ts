import { TransactionRowDto } from '../../validators/save-transaction.validator';
import { TypeDoc } from 'src/main/vudec/taxpayer/enums/taxpayer-type.enum';
import * as ExcelJS from 'exceljs';

export class TransactionLoadMapper {
  constructor(private readonly COL: Record<string, number>) { }

  public mapRow(worksheet: ExcelJS.Worksheet, rowNumber: number): TransactionRowDto {
    const row = worksheet.getRow(rowNumber);

    const getColumn = (key: string): number => {
      const col = this.COL[key];
      if (typeof col !== 'number' || col <= 0) {
        throw new Error(`Columna inválida para "${key}": ${col}`);
      }
      return col;
    };

    const readCell = (key: string): string => {
      const col = getColumn(key);
      return this.normalizeCellValue(row.getCell(col));
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
      secondName: readCell('secondName'),
      firstLastName: readCell('firstLastName'),
      secondLastName: readCell('secondLastName'),
      docNumber: readCell('docNumber'),
      docType: readCell('docType'),
      email: readCell('email'),
      phone: readCell('phone'),
    };
  }

  private normalizeCellValue(cell: ExcelJS.Cell): string {
    const value = cell.value;
    if (value === null || value === undefined) return '';

    try {
      if (typeof value === 'string') return String(value).trim().toUpperCase();
      if (typeof value === 'number') return String(value).trim();
      if (value instanceof Date) return String(cell.text || '').trim();
      if (typeof value === 'object') {
        if ('text' in value && typeof value.text === 'string') {
          return String(value.text).trim().toUpperCase();
        }
        if ('result' in value && value.result !== undefined && value.result !== null) {
          return String(value.result).trim().toUpperCase();
        }
      }
    } catch {
      return '';
    }

    return '';
  }
}



export function parseNumericValue(value?: string): number | undefined {
  if (!value || value === '') return undefined;
  try {
    const cleaned = String(value).trim().replace(/[,\s]/g, '');
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
    .toUpperCase();

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
  return String(reversionStr || '').toUpperCase() === 'SI';
}