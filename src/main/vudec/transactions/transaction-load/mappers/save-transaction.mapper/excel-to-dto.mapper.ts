import { normalizeEmail, normalizeString, parseDateFromValidated, parseDocType, parseReversion } from "./save-transaction.mapper";
import { CreateContractInput } from "src/main/vudec/contracts/contract/dto/inputs/create-contract.input";
import { CreateTaxpayerInput } from "src/main/vudec/taxpayer/dto/inputs/create-taxpayer.input";
import { CreateMovementInput } from "src/main/vudec/movement/dto/inputs/create-movement.input";
import { MovementStatus } from "src/main/vudec/movement/enums/movement-status.enum";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { TypeMovement } from "src/main/vudec/movement/enums/movement-type.enum";
import { TransactionRowDto } from "../../validators/save-transaction.validator";
import { TypeDoc } from "src/main/vudec/taxpayer/enums/taxpayer-type.enum";

export function taxpayerDto(row: TransactionRowDto): CreateTaxpayerInput {
    //TODO: Mi objetivo es convertir cada fila del Excel en un objeto CreateTaxpayerInput.
    return {
        taxpayerNumber: row.docNumber,
        taxpayerNumberType: parseDocType(row.docType) as TypeDoc,
        name: normalizeString(row.firstName),
        middleName: row.secondName,
        lastName: normalizeString(row.firstLastName),
        secondSurname: normalizeString(row.secondLastName),
        email: normalizeEmail(row.email),
        phone: normalizeString(row.phone),
    };
}
export function contractDto(row: TransactionRowDto, taxpayerId: string, taxpayerInput: CreateTaxpayerInput, context: IContext): CreateContractInput {
    const consecutive = normalizeString(row.contractNumber);
    return {
        consecutive,
        contractName: consecutive,
        internalId: consecutive,
        description: consecutive,
        documentPrincipal: row.docNumber,
        contractValue: Number(row.contractValue),
        contractDate: parseDateFromValidated(row.contractDate),
        contractDateIni: parseDateFromValidated(row.ContractStartDate),
        contractDateEnd: parseDateFromValidated(row.ContractEndDate),
        taxpayerId,
        taxpayerInput,
        decentralizedInput: taxpayerInput,
        movementsInput: [],
        isRevert: parseReversion(row.reversion),
        organizationProductId: context.organizationProduct?.id,
    };
}
export function adhesionMovementDto(row: TransactionRowDto, contractId: string, lotId: string, taxpayerId: string, context: IContext): CreateMovementInput {
    // Mi objetivo es convertir la fila del Excel en un movimiento de tipo adhesion.
    // El movementValue del Excel se usa como liquidatedValue, valor que se adhiere o aplica a la estampilla.
    const movementValue = Number(row.movementValue);
    const contractNumber = normalizeString(row.contractNumber);
    return {
        type: TypeMovement.Adhesion,
        contractId,
        taxpayerId,
        lotId,
        expenditureNumber: contractNumber,
        movId: contractNumber + `.${TypeMovement.Adhesion}`,
        date: parseDateFromValidated(row.movementDate) || new Date(),
        value: movementValue,
        paidValue: 0,
        description: 'EXAMPLE DEV_STIVEN',
        message: 'example adhesion',
        organizationProductId: context.organizationProduct?.id,
        typeValue: 'Porcentaje',
        documentValue: 0,
        isRevert: false,
        percentageValue: 0,//FIXME: ni idea de a que hay que sacarle el porcentaje.
        fixedValue: 0,
        liquidatedValue: movementValue,//FIXME: preguntar que valor va en este campo solo existe en el movimentio de adhesion y tambien es el mismo valor del campo (value).
        stampInput: { stampNumber: normalizeString(row.stampNumber) },
        status: MovementStatus.Unsent,
        taxBasisValue: 0,//FIXME:  buscar que valor debe ir aquí.
        //TODO:Falta movementRevertId creo que es cuando hay una reversion se le asigna un id pero debo preguntar.
        group: TypeMovement.Register
    };
}
export function applyMovementDto(row: TransactionRowDto, contractId: string, lotId: string, taxpayerId: string, context: IContext): CreateMovementInput {
    // Mi objetivo es convertir la fila del Excel en un movimiento de tipo APPLY.
    // El movementValue del Excel se usa como paidValue valor que se paga.
    const movementValue = Number(row.movementValue);
    return {
        type: TypeMovement.Apply,
        contractId,
        lotId,
        taxpayerId,
        organizationProductId: context.organizationProduct?.id,
        expenditureNumber: normalizeString(row.contractNumber),
        movId: (normalizeString(row.contractNumber)) + `.${TypeMovement.Apply}`,
        date: parseDateFromValidated(row.movementDate) || new Date(),
        value: movementValue,
        paidValue: movementValue,
        liquidatedValue: 0,
        isRevert: false,
        description: 'EXAMPLE DEV_STIVEN',
        message: 'example apply',
        typeValue: 'Porcentaje',
        documentValue: 0,
        percentageValue: 0,//FIXME: ni idea de a que hay que sacarle el porcentaje.
        fixedValue: 0,
        taxBasisValue: 0,//FIXME:  buscar que valor debe ir aquí.
        group: TypeMovement.Register,//FIXME preguntar a que tipo va dependiendo del tipo de contrato.
        stampInput: { stampNumber: normalizeString(row.stampNumber) },
        associatedMovement: normalizeString(row.contractNumber),
        status: MovementStatus.Unsent,
        //TODO:Falta movementRevertId creo que es cuando hay una reversion se le asigna un id pero debo preguntar.
    };
}