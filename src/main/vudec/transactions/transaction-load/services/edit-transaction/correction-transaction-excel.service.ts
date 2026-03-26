import { buildValidationOutput, validateRows } from '../../validators/correction-transaction.validator';
import { CorrectionProcessResult, ExcelRowError } from '../../interfaces/transaction-load.interface';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CorrectionRowProcessor } from './correction-load.procesor.service';
import { ExcelRowLoader } from './excel-row.loader.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TransactionCorrectionExcelService {
    private readonly logger = new Logger(TransactionCorrectionExcelService.name);

    constructor(
        private readonly correctionRowProcessor: CorrectionRowProcessor,
        private readonly excelRowLoader: ExcelRowLoader,
    ) { }

    async processCorrectionExcel(context: IContext, buffer: Buffer, fileId: string): Promise<CorrectionProcessResult> {
        try {
            console.time('loadExcel');
            const rows = await this.excelRowLoader.loadExcelRows(buffer);
            console.timeEnd('loadExcel');

            if (!rows.length) {
                this.logger.warn('No se encontraron filas para procesar');
                return { updated: 0, errors: [], errorFileId: null };
            }

            console.time('validateRows');
            const validationResults = validateRows(rows);
            const validationOutput = buildValidationOutput(validationResults);
            console.timeEnd('validateRows');

            const validationErrors: ExcelRowError[] = validationOutput.invalidRows.map(item => ({
                row: item.rowNumber,
                message: item.errors.join(' | '),
                originalData: item.row,
            }));

            if (!validationOutput.validRows.length) {
                let errorFileId = null;

                if (validationErrors.length > 0) {
                    this.logger.log(`Se encontraron ${validationErrors.length} errores de validación, generando archivo Excel`);
                    console.time('generateErrorExcel');
                    const errorResult = await this.correctionRowProcessor.generateErrorExcel(context, validationErrors, fileId);
                    console.timeEnd('generateErrorExcel');
                    errorFileId = errorResult?.fileId;
                }

                return {
                    updated: 0,
                    errors: validationErrors,
                    errorFileId,
                };
            }

            console.time('preload');
            const { transactionMap } = await this.excelRowLoader.preloadTransactions(validationOutput.validRows);
            console.timeEnd('preload');

            console.time('processRows');
            const { transactionsToUpdate, taxpayersToUpdate, errors } = await this.correctionRowProcessor.processCorrectionRows(validationOutput.validRows, transactionMap);
            console.timeEnd('processRows');

            const allErrors = [...validationErrors, ...errors];

            let errorFileId = null;
            if (allErrors.length > 0) {
                this.logger.log(`Se encontraron ${allErrors.length} errores, generando archivo Excel`);
                console.time('generateErrorExcel');
                const errorResult = await this.correctionRowProcessor.generateErrorExcel(context, allErrors, fileId);
                console.timeEnd('generateErrorExcel');
                errorFileId = errorResult?.fileId;
            }

            if (allErrors.length > 0) {
                this.logger.warn(`Procesamiento finalizado con ${allErrors.length} errores`);
                return {
                    updated: 0,
                    errors: allErrors,
                    errorFileId,
                };
            }

            console.time('persistChanges');
            await this.correctionRowProcessor.persistChanges(transactionsToUpdate, taxpayersToUpdate);
            console.timeEnd('persistChanges');

            this.logger.log(`${transactionsToUpdate.length} transacciones actualizadas exitosamente`);
            return {
                updated: transactionsToUpdate.length,
                errors: [],
                errorFileId,
            };

        } catch (error) {
            return {
                updated: 0,
                errors: [{ row: 0, message: `Error fatal: ${error.message}` }],
            };
        }
    }
}