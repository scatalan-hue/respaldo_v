import { ErrorRows } from 'src/main/vudec/transactions/transaction-load/interfaces/transaction-load.interface';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelErrorWriterService {

    async writeErrorsToTemplate(templatePath: string, errorRows: ErrorRows[], columns: string[], statusColumn: string, messageColumn: string, startRow: number): Promise<ExcelJS.Workbook> {

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);
        const worksheet = workbook.worksheets[0] || workbook.getWorksheet(1);

        let rowIndex = startRow;

        for (const { originalData, message = '' } of errorRows) {
            const rowData = columns.map(col => originalData[col] ?? '');

            const statusColIdx = columns.indexOf(statusColumn);    // El campo status debe ser 'error'

            if (statusColIdx !== -1) {
                rowData[statusColIdx] = 'ERROR';
            }

            const messageColIdx = columns.indexOf(messageColumn);  // Mensaje de error general

            if (messageColIdx !== -1) {
                rowData[messageColIdx] = message;
            }
            worksheet.getRow(rowIndex).values = [, ...rowData];

            // Formato especial para status
            if (statusColIdx !== -1) {
                const cell = worksheet.getRow(rowIndex).getCell(statusColIdx + 1);
                cell.font = { color: { argb: 'FFFF0000' }, bold: true };
            }

            const row = worksheet.getRow(rowIndex);  // Centrar y ajustar texto en todas las celdas de la fila

            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                };
            });

            rowIndex++;
        }
        return workbook;
    }
}