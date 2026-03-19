import { TransactionRowDto } from "../validators/save-transaction.validator";
import { Row } from "exceljs";


export type ValidRows = {
    rowNumber: number;
    dto: TransactionRowDto;
}

export type ExcelRowData = {
    row: Row;
    rowNumber: number;
};

export type ErrorsGlobal = {
    rowNumber: number;
    originalData: TransactionRowDto;
    message: string
}

export type BatchResult = {
    validRows: ValidRows[];
    errorsGlobal: ErrorsGlobal[];
}

export type ProcessRowResult = {
    rowNumber: number;
    dto: TransactionRowDto;
    errors: string[]; isEmpty: boolean;
}

