import { loadWorkbookFromBuffer } from "src/common/functions/excel/load-workbook-from-path";
import { Normalize, uuidRegex } from "../../validators/save-transaction.validator";
import { Transaction } from "../../../transaction/entities/transaction.entity";
import { EXCEL_COLUMNS, EXCEL_CONFIG } from "../../constants/excel.constants";
import { ExcelRowError } from "../../interfaces/transaction-load.interface";
import { ExcelRowData } from "../../types/excel-row.type";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { In, Repository } from "typeorm";

@Injectable()
export class ExcelRowLoader {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>
    ) { }

    async loadExcelRows(buffer: Buffer): Promise<ExcelRowData[]> {// Carga todas las filas del Excel, ignorando vacías
        const workbook = await loadWorkbookFromBuffer(buffer);
        const worksheet = workbook.worksheets[0];
        const rows: ExcelRowData[] = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > EXCEL_CONFIG.HEADER_ROWS) {
                rows.push({ row, rowNumber })
            }
        })
        return rows;
    }

    async preloadTransactions(rows: ExcelRowData[]): Promise<{ transactionMap: Map<string, Transaction>, uuidErrors: ExcelRowError[] }> {
        const transactionsIds = rows
            .map(t => ({
                id: Normalize(t.row.getCell(EXCEL_COLUMNS.TRANSACTION_ID).value),
                rowNumber: t.rowNumber
            })).filter(t => !!t.id);

        const validIds: string[] = [];
        const uuidErrors: ExcelRowError[] = [];

        for (const t of transactionsIds) {
            if (uuidRegex.test(t.id)) {
                validIds.push(t.id);
            } else {
                uuidErrors.push({
                    row: t.rowNumber,
                    message: `transactionId inválido: ${t.id}`
                });
            }
        }

        const uniqueIds = [...new Set(validIds)];
        const transactions = await this.transactionRepository.find({
            where: { id: In(uniqueIds) }
        });

        return {
            transactionMap: new Map(transactions.map(t => [t.id, t])),
            uuidErrors
        };
    }
}