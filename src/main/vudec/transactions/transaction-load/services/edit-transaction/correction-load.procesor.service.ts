import { ErrorsEditingTransactionsService } from "../generate-error-template/errors-editing-transactions.service";
import { CorrectionRowValidator } from "../../validators/correction-row-transacation.validator";
import { ExcelRowError, ProcessResult } from "../../interfaces/transaction-load.interface";
import { ValidationResponse } from "../../../transaction/enum/validation-response.enum";
import { TransactionStatus } from "../../../transaction/enum/transaction-status.enum";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { Transaction } from "../../../transaction/entities/transaction.entity";
import { Taxpayer } from "src/main/vudec/taxpayer/entity/taxpayer.entity";
import { Normalize } from "../../validators/save-transaction.validator";
import { BATCH_SIZE, EXCEL_COLUMNS } from "../../constants/excel.constants";
import { ExcelRowData } from "../../types/excel-row.type";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Row } from "exceljs";

@Injectable()
export class CorrectionRowProcessor {
    private readonly logger = new Logger(CorrectionRowProcessor.name);

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly validator: CorrectionRowValidator,
        private readonly errorsEditingService: ErrorsEditingTransactionsService,
    ) { }

    async processCorrectionRows(rows: ExcelRowData[], transactionMap: Map<string, Transaction>): Promise<{
        transactionsToUpdate: Transaction[];
        taxpayersToUpdate: Map<string, string>;
        errors: ExcelRowError[];
    }> {

        const errors: ExcelRowError[] = [];
        const transactionsToUpdate: Transaction[] = [];
        const taxpayersToUpdate = new Map<string, string>();

        for (const { row, rowNumber } of rows) {

            const result = await this.processRow(
                row,
                rowNumber,
                transactionMap,
                taxpayersToUpdate
            );

            if (!result.success) {
                if (result.error) {
                    errors.push({
                        ...result.error,
                        originalData: row.values
                    }
                    );
                }

            } else if (result.transaction) {
                transactionsToUpdate.push(result.transaction);
            }
        }
        return { transactionsToUpdate, taxpayersToUpdate, errors };
    }

    async processRow(row: Row, rowNumber: number, transactionMap: Map<string, Transaction>, taxpayersToUpdate: Map<string, string>): Promise<ProcessResult> {

        const transactionId = Normalize(row.getCell(EXCEL_COLUMNS.TRANSACTION_ID).value);
        const newContractNumber = Normalize(row.getCell(EXCEL_COLUMNS.CONTRACT_NUMBER).value);
        const newTaxpayerNumber = Normalize(row.getCell(EXCEL_COLUMNS.TAXPAYER_NUMBER).value);

        //validar que los datos principales existan
        let errorValidation = this.validator.ValidateExistingData(transactionId, newContractNumber, rowNumber);

        if (errorValidation) return { success: false, error: errorValidation }

        errorValidation = this.validator.validateTransactionIdStructure(transactionId, rowNumber);
        if (errorValidation) return { success: false, error: errorValidation }

        const transaction = transactionMap.get(transactionId);

        errorValidation = this.validator.validateTransactionExists(transaction, transactionId, rowNumber);
        if (errorValidation) return { success: false, error: errorValidation }

        errorValidation = this.validator.validateContractNumber(newContractNumber, rowNumber);
        if (errorValidation) return { success: false, error: errorValidation }

        errorValidation = this.validator.validateTaxpayerAssociation(transaction, rowNumber);
        if (errorValidation) return { success: false, error: errorValidation }

        errorValidation = this.validator.validateTaxpayerNumber(newTaxpayerNumber, rowNumber);
        if (errorValidation) return { success: false, error: errorValidation }

        try {
            const updateTransaction = this.updateTransaction(transaction, newContractNumber, newTaxpayerNumber);

            if (newTaxpayerNumber && transaction.taxpayerId) {
                // Validar que el taxpayerId sea un GUID válido antes de agregarlo
                if (!this.isValidGUID(transaction.taxpayerId)) {
                    return { success: false, error: { row: rowNumber, message: `ID de contribuyente inválido: ${transaction.taxpayerId}` } }
                }
                taxpayersToUpdate.set(transaction.taxpayerId, newTaxpayerNumber);
            }
            return { success: true, transaction: updateTransaction }

        } catch (error) {
            return { success: false, error: { row: rowNumber, message: error.message } }
        }
    }
    updateTransaction(transaction: Transaction, newContractNumber: string, newTaxpayerNumber: string): Transaction | ProcessResult {
        transaction.contractNumber = newContractNumber.toUpperCase();
        if (transaction.data) {
            try {
                const dataJson = JSON.parse(transaction.data);
                dataJson.consecutive = newContractNumber.toUpperCase();
                if (newTaxpayerNumber) {
                    transaction.taxpayer.taxpayerNumber = newTaxpayerNumber;
                    dataJson.taxpayerInput.taxpayerNumber = newTaxpayerNumber;
                }
                transaction.data = JSON.stringify(dataJson);
            } catch (error) {
                throw new Error('JSON invalido en data')
            }
        }
        transaction.status = TransactionStatus.PENDING;
        transaction.validation = ValidationResponse.PENDING;
        transaction.message = '';

        return transaction;
    }

    async persistChanges(transactionsToUpdate: Transaction[], taxpayersToUpdate: Map<string, string>): Promise<void> {

        await this.transactionRepository.manager.transaction(async manager => {

            // Paso 1: Guardar transacciones actualizadas
            if (transactionsToUpdate.length > 0) {
                for (let i = 0; i < transactionsToUpdate.length; i += BATCH_SIZE) {
                    const chunk = transactionsToUpdate.slice(i, i + BATCH_SIZE);

                    // Validar que todos los IDs sean válidos GUID antes de guardar
                    const validChunk = chunk.filter(t => this.isValidGUID(t.id));
                    if (validChunk.length === 0) {
                        this.logger.warn(`No hay transacciones válidas en chunk ${i}`);
                        continue;
                    }

                    try {
                        await manager.save(Transaction, validChunk, {
                            chunk: BATCH_SIZE
                        });
                        this.logger.log(`Guardadas ${validChunk.length} transacciones en BD`);
                    } catch (error) {
                        this.logger.error(`Error guardando transacciones: ${error.message}`, error);
                        throw error;
                    }
                }
            }

            // Paso 2: Guardar contribuyentes actualizados
            if (taxpayersToUpdate.size > 0) {
                const taxpayersArray = Array.from(taxpayersToUpdate.entries())
                    .filter(([id]) => this.isValidGUID(id))  // ← Validar GUIDs
                    .map(([id, taxpayerNumber]) => ({
                        id: id.trim(),  // ← Limpiar espacios
                        taxpayerNumber: taxpayerNumber?.trim() || '',
                    }));

                if (taxpayersArray.length === 0) {
                    this.logger.warn('No hay contribuyentes válidos para actualizar');
                    return;
                }

                for (let i = 0; i < taxpayersArray.length; i += BATCH_SIZE) {
                    const chunk = taxpayersArray.slice(i, i + BATCH_SIZE);

                    try {
                        await manager.save(Taxpayer, chunk, {
                            chunk: BATCH_SIZE
                        });
                        this.logger.log(`Actualizados ${chunk.length} contribuyentes en BD`);
                    } catch (error) {
                        this.logger.error(`Error guardando contribuyentes: ${error.message}`, error);
                        throw error;
                    }
                }
            }
        });
    }
    async generateErrorExcel(context: IContext, errors: ExcelRowError[], fileId: string) {
        if (!this.errorsEditingService.hasErrors(errors)) {
            this.logger.log('No hay errores para generar archivo Excel');
            return null;
        }

        const summary = this.errorsEditingService.getErrorSummary(errors);
        this.logger.log(`${summary.summary}`);

        return await this.errorsEditingService.generateCorrectionErrorExcel(context, errors, fileId);
    }
    private isValidGUID(id: string): boolean {
        if (!id || typeof id !== 'string') return false;

        const trimmedId = id.trim();

        // Validar que no esté vacío después de trimear
        if (!trimmedId) return false;

        // Validar formato UUID v4 estándar
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        return guidRegex.test(trimmedId);
    }
}