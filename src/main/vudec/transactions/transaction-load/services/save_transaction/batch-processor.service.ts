import { isRowEmpty, TransactionRowDto, validateRow } from '../../validators/save-transaction.validator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class BatchProcessorService {
    private readonly logger = new Logger(BatchProcessorService.name);
    private readonly BATCH_SIZE = 10;

    constructor(private readonly eventEmitter: EventEmitter2) { }
    //   Procesa filas del Excel en batches de 10
    //   Retorna filas válidas y errores encontrados
    async processBatches(context: IContext, inputWorksheet: ExcelJS.Worksheet, templateSheet: ExcelJS.Worksheet | undefined, rowMapper: any, dataStartRow: number
    ): Promise<{
        validRows: TransactionRowDto[];
        errorsGlobal: { rowNumber: number; originalData: TransactionRowDto; message: string }[];
        processedCount: number;
    }> {
        const errorsGlobal: { rowNumber: number; originalData: TransactionRowDto; message: string }[] = [];
        const validRows: TransactionRowDto[] = [];
        const lastRow = inputWorksheet.lastRow?.number ?? 0;
        let processedCount = 0;
        for (let rowNumber = dataStartRow; rowNumber <= lastRow; rowNumber += this.BATCH_SIZE) {
            const batchEndRow = Math.min(rowNumber + this.BATCH_SIZE - 1, lastRow);
            const batchPromises = [];
            for (let currentRow = rowNumber; currentRow <= batchEndRow; currentRow++) {
                batchPromises.push(
                    this.processRow(context, inputWorksheet, templateSheet, currentRow, rowMapper)
                );
            }
            const batchResults = await Promise.all(batchPromises);
            for (const result of batchResults) {
                if (result.isEmpty) continue;
                if (result.errors.length > 0) {
                    errorsGlobal.push({
                        rowNumber: result.rowNumber,
                        originalData: result.dto,
                        message: result.errors.join('\n'),
                    });
                } else {
                    validRows.push(result.dto);
                }
                processedCount++;
            }
        }
        return {
            validRows,
            errorsGlobal,
            processedCount,
        };
    }
    //   Procesa una fila individual
    //   Mapea, valida y (opcionalmente) escribe en la plantilla
    private async processRow(context: IContext, inputWorksheet: ExcelJS.Worksheet, templateSheet: ExcelJS.Worksheet | undefined, rowNumber: number, rowMapper: any
    ): Promise<{ rowNumber: number; dto: TransactionRowDto; errors: string[]; isEmpty: boolean; }> {
        try {
            // Mapear fila a DTO
            const dto = rowMapper.mapRow(inputWorksheet, rowNumber);
            const isEmpty = isRowEmpty(dto);

            if (isEmpty) {
                return { rowNumber, dto, errors: [], isEmpty: true };
            }
            const rowErrors = await validateRow(context, dto, this.eventEmitter);
            // Ya no se escribe en la plantilla aquí
            return {
                rowNumber,
                dto,
                errors: rowErrors,
                isEmpty: false,
            };
        }
        catch (error) {
            this.logger.error(`Error procesando fila ${rowNumber}:`, error);
            return {
                rowNumber,
                dto: undefined as any,
                errors: [`Error inesperado: ${error.message}`],
                isEmpty: false,
            };
        }
    }
}