import { Row } from "exceljs";

export type ExcelRowData = {
    row: Row;
    rowNumber: number;
};

export type ErrorRowDto = {
    item: string,
    contractNumber: string,
    taxpayerNumber: string;
    validation: string;
    message: string;
}