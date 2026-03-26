import { ErrorsEditingTransactionsService } from '../generate-error-template/errors-editing-transactions.service';
import { ExcelRowError, ProcessResult } from '../../interfaces/transaction-load.interface';
import { ValidationResponse } from '../../../transaction/enum/validation-response.enum';
import { TransactionStatus } from '../../../transaction/enum/transaction-status.enum';
import { ProcessCorrectionRowsResult } from '../../interfaces/correction.interface';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { Transaction } from '../../../transaction/entities/transaction.entity';
import { Taxpayer } from 'src/main/vudec/taxpayer/entity/taxpayer.entity';
import { EditTransactionRowDto } from '../../types/edit-transaction.type';
import { EXCEL_CONFIG } from '../../constants/edit-transaction.constants';
import { GUID_FORMAT } from '../../utils/data-format.utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class CorrectionRowProcessor {
    private readonly logger = new Logger(CorrectionRowProcessor.name);

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly errorsEditingService: ErrorsEditingTransactionsService,
    ) { }

    async processCorrectionRows(rows: EditTransactionRowDto[], transactionMap: Map<string, Transaction>): Promise<ProcessCorrectionRowsResult> {
        const errors: ExcelRowError[] = [];
        const transactionsToUpdate: Transaction[] = [];
        const taxpayersToUpdate = new Map<string, string>();

        for (const row of rows) {
            const result = await this.processRow(row, transactionMap, taxpayersToUpdate);

            if (!result.success) {
                if (result.error) {
                    errors.push({
                        ...result.error,
                        originalData: row,
                    });
                }
                continue;
            }

            if (result.transaction) {
                transactionsToUpdate.push(result.transaction);
            }
        }

        return { transactionsToUpdate, taxpayersToUpdate, errors };
    }

    async processRow(row: EditTransactionRowDto, transactionMap: Map<string, Transaction>, taxpayersToUpdate: Map<string, string>): Promise<ProcessResult> {

        const transaction = transactionMap.get(row.transactionId);

        if (!transaction) {
            return {
                success: false,
                error: {
                    row: row.rowNumber,
                    message: `No se encontró la transacción ${row.transactionId}`,
                },
            };
        }
        try {
            const updatedTransaction = this.updateTransaction(
                transaction,
                row.newContractNumber,
                row.newTaxpayerNumber,
            );

            if (row.newTaxpayerNumber && transaction.taxpayerId) {
                if (!this.isValidGUID(transaction.taxpayerId)) {
                    return {
                        success: false,
                        error: {
                            row: row.rowNumber,
                            message: `ID de contribuyente inválido: ${transaction.taxpayerId}`,
                        },
                    };
                }

                taxpayersToUpdate.set(transaction.taxpayerId, row.newTaxpayerNumber);
            }

            return { success: true, transaction: updatedTransaction };
        } catch (error) {
            return {
                success: false,
                error: {
                    row: row.rowNumber,
                    message: error.message,
                },
            };
        }
    }

    updateTransaction(transaction: Transaction, newContractNumber: string, newTaxpayerNumber?: string): Transaction {

        transaction.contractNumber = newContractNumber;

        if (transaction.data) {
            try {
                const dataJson = JSON.parse(transaction.data);

                dataJson.consecutive = newContractNumber;

                if (newTaxpayerNumber) {
                    if (transaction.taxpayer) {
                        transaction.taxpayer.taxpayerNumber = newTaxpayerNumber;
                    }

                    if (dataJson.taxpayerInput) {
                        dataJson.taxpayerInput.taxpayerNumber = newTaxpayerNumber;
                    }
                }
                transaction.data = JSON.stringify(dataJson);
            } catch {
                throw new Error('JSON inválido en data');
            }
        }

        transaction.status = TransactionStatus.PENDING;
        transaction.validation = ValidationResponse.PENDING;
        transaction.message = '';

        return transaction;
    }

    async persistChanges(transactionsToUpdate: Transaction[], taxpayersToUpdate: Map<string, string>): Promise<void> {

        await this.transactionRepository.manager.transaction(async manager => {
            if (transactionsToUpdate.length > 0) {
                for (let i = 0; i < transactionsToUpdate.length; i += EXCEL_CONFIG.BATCH_SIZE) {
                    const chunk = transactionsToUpdate.slice(i, i + EXCEL_CONFIG.BATCH_SIZE);
                    const validChunk = chunk.filter(transaction => this.isValidGUID(transaction.id));

                    if (!validChunk.length) {
                        this.logger.warn(`No hay transacciones válidas en chunk ${i}`);
                        continue;
                    }

                    try {
                        await manager.save(Transaction, validChunk, { chunk: EXCEL_CONFIG.BATCH_SIZE });
                        this.logger.log(`Guardadas ${validChunk.length} transacciones en BD`);
                    } catch (error) {
                        this.logger.error(`Error guardando transacciones: ${error.message}`, error);
                        throw error;
                    }
                }
            }

            if (taxpayersToUpdate.size > 0) {
                const taxpayersArray = Array.from(taxpayersToUpdate.entries())
                    .filter(([id]) => this.isValidGUID(id))
                    .map(([id, taxpayerNumber]) => ({
                        id,
                        taxpayerNumber: taxpayerNumber?.trim() || '',
                    }));

                if (!taxpayersArray.length) {
                    this.logger.warn('No hay contribuyentes válidos para actualizar');
                    return;
                }

                for (let i = 0; i < taxpayersArray.length; i += EXCEL_CONFIG.BATCH_SIZE) {
                    const chunk = taxpayersArray.slice(i, i + EXCEL_CONFIG.BATCH_SIZE);

                    try {
                        await manager.save(Taxpayer, chunk, { chunk: EXCEL_CONFIG.BATCH_SIZE });
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
        this.logger.log(summary.summary);

        return this.errorsEditingService.generateCorrectionErrorExcel(context, errors, fileId);
    }

    private isValidGUID(id: string): boolean {
        if (!id || typeof id !== 'string') return false;

        const trimmedId = id.trim();
        if (!trimmedId) return false;

        return GUID_FORMAT.test(trimmedId);
    }
}