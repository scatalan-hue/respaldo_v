export type EditTransactionRowDto = {
    rowNumber: number;
    transactionId: string;
    currentContractNumber: string;
    currentTaxpayerNumber: string;
    errorType: string;
    errorDescription: string;
    newContractNumber: string;
    newTaxpayerNumber?: string;
};

export type EditTransactionValidationResult = {
    row: EditTransactionRowDto;
    isEmpty: boolean;
    isValid: boolean;
    errors: string[];
};

export type EditTransactionErrorRow = {
    rowNumber: number;
    row: EditTransactionRowDto;
    errors: string[];
};

export type EditTransactionSummary = {
    totalRows: number;
    totalValidRows: number;
    totalInvalidRows: number;
    totalEmptyRows: number;
    totalDuplicateTransactionIds: number;
};

export type EditTransactionValidationOutput = {
    validRows: EditTransactionRowDto[];
    invalidRows: EditTransactionErrorRow[];
    summary: EditTransactionSummary;
};

export type EditTransactionProcessingResult<TTransaction = any> = {
    transactionsToUpdate: TTransaction[];
    processingErrors: EditTransactionErrorRow[];
};
export type ValidatableField = Exclude<keyof EditTransactionRowDto, 'rowNumber'>;
