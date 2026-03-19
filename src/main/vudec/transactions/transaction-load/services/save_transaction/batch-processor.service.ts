import { BatchResult, ErrorsGlobal, ProcessRowResult, ValidRows } from '../../types/excel-row.type';
import { isRowEmpty, validateRow } from '../../validators/save-transaction.validator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class BatchProcessorService {
    private readonly logger = new Logger(BatchProcessorService.name);
    private readonly BATCH_SIZE = 10;

    constructor(private readonly eventEmitter: EventEmitter2) { }

    //   Procesa filas del Excel en batches de 10 y retorna filas válidas y errores encontrados
    async processBatches(context: IContext, inputWorksheet: ExcelJS.Worksheet, rowMapper: any, dataStartRow: number): Promise<BatchResult> {
        const errorsGlobal: ErrorsGlobal[] = [];
        const validRows: ValidRows[] = [];
        const lastRow = inputWorksheet.lastRow?.number ?? 0;

        for (let rowNumber = dataStartRow; rowNumber <= lastRow; rowNumber += this.BATCH_SIZE) {
            const batchEndRow = Math.min(rowNumber + this.BATCH_SIZE - 1, lastRow);
            const batchPromises = [];

            for (let currentRow = rowNumber; currentRow <= batchEndRow; currentRow++) {
                batchPromises.push(this.processRow(context, inputWorksheet, currentRow, rowMapper));
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
                    validRows.push({
                        rowNumber: result.rowNumber,
                        dto: result.dto,
                    });
                }
            }
        }

        return {
            validRows,
            errorsGlobal,
        };
    }
    //   Procesa una fila individual  mapea, valida y (opcionalmente) escribe en la plantilla
    private async processRow(context: IContext, inputWorksheet: ExcelJS.Worksheet, rowNumber: number, rowMapper: any): Promise<ProcessRowResult> {
        try {
            // Mapear fila a DTO
            const dto = rowMapper.mapRow(inputWorksheet, rowNumber);
            const isEmpty = isRowEmpty(dto);

            if (isEmpty) {
                return { rowNumber, dto, errors: [], isEmpty: true };
            }
            const rowErrors = await validateRow(context, dto, this.eventEmitter);
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