import { loadWorkbookFromPath } from "src/common/functions/excel/load-workbook-from-path";
import { TransactionLoadTemplateService } from "../transaction-load-template.service";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { ExcelRowError } from "../../interfaces/transaction-load.interface";
import { TEMPLATE_ERRORS_WHEN_UPDATING } from "../../utils/exce-template-paths.utils";
import { COLUMS } from "../../constants/excel.constants";
import { Injectable, Logger } from "@nestjs/common";
import * as ExcelJS from 'exceljs';

@Injectable()
export class ErrorsEditingTransactionsService {
    private readonly logger = new Logger(ErrorsEditingTransactionsService.name);

    constructor(
        private readonly templateService: TransactionLoadTemplateService,
    ) { }

    async generateCorrectionErrorExcel(context: IContext, errors: ExcelRowError[], fileId: string): Promise<{ fileId: string } | null> {


        if (!errors || errors.length === 0) {
            this.logger.warn('No hay errores para generar archivo Excel');
            return null;
        }

        try {
            this.logger.log(`Generando Excel de errores para ${errors.length} registros`);

            const workbook = await loadWorkbookFromPath(TEMPLATE_ERRORS_WHEN_UPDATING);
            const worksheet = workbook.worksheets[0] || workbook.getWorksheet(1);

            // Paso 2: Escribir cada error en la plantilla
            this.writeErrorsToTemplate(worksheet, errors);

            // Paso 3: Guardar el archivo Excel
            const resultFileInfo = await this.templateService.loadWorksheetFromBuffer(
                context,
                workbook,
                `ERRORS_WHEN_UPDATING${fileId}.xlsx`
            );

            if (resultFileInfo?.id) {
                this.logger.log(`Excel de errores generado exitosamente: ${resultFileInfo.id}`);
                return { fileId: resultFileInfo.id };
            }

            this.logger.warn('No se pudo obtener el ID del archivo generado');
            return null;

        } catch (error) {
            this.logger.error(
                `Error generando Excel de errores: ${error.message}`,
                error.stack
            );
            return null;
        }
    }

    private writeErrorsToTemplate(
        worksheet: ExcelJS.Worksheet,

        errors: ExcelRowError[]
    ): void {
        // Agrupar errores por fila
        const groupedErrors = new Map<number, { data: any, messages: string[] }>();
        for (const error of errors) {
            const rowNum = error.row;
            const data = Array.isArray(error.originalData) ? error.originalData : [];
            if (!groupedErrors.has(rowNum)) {
                groupedErrors.set(rowNum, { data, messages: [] });
            }
            groupedErrors.get(rowNum)!.messages.push(error.message);
        }

        for (const [rowNum, { data, messages }] of groupedErrors.entries()) {
            const totalCols = worksheet.columnCount;
            const rowData = [...data];
            while (rowData.length < totalCols + 1) rowData.push('');
            rowData[COLUMS.state] = 'ERROR';
            rowData[COLUMS.errorsUpdating] = messages.join('\n');

            const excelRow = worksheet.getRow(rowNum);
            excelRow.values = rowData;

            const errorCell = excelRow.getCell(COLUMS.errorsUpdating);
            errorCell.font = { bold: true, color: { argb: 'FFFF0000' } };
            errorCell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
            excelRow.height = 30;
            excelRow.commit();
        }
    }

    hasErrors(errors: ExcelRowError[]): boolean {
        return errors && errors.length > 0;
    }
    getErrorSummary(errors: ExcelRowError[]): { total: number; summary: string } {
        if (!this.hasErrors(errors)) {
            return { total: 0, summary: 'No hay errores' };
        }
        const errorCount = errors.length;
        const uniqueMessages = new Set(errors.map(e => e.message));
        return {
            total: errorCount,
            summary: `${errorCount} errores encontrados en ${uniqueMessages.size} tipo(s) de error`,
        };
    }
}