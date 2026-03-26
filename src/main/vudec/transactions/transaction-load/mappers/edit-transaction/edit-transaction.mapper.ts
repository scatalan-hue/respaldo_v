import { EditTransactionRowDto } from '../../types/edit-transaction.type';
import * as ExcelJS from 'exceljs';

export class EditTransactionRowMapper {
    constructor(private readonly columns: Record<string, number>) { }

    public mapRow(worksheet: ExcelJS.Worksheet, rowNumber: number): EditTransactionRowDto {

        const row = worksheet.getRow(rowNumber);
        const getColumn = (key: string): number => {
            const column = this.columns[key];

            if (typeof column !== 'number' || column <= 0) {
                throw new Error(`Columna inválida para "${key}": ${column}`);
            }
            return column;
        };

        const readCell = (key: string, caseType: 'upper' | 'lower' | 'none' = 'none'): string => {
            const column = getColumn(key);
            return this.getRawTrimmedCell(row.getCell(column), caseType);
        };

        const newTaxpayerNumber = readCell('newTaxpayerNumber', 'none');

        return {
            rowNumber,
            transactionId: readCell('item', 'upper'),
            currentContractNumber: readCell('contractNumber', 'upper'),
            currentTaxpayerNumber: readCell('taxpayerNumber', 'upper'),
            errorType: readCell('tipoDeError', 'none'),
            errorDescription: readCell('error', 'none'),
            newContractNumber: readCell('newContractNumber', 'upper'),
            newTaxpayerNumber: newTaxpayerNumber || undefined,
        };
    }

    private getRawTrimmedCell(cell: ExcelJS.Cell, caseType: 'upper' | 'lower' | 'none' = 'none'): string {
        const value = cell.value;
        if (value === null || value === undefined) return '';

        try {
            let result = '';

            if (typeof value === 'string') {
                result = value.trim();
            } else if (typeof value === 'number') {
                result = String(value).trim();
            } else if (value instanceof Date) {
                result = String(cell.text || '').trim();
            } else if (typeof value === 'object') {
                if ('text' in value) result = String(value.text ?? '').trim();
                else if ('result' in value) result = String(value.result ?? '').trim();
            }

            if (caseType === 'upper') return result.toUpperCase();
            if (caseType === 'lower') return result.toLowerCase();
            return result;
        } catch {
            return '';
        }
    }
}