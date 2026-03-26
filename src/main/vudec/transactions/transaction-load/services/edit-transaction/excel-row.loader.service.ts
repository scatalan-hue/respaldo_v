import { COLUMNS_INPUT_TEMPLATE_EDIT_TRANSACTIONS, EXCEL_CONFIG } from '../../constants/edit-transaction.constants';
import { EditTransactionRowMapper } from '../../mappers/edit-transaction/edit-transaction.mapper';
import { loadWorkbookFromBuffer } from 'src/common/functions/excel/load-workbook-from-path';
import { Transaction } from '../../../transaction/entities/transaction.entity';
import { EditTransactionRowDto } from '../../types/edit-transaction.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

@Injectable()
export class ExcelRowLoader {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) { }

    async loadExcelRows(buffer: Buffer): Promise<EditTransactionRowDto[]> {
        const workbook = await loadWorkbookFromBuffer(buffer);
        const worksheet = workbook.worksheets[0];
        const rows: EditTransactionRowDto[] = [];
        const mapper = new EditTransactionRowMapper(COLUMNS_INPUT_TEMPLATE_EDIT_TRANSACTIONS);

        worksheet.eachRow({ includeEmpty: false }, (_, rowNumber) => {
            if (rowNumber >= EXCEL_CONFIG.START_ROW) {
                rows.push(mapper.mapRow(worksheet, rowNumber));
            }
        });

        return rows;
    }

    async preloadTransactions(rows: EditTransactionRowDto[]): Promise<{ transactionMap: Map<string, Transaction> }> {

        const transactionIds = rows.map(row => row.transactionId).filter(id => !!id);

        const uniqueIds = [...new Set(transactionIds)];
        const transactions = await this.transactionRepository.find({
            where: { id: In(uniqueIds) },
        });

        return {
            transactionMap: new Map(transactions.map(transaction => [transaction.id, transaction])),
        };
    }
}