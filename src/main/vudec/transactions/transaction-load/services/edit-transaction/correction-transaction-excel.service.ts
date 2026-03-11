import { CorrectionProcessResult } from '../../interfaces/transaction-load.interface';
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

            console.time('preload');
            const { transactionMap, uuidErrors } = await this.excelRowLoader.preloadTransactions(rows);
            console.timeEnd('preload');

            console.time('processRows');
            const { transactionsToUpdate, taxpayersToUpdate, errors } = await this.correctionRowProcessor.processCorrectionRows(rows, transactionMap);
            console.timeEnd('processRows');

            // Unir errores de UUID con los demás errores
            const allErrors = [...uuidErrors, ...errors];

            //  Generar Excel de errores si existen
            let errorFileId = null;
            if (allErrors.length > 0) {
                this.logger.log(`Se encontraron ${allErrors.length} errores, generando archivo Excel`);
                console.time('generateErrorExcel');
                const errorResult = await this.correctionRowProcessor.generateErrorExcel(context, allErrors, fileId);
                console.timeEnd('generateErrorExcel');
                errorFileId = errorResult?.fileId;
            }

            // Si hay errores, retornar sin actualizar
            if (allErrors.length > 0) {
                this.logger.warn(`Procesamiento finalizado con ${allErrors.length} errores`);
                return { updated: 0, errors: allErrors, errorFileId };
            }

            // Persistir cambios si no hay errores
            console.time('persistChanges');
            await this.correctionRowProcessor.persistChanges(transactionsToUpdate, taxpayersToUpdate);
            console.timeEnd('persistChanges');

            this.logger.log(`${transactionsToUpdate.length} transacciones actualizadas exitosamente`);
            return { updated: transactionsToUpdate.length, errors: [], errorFileId };

        } catch (error) {
            // this.logger.error(`Error procesando archivo de corrección: ${error.message}`, error.stack);
            return { updated: 0, errors: [{ row: 0, message: `Error fatal: ${error.message}` }] };
        }
    }
}