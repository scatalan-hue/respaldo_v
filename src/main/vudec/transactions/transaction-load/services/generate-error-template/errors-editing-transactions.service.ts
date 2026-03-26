import { COLUMNS_ERROR_TEMPLATE_EDIT_TRANSACTIONS } from "../../constants/edit-transaction.constants";
import { loadWorkbookFromPath } from "src/common/functions/excel/load-workbook-from-path";
import { TransactionLoadTemplateService } from "../transaction-load-template.service";
import { TEMPLATE_ERRORS_WHEN_UPDATING } from "../../utils/exce-template-paths.utils";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { ExcelRowError } from "../../interfaces/transaction-load.interface";
import { Injectable, Logger } from "@nestjs/common";
import * as ExcelJS from 'exceljs';

@Injectable()
export class ErrorsEditingTransactionsService {
    private readonly logger = new Logger(ErrorsEditingTransactionsService.name);

    constructor(
        private readonly templateService: TransactionLoadTemplateService,
    ) { }

    hasErrors(errors: ExcelRowError[]): boolean {
        return Array.isArray(errors) && errors.length > 0;
    }

    getErrorSummary(errors: ExcelRowError[]): { totalErrors: number; summary: string } {
        const totalErrors = errors?.length ?? 0;

        return {
            totalErrors,
            summary: `Se encontraron ${totalErrors} errores durante el procesamiento del archivo.`,
        };
    }

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

    private writeErrorsToTemplate(worksheet: ExcelJS.Worksheet, errors: ExcelRowError[]): void {
        const groupedErrors = new Map<number, { data: any; messages: string[] }>();

        for (const error of errors) {
            const rowNum = error.row;

            if (!groupedErrors.has(rowNum)) {
                groupedErrors.set(rowNum, {
                    data: error.originalData ?? {},
                    messages: [],
                });
            }

            groupedErrors.get(rowNum)!.messages.push(error.message);
        }

        for (const [rowNum, { data, messages }] of groupedErrors.entries()) {
            const excelRow = worksheet.getRow(rowNum);

            excelRow.getCell(1).value = data?.transactionId ?? '';
            excelRow.getCell(2).value = data?.currentContractNumber ?? '';
            excelRow.getCell(3).value = data?.currentTaxpayerNumber ?? '';
            excelRow.getCell(4).value = data?.errorType ?? '';
            excelRow.getCell(5).value = data?.errorDescription ?? '';
            excelRow.getCell(6).value = data?.newContractNumber ?? '';
            excelRow.getCell(7).value = data?.newTaxpayerNumber ?? '';

            excelRow.getCell(COLUMNS_ERROR_TEMPLATE_EDIT_TRANSACTIONS.state).value = 'ERROR';
            excelRow.getCell(COLUMNS_ERROR_TEMPLATE_EDIT_TRANSACTIONS.errorsUpdating).value = messages.join('\n');

            const stateCell = excelRow.getCell(COLUMNS_ERROR_TEMPLATE_EDIT_TRANSACTIONS.state);
            stateCell.font = { bold: true, color: { argb: 'FFFF0000' } };
            stateCell.alignment = { vertical: 'middle', horizontal: 'center' };

            const errorCell = excelRow.getCell(COLUMNS_ERROR_TEMPLATE_EDIT_TRANSACTIONS.errorsUpdating);
            errorCell.font = { bold: true, color: { argb: 'FFFF0000' } };
            errorCell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };

            excelRow.height = 30;
            excelRow.commit();
        }
    }
}