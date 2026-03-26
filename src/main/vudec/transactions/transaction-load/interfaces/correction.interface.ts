import { Transaction } from "../../transaction/entities/transaction.entity";
import { ExcelRowError } from "./transaction-load.interface";

export interface ProcessCorrectionRowsResult {
    transactionsToUpdate: Transaction[];
    taxpayersToUpdate: Map<string, string>;
    errors: ExcelRowError[];
}