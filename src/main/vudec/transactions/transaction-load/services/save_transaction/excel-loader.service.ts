import { TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH } from '../../utils/exce-template-paths.utils';
import { TransactionLoadMapper } from '../../mappers/save-transaction.mapper/save-transaction.mapper';
import { ExcelErrorWriterService } from 'src/common/functions/excel/excel-error-writer';
import { TransactionLoadTemplateService } from '../transaction-load-template.service';
import { loadInputWorksheet } from 'src/common/functions/excel/load-input-worksheet';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { TransactionLoadEntity } from '../../entities/transaction-load.entity';
import { FilesService } from 'src/general/files/services/files.service';
import { COL, EXCEL_CONFIG } from '../../constants/excel.constants';
import { BatchProcessorService } from './batch-processor.service';
import { LoadStatus } from '../../enums/save-transaction.enums';
import { SaveExcelService } from './save-data-excel.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionLoadService {
    private readonly logger = new Logger(TransactionLoadService.name);
    private readonly rowMapper = new TransactionLoadMapper(COL);

    constructor(
        @InjectRepository(TransactionLoadEntity)
        private readonly transactionLoadRepo: Repository<TransactionLoadEntity>,
        private readonly excelErrorWriterService: ExcelErrorWriterService,
        private readonly templateService: TransactionLoadTemplateService,
        private readonly batchProcessorService: BatchProcessorService,
        private readonly saveExcelService: SaveExcelService,
        private readonly filesService: FilesService,
    ) { }

    async processTransactionLoadFile(context: IContext, fileId: string, userId: string) {
        const result = await this.processInternal(context, fileId, userId);
        return {
            transactionLoad: result.transactionLoad,
            errors: result.errors,
            fileInfo: result.errorFileInfo ?? null,
            persistenceSummary: result.persistenceSummary,
            message:
                result.errors?.length > 0
                    ? 'Se encontraron errores durante la validación del archivo.'
                    : result.persistenceSummary?.failedCount > 0
                        ? 'El archivo fue validado, pero ocurrieron errores durante la persistencia.'
                        : 'El archivo fue procesado correctamente.',
        };
    }

    private async processInternal(context: IContext, fileId: string, userId: string) {
        const transactionLoad = await this.ensureTransactionLoad(fileId, userId);

        try {
            const fileData = await this.filesService.findBuffer(context, fileId, true);
            const inputWorksheet = await loadInputWorksheet(fileData.buffer);

            const { validRows, errorsGlobal } = await this.batchProcessorService.processBatches(
                context,
                inputWorksheet,
                this.rowMapper,
                EXCEL_CONFIG.START_ROW,
            );

            // Errores de validación
            if (errorsGlobal.length > 0) {
                const columns = Object.keys(COL);
                const templatePath = TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH;

                const errors = errorsGlobal.map(e => ({
                    originalData: e.originalData,
                    message: e.message,
                }));

                const errorWorkbook = await this.excelErrorWriterService.writeErrorsToTemplate(
                    templatePath,
                    errors,
                    columns,
                    'estado',
                    'mensaje',
                    EXCEL_CONFIG.START_ROW,
                );

                const resultFileInfo = await this.templateService.loadWorksheetFromBuffer(
                    context,
                    errorWorkbook,
                    `errors_${fileId}.xlsx`,
                );

                const loadErrorId = resultFileInfo?.id ?? null;
                await this.updateStatus(transactionLoad, LoadStatus.ERROR, loadErrorId);

                return {
                    transactionLoad,
                    errors: errorsGlobal,
                    errorFileInfo: resultFileInfo,
                    persistenceSummary: null,
                };
            }
            // Persistencia
            const persistenceSummary = validRows.length > 0
                ? await this.saveExcelService.insertExcelInfo(validRows, context)
                : { total: 0, successCount: 0, failedCount: 0, failures: [] };

            // Si hubo errores guardando, NO marcar completed
            if (persistenceSummary.failedCount > 0) {
                await this.updateStatus(transactionLoad, LoadStatus.ERROR, null);

                return {
                    transactionLoad,
                    errors: [],
                    errorFileInfo: null,
                    persistenceSummary,
                };
            }

            await this.updateStatus(transactionLoad, LoadStatus.COMPLETED, null);

            return {
                transactionLoad,
                errors: [],
                errorFileInfo: null,
                persistenceSummary,
            };
        } catch (error) {
            this.logger.error(`Error en procesamiento: ${error.message}`, error.stack);
            await this.updateStatus(transactionLoad, LoadStatus.ERROR, null);
            throw error;
        }
    }

    private async ensureTransactionLoad(fileId: string, userId: string): Promise<TransactionLoadEntity> {
        let transactionLoad = await this.transactionLoadRepo.findOne({
            where: { loadId: fileId },
        });

        if (!transactionLoad) {
            transactionLoad = this.transactionLoadRepo.create({
                loadId: fileId,
                userId,
                status: LoadStatus.PENDING,
            });
        }
        // limpiar residuos de ejecuciones anteriores
        transactionLoad.userId = userId;
        transactionLoad.status = LoadStatus.IN_PROCESS;
        transactionLoad.loadErrorId = null;

        return this.transactionLoadRepo.save(transactionLoad);
    }
    private async updateStatus(transactionLoad: TransactionLoadEntity, status: LoadStatus, loadErrorId: string | null = transactionLoad.loadErrorId ?? null): Promise<void> {
        transactionLoad.status = status;
        transactionLoad.loadErrorId = loadErrorId ?? null;
        await this.transactionLoadRepo.save(transactionLoad);
    }
}