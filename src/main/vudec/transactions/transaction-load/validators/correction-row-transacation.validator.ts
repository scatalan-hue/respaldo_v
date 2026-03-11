import { Transaction } from 'src/main/vudec/transactions/transaction/entities/transaction.entity';
import { contractNumberFormat, uuidRegex } from './save-transaction.validator';
import { RowValidationError } from '../interfaces/transaction-load.interface';

export class CorrectionRowValidator {


    ValidateExistingData(transactionId: string, newContractNumber: string, rowNumber: number): RowValidationError | null {
        if (!transactionId || !newContractNumber) {
            return { row: rowNumber, message: 'Datos incompletos' };
        }
        return null;
    }

    validateTransactionIdStructure(transactionId: string, rowNumber: number): RowValidationError | null {
        if (!uuidRegex.test(transactionId)) {
            return { row: rowNumber, message: `transactionId inválido: ${transactionId}` };
        }
        return null;
    }

    validateTransactionExists(transaction: Transaction | undefined, transactionId: string, rowNumber: number): RowValidationError | null {
        if (!transaction) {
            return { row: rowNumber, message: `Transacción no encontrada: ${transactionId}` };
        }
        return null;
    }

    validateContractNumber(contractNumber: string, rowNumber: number): RowValidationError | null {
        if (!contractNumberFormat.test(contractNumber.toUpperCase())) {
            return { row: rowNumber, message: `Contrato inválido: ${contractNumber}` };
        }
        return null;
    }


    validateTaxpayerAssociation(transaction: Transaction, rowNumber: number): RowValidationError | null {
        if (!transaction.taxpayerId) {
            return { row: rowNumber, message: 'Transacción sin contribuyente asociado' };
        }
        return null;
    }

    validateTaxpayerNumber(taxpayerNumber: string, rowNumber: number): RowValidationError | null {
        // if (taxpayerNumber && taxpayerNumber.length <= 10) {
        //     return null
        // } else {
        //     return { row: rowNumber, message: `Minimo 6 caracteres y máximo 10 caracteres` };
        // }
        return null; //FIXME 
    }
}