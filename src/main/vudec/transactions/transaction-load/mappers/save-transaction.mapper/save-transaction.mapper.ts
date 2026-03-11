import { TransactionRowDto } from '../../validators/save-transaction.validator';
import { TypeDoc } from 'src/main/vudec/taxpayer/enums/taxpayer-type.enum';
import * as ExcelJS from 'exceljs';

export class TransactionLoadMapper {

  constructor(private readonly COL: Record<string, number>) { }

  mapRow(worksheet: ExcelJS.Worksheet, rowNumber: number): TransactionRowDto {
    const row = worksheet.getRow(rowNumber);

    const readCell = (col: number): string => this.normalizeCellValue(row.getCell(col));

    return {
      reversion: readCell(this.COL.reversion),
      contractNumber: readCell(this.COL.contractNumber),
      contractValue: readCell(this.COL.contractValue),
      contractDate: readCell(this.COL.contractDate),
      ContractStartDate: readCell(this.COL.ContractStartDate),
      ContractEndDate: readCell(this.COL.ContractEndDate),
      movementDate: readCell(this.COL.movementDate),
      movementValue: readCell(this.COL.movementValue),
      stampNumber: readCell(this.COL.stampNumber),
      firstName: readCell(this.COL.firstName),
      secondName: readCell(this.COL.secondName),
      firstLastName: readCell(this.COL.firstLastName),
      secondLastName: readCell(this.COL.secondLastName),
      docNumber: readCell(this.COL.docNumber),
      docType: readCell(this.COL.docType),
      email: readCell(this.COL.email),
      phone: readCell(this.COL.phone),
    };
  }

  private normalizeCellValue(cell: ExcelJS.Cell): string {
    const value = cell.value;
    if (value === null || value === undefined) return '';
    try {
      if (typeof value === 'string') return String(value || "").trim().toUpperCase();
      if (typeof value === 'number') return String(value);
      if (value instanceof Date) return String(cell.text || "").trim();
      if (typeof value === 'object') {
        if ('text' in value && typeof value.text === 'string') {
          return String(value.text || "").trim();
        }
        if ('result' in value && value.result !== undefined && value.result !== null) {
          return String(value.result).trim();
        }
      }
    } catch (error) {
      // Si hay error al procesar el valor, retornar vacio
      return '';
    }
    return '';
  }
}

//   Normaliza un string: trim y retorna undefined si esta vacio
export function normalizeString(value?: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  try {
    const text = String(value).trim().toUpperCase();
    return text === '' ? undefined : text;
  } catch (error) {
    return undefined;
  }
}
export function normalizeEmail(value?: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  try {
    const text = String(value).trim().toLowerCase();
    return text === '' ? undefined : text;
  } catch (error) {
    return undefined;
  }
}

//   Convierte string formato DD/MM/YYYY a Date
//   Asume que el formato ya fue validado por validateDateFormat()
export function parseDateFromValidated(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  try {
    const [day, month, year] = String(dateStr).trim().split('/').map(Number);
    if (!day || !month || !year) return undefined;
    const date = new Date(year, month - 1, day);
    // Validar que sea una fecha valida
    if (isNaN(date.getTime())) return undefined;
    return date;
  } catch (error) {
    return undefined;
  }
}
//   Limpia y convierte string numerico removiendo comas y espacios
export function parseNumericValue(value?: string): number | undefined {
  if (!value || value === '') return undefined;
  try {
    const cleaned = String(value).trim().replace(/[,\s]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  } catch (error) {
    return undefined;
  }
}

// Convierte string de tipo documento a enum TypeDoc
// Asume que el docType ya fue validado por validateRow()
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
//  Parsea booleano desde string SI/NO
//  Asume que ya fue validado por validateRow()
export function parseReversion(reversionStr?: string): boolean {
  return String(reversionStr || '').toUpperCase() === 'SI';
}
