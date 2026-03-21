import { number } from "joi";

export const BATCH_SIZE = 500;

export const EXCEL_CONFIG = {
    HEADER_ROWS: 2,
    START_ROW: 3,
    CONCURRENCY: 10,
} as const;

export const EXCEL_COLUMNS = {
    TRANSACTION_ID: 1,
    NEW_CONTRACT_NUMBER: 6,
    NEW_TAXPAYER_NUMBER: 7,
} as const;

export const COLUMNS_ERROR_TEMPLATE_EDIT_TRANSACTIONS = {
    state: 8,
    errorsUpdating: 9
} as const;

// Columnas se enumeran segun su posision en el excel
export const COL = {
    reversion: 1,
    contractNumber: 2,
    contractValue: 3,
    contractDate: 4,
    contractStartDate: 5,
    contractEndDate: 6,
    movementDate: 7,
    movementValue: 8,
    stampNumber: 9,
    firstName: 10,
    secondName: 11,
    firstLastName: 12,
    secondLastName: 13,
    docNumber: 14,
    docType: 15,
    email: 16,
    phone: 17,
    estado: 18,
    mensaje: 19,
} as const;

// Columnas se enumeran segun su posision en el excel
