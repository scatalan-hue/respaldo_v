import { TransactionLoadMapper } from '../../mappers/save-transaction.mapper/save-transaction.mapper';
import { ExcelErrorWriterService } from 'src/common/functions/excel/excel-error-writer.service';
import { TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH } from '../../config/paths.config';
import { loadWorkbookFromPath } from 'src/common/functions/excel/load-workbook-from-path';
import { TransactionLoadTemplateService } from '../transaction-load-template.service';
import { loadInputWorksheet } from 'src/common/functions/excel/load-input-worksheet';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { TransactionLoadEntity } from '../../entities/transaction-load.entity';
import { FilesService } from 'src/general/files/services/files.service';
import { BatchProcessorService } from './batch-processor.service';
import { DATA_START_ROW } from '../../constants/excel.constants';
import { LoadStatus } from '../../enums/save-transaction.enums';
import { SaveExcelService } from './save-data-excel.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COL } from '../../config/columns.config';
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
    //  Asegura que existe un registro de TransactionLoad
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
        transactionLoad.status = LoadStatus.IN_PROCESS;
        return this.transactionLoadRepo.save(transactionLoad);
    }

    //  Actualiza el estado del procesamiento
    private async updateStatus(transactionLoad: TransactionLoadEntity, status: LoadStatus): Promise<void> {
        transactionLoad.status = status;
        await this.transactionLoadRepo.save(transactionLoad);
    }

    //TODO: Mi objetivo en este metodo será :
    // cargar el archivo, llamar al metodo que recorre las filas del archivo, guardar errores y datos validos
    private async processInternal(context: IContext, fileId: string, userId: string) {

        const transactionLoad = await this.ensureTransactionLoad(fileId, userId);
        const originalFile = await this.filesService.findOne(context, fileId).catch(() => null);

        try {
            // Cargar el archivo
            const fileData = await this.filesService.findBuffer(context, fileId, true); //archivo cargado data + extencion
            const inputWorksheet = await loadInputWorksheet(fileData.buffer);

            const templateWorkbook = await loadWorkbookFromPath(TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH);
            const templateSheet = templateWorkbook.worksheets[0] || templateWorkbook.getWorksheet(1);

            if (!templateSheet) throw new Error('La plantilla no contiene hojas válidas');

            // Invoco al metodo que recorre las filas del archivo
            const { validRows, errorsGlobal, processedCount } = await this.batchProcessorService.processBatches(
                context,
                inputWorksheet,
                undefined, // No pasar templateSheet, ya no se escribe aquí
                this.rowMapper,
                DATA_START_ROW
            );

            // Manejo los errores Y genero el excel de errores
            const hasErrors = errorsGlobal.length > 0;

            if (hasErrors) {
                // Definir las columnas que se exportarán en el Excel de errores
                const columns = Object.keys(COL);
                const templatePath = TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH;
                // Adaptar los errores para el writer simplificado
                const simpleErrors = errorsGlobal.map(e => ({ originalData: e.originalData, message: e.message }));
                // Generar el workbook de errores usando el servicio centralizado
                const errorWorkbook = await this.excelErrorWriterService.writeErrorsToTemplate(
                    templatePath,
                    simpleErrors,
                    columns,
                    'estado',
                    'mensaje',
                    DATA_START_ROW
                );
                const resultFileInfo = await this.templateService.loadWorksheetFromBuffer(
                    context,
                    errorWorkbook,
                    `errors_${fileId}.xlsx`
                );

                if (resultFileInfo?.id) {
                    transactionLoad.loadErrorId = resultFileInfo.id;
                }

                await this.updateStatus(transactionLoad, LoadStatus.ERROR);
                return {
                    transactionLoad,
                    errors: errorsGlobal,
                    errorFileInfo: resultFileInfo,
                    validRows: [],
                    originalFile,
                };
            }

            //Guardo las filas válidas
            if (validRows.length > 0) {
                await this.saveExcelService.insertExcelInfo(validRows, context);
            }
            await this.updateStatus(transactionLoad, LoadStatus.COMPLETED);

            return {
                transactionLoad,
                errors: [],
                errorFileInfo: null,
                validRows,
                originalFile,
            };
        } catch (error) {
            this.logger.error(`Error en procesamiento: ${error.message}`, error);
            await this.updateStatus(transactionLoad, LoadStatus.ERROR);
            throw error;
        }
    }
    //   Procesa un archivo de transacciones cargado
    //   Punto de entrada público
    async processTransactionLoadFile(context: IContext, fileId: string, userId: string) {
        const result = await this.processInternal(context, fileId, userId);

        return {
            transactionLoad: result.transactionLoad,
            errors: result.errors,
            fileInfo: result.errorFileInfo ?? null,
            message:
                result.errors?.length > 0
                    ? 'Se encontraron errores durante la validación del archivo.'
                    : 'El archivo fue validado correctamente. Los datos quedaron listos para ser procesados.',
        };
    }
}
