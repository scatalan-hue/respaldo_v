import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { findStampEvent } from "src/main/vudec/stamp/constants/stamp.constants";
import { TypeDoc } from "src/main/vudec/taxpayer/enums/taxpayer-type.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";

export type TransactionRowDto = {
    reversion: string;
    contractNumber: string;
    contractValue: string;
    contractDate: string;
    ContractStartDate: string;
    ContractEndDate: string;
    movementDate: string;
    movementValue: string;
    stampNumber: string;
    firstName: string;
    secondName: string;
    firstLastName: string;
    secondLastName: string;
    docNumber: string;
    docType: string;
    email: string;
    phone: string;
};


// VALORES PERMITIDOS SOLO ESTOS 
const ALLOWED_DOC_TYPES = Object.values(TypeDoc);
type AllowedDocType = typeof ALLOWED_DOC_TYPES[number];

export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Required
export const contractNumberFormat = /^CO1\.[A-Z0-9]+\.\d+$/;
const emailFormat = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
const dateFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

export const fieldLabels: Record<keyof TransactionRowDto, string> = {
    reversion: 'Reversión',
    firstName: 'Primer Nombre',
    email: 'Correo Electrónico',
    docType: 'Tipo de Documento',
    contractValue: 'Contrato Valor',
    movementDate: 'Fecha Movimiento',
    contractNumber: 'Contrato Número',
    contractDate: 'Fecha de Contrato',
    ContractStartDate: 'Fecha Inicial',
    stampNumber: 'Número de Estampilla',
    secondLastName: 'Segundo Apellido',
    movementValue: 'Movimiento Valor',
    docNumber: 'Número de Documento',
    firstLastName: 'Primer Apellido',
    ContractEndDate: 'Fecha Final',
    secondName: 'Segundo Nombre',
    phone: 'Teléfono',
};

export function Normalize(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

export function validateDateFormat(value: string): boolean {
    if (!value) return false;
    if (!dateFormat.test(value)) return false;
    const [day, month, year] = value.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900) return false;
    return true;
}

export function maximumNumericLength(value: string, max: number): boolean {
    if (!value) return false;
    const normalized = value.replace(/[,\s]/g, '');
    return /^\d+$/.test(normalized) && normalized.length <= max;
}

export function isRowEmpty(dto: TransactionRowDto): boolean {
    return Object.values(dto).every(v => !v || String(v || "").trim() === '');
}

export function parseDocType(v: string): AllowedDocType | null {
    if (!v) return null;

    const normalized = v.trim().toUpperCase();

    // Solo acepta valores exactos
    return ALLOWED_DOC_TYPES.includes(normalized as AllowedDocType)
        ? (normalized as AllowedDocType)
        : null;
}

export async function validateRow(context: IContext, dto: TransactionRowDto, eventEmitter: EventEmitter2): Promise<string[]> {
    const errors: string[] = [];

    // Validaciones sincronas
    for (const [field, validator] of Object.entries(fieldValidations)) {
        const value = dto[field as keyof TransactionRowDto];
        const error = validator(value);
        if (error) {
            const label = fieldLabels[field as keyof TransactionRowDto];
            errors.push(`${label}: ${error}`);
        }
    }

    // Validaciones asincronas
    for (const [field, validatorAsync] of Object.entries(asyncFieldValidations)) {
        const value = dto[field as keyof TransactionRowDto];
        const error = await validatorAsync(context, value, eventEmitter);
        if (error) {
            const label = fieldLabels[field as keyof TransactionRowDto];
            errors.push(`${label}: ${error}`);
        }
    }

    return errors;
}

export const fieldValidations: Record<keyof TransactionRowDto, (v: string) => string | null> = {
    reversion: (v) => {
        if (!v) return 'es obligatorio';
        const up = v.toUpperCase();
        return up === 'SI' || up === 'NO' ? null : 'debe ser SI o NO';
    },
    contractNumber: (v) => {
        if (!v) return 'es obligatorio';
        return contractNumberFormat.test(v.toUpperCase()) ? null : 'formato inválido (ej: CO1.ABC123.456)';
    },
    contractValue: (v) => {
        if (!v) return 'es obligatorio';
        return maximumNumericLength(v, 14) ? null : 'debe ser numérico y hasta 14 dígitos';
    },
    contractDate: (v) => {
        if (!v) return 'es obligatoria';
        return validateDateFormat(v) ? null : 'formato Día/Mes/Año';
    },
    ContractStartDate: (v) => {
        if (!v) return 'es obligatoria';
        return validateDateFormat(v) ? null : 'formato Día/Mes/Año';
    },
    ContractEndDate: (v) => {
        if (!v) return 'es obligatoria';
        return validateDateFormat(v) ? null : 'formato Día/Mes/Año';
    },
    movementDate: (v) => {
        if (!v) return 'es obligatoria';
        return validateDateFormat(v) ? null : 'formato Día/Mes/Año';
    },
    movementValue: (v) => {
        if (!v) return 'es obligatorio';
        return maximumNumericLength(v, 14) ? null : 'debe ser numérico y hasta 14 dígitos';
    },
    stampNumber: (v) => {
        if (!v) return 'es obligatoria';
        return v.length <= 16 ? null : 'máximo 16 caracteres';
    },
    firstName: (v) => {
        if (!v) return 'es obligatorio';
        return v.length > 255 ? 'máximo 255 caracteres' : null
    },
    secondName: (v) => {
        if (!v) return null;
        return v.length > 255 ? 'máximo 255 caracteres' : null
    },
    firstLastName: (v) => {
        if (!v) return 'es obligatorio';
        return v.length > 255 ? 'máximo 255 caracteres' : null
    },
    secondLastName: (v) => {
        if (!v) return 'es obligatorio';
        return v.length > 255 ? 'máximo 255 caracteres' : null
    },
    docType: (v) => {
        if (!v) return 'es obligatorio';
        const parsed = parseDocType(v);
        if (!parsed) {
            return `valor inválido. Solo se aceptan: ${ALLOWED_DOC_TYPES.join(', ')}`;
        }
        return null;
    },

    docNumber: (v) => {
        if (!v) return 'es obligatorio';
        return v.length <= 10 ? null : 'Minimo 6 caracteres y máximo 10 caracteres';
    },
    email: (v) => {
        if (!v) return 'es obligatorio';
        return emailFormat.test(v) ? null : 'correo inválido';
    },
    phone: (v) => {
        if (!v) return 'es obligatorio';
        const digits = v.replace(/\D/g, '');
        if (digits.length < 7) {
            return 'mínimo 7 números';
        }
        if (digits.length > 14) {
            return 'máximo 14 números';
        }
        return null;
    },
};

export const asyncFieldValidations: Partial<Record<keyof TransactionRowDto, (context: IContext, v: string, eventEmitter: EventEmitter2) => Promise<string | null>>> = {
    stampNumber: async (context, v, eventEmitter) => {
        const [stamp] = await eventEmitter.emitAsync(findStampEvent, {
            context,
            stampNumber: v,
            orFail: false
        });
        if (!stamp) return 'No EXISTE la estampilla ' + v

        return null;
    }
};
