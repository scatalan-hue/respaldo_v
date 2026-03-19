import { TransactionRowDto } from "../../validators/save-transaction.validator";
import * as ExcelJS from 'exceljs';


export function mapRow(worksheet: ExcelJS.Worksheet, rowNumber: number): TransactionRowDto {
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
