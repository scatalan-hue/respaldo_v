import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelErrorWriterService {

    async writeErrorsToTemplate(
        templatePath: string,
        errorRows: { originalData: any, message?: string }[],
        columns: string[],
        statusColumn: string,
        messageColumn: string,
        startRow: number
    ): Promise<ExcelJS.Workbook> {

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);
        const worksheet = workbook.worksheets[0] || workbook.getWorksheet(1);

        let rowIndex = startRow;
        for (const { originalData, message = '' } of errorRows) {
            const rowData = columns.map(col => originalData[col] ?? '');
            // El campo status debe ser 'error'
            const statusColIdx = columns.indexOf(statusColumn);
            if (statusColIdx !== -1) {
                rowData[statusColIdx] = 'error';
            }
            // Mensaje de error general
            const messageColIdx = columns.indexOf(messageColumn);
            if (messageColIdx !== -1) {
                rowData[messageColIdx] = message;
            }
            worksheet.getRow(rowIndex).values = [, ...rowData];

            // Formato especial para status
            if (statusColIdx !== -1) {
                const cell = worksheet.getRow(rowIndex).getCell(statusColIdx + 1);
                cell.font = { color: { argb: 'FFFF0000' }, bold: true };
            }

            // Centrar y ajustar texto en todas las celdas de la fila
            const row = worksheet.getRow(rowIndex);
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