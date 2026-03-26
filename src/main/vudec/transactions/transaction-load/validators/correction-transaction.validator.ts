import { EditTransactionErrorRow, EditTransactionRowDto, EditTransactionSummary, EditTransactionValidationOutput, EditTransactionValidationResult, ValidatableField } from '../types/edit-transaction.type';
import { CONTRACT_NUMBER_FORMAT, TAXPAYER_NUMBER_REGEX, UUID_REGEX } from '../utils/data-format.utils';



export const fieldLabels: Record<ValidatableField, string> = {
    transactionId: 'Transaction ID',
    currentContractNumber: 'Numero de contrato actual',
    currentTaxpayerNumber: 'Tercero actual',
    errorType: 'Tipo de error',
    errorDescription: 'Descripción del error',
    newContractNumber: 'Nuevo numero de contrato',
    newTaxpayerNumber: 'Nuevo tercero',
};

export function normalize(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

export function isValidUuid(value: string): boolean {
    return UUID_REGEX.test(normalize(value));
}

export function isValidContractNumber(value: string): boolean {
    return CONTRACT_NUMBER_FORMAT.test(normalize(value).toUpperCase());
}

export function isValidTaxpayerNumber(value: string): boolean {
    const normalized = normalize(value);
    if (!normalized) return true;
    return TAXPAYER_NUMBER_REGEX.test(normalized);
}

export function isRowEmpty(row: EditTransactionRowDto): boolean {
    return (
        normalize(row.transactionId) === '' &&
        normalize(row.currentContractNumber) === '' &&
        normalize(row.currentTaxpayerNumber) === '' &&
        normalize(row.errorType) === '' &&
        normalize(row.errorDescription) === '' &&
        normalize(row.newContractNumber) === '' &&
        normalize(row.newTaxpayerNumber) === ''
    );
}

export const fieldValidations: Partial<
    Record<ValidatableField, (row: EditTransactionRowDto) => string | null>> = {
    transactionId: (row) => {
        const value = normalize(row.transactionId);
        if (!value) return 'es obligatorio';
        return isValidUuid(value) ? null : 'formato inválido, se esperaba un UUID';
    },

    newContractNumber: (row) => {
        const value = normalize(row.newContractNumber);
        if (!value) return 'es obligatorio';
        return isValidContractNumber(value) ? null : 'formato inválido';
    },

    newTaxpayerNumber: (row) => {
        const value = normalize(row.newTaxpayerNumber);
        if (!value) return null;
        return isValidTaxpayerNumber(value) ? null : 'formato inválido';
    },
};

export function validateRow(row: EditTransactionRowDto): EditTransactionValidationResult {
    if (isRowEmpty(row)) {
        return {
            row,
            isEmpty: true,
            isValid: false,
            errors: ['Fila vacía'],
        };
    }

    const errors: string[] = [];

    for (const [field, validator] of Object.entries(fieldValidations) as Array<[ValidatableField, (row: EditTransactionRowDto) => string | null]>) {
        const error = validator(row);
        if (error) {
            errors.push(`${fieldLabels[field]}: ${error}`);
        }
    }

    return {
        row,
        isEmpty: false,
        isValid: errors.length === 0,
        errors,
    };
}

export function validateRows(rows: EditTransactionRowDto[]): EditTransactionValidationResult[] {
    const transactionIdCount = new Map<string, number>();

    for (const row of rows) {
        const key = normalize(row.transactionId).toUpperCase();
        if (!key) continue;
        transactionIdCount.set(key, (transactionIdCount.get(key) ?? 0) + 1);
    }

    return rows.map((row) => {
        const validation = validateRow(row);
        const normalizedTransactionId = normalize(row.transactionId).toUpperCase();

        if (normalizedTransactionId && (transactionIdCount.get(normalizedTransactionId) ?? 0) > 1) {
            validation.errors.push(`${fieldLabels.transactionId}: duplicado en el archivo`);
            validation.isValid = false;
        }
        return validation;
    });
}

export function buildValidationOutput(validationResults: EditTransactionValidationResult[],): EditTransactionValidationOutput {
    const validRows: EditTransactionRowDto[] = [];
    const invalidRows: EditTransactionErrorRow[] = [];

    let totalEmptyRows = 0;
    let totalDuplicateTransactionIds = 0;

    for (const result of validationResults) {
        const hasDuplicateError = result.errors.some((error) =>
            error.toLowerCase().includes('duplicado en el archivo'),
        );

        if (result.isEmpty) totalEmptyRows++;

        if (hasDuplicateError) totalDuplicateTransactionIds++;

        if (result.isValid) {
            validRows.push(result.row);
            continue;
        }

        invalidRows.push({
            rowNumber: result.row.rowNumber,
            row: result.row,
            errors: result.errors,
        });
    }

    const summary: EditTransactionSummary = {
        totalRows: validationResults.length,
        totalValidRows: validRows.length,
        totalInvalidRows: invalidRows.length,
        totalEmptyRows,
        totalDuplicateTransactionIds,
    };

    return {
        validRows,
        invalidRows,
        summary,
    };
}