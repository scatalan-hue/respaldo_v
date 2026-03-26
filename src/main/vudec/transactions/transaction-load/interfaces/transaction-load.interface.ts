import { Transaction } from "../../transaction/entities/transaction.entity";

export interface ProcessResult {
    success: boolean;
    error?: { row: number; message: string };
    transaction?: any;
}

export interface CorrectionProcessResult {
    updated: number;
    errors: Array<{ row: number; message: string }>;
    errorFileId?: string | null;
}

export interface ExcelRowError {
    row: number;
    message: string;
    originalData?: any;
}

export interface RowValidationError {
    row: number;
    message: string;
}
export interface ErrorRows {
    originalData: any,
    message?: string
}
