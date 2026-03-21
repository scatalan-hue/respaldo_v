import * as ExcelJS from 'exceljs';

// Limpia y convierte a mayúsculas datos crudos de celdas Excel. Usado en mappers.
export function normalizeCellValue(cell: ExcelJS.Cell): string {
    const value = cell.value;
    if (value === null || value === undefined) return '';

    try {
        if (typeof value === 'string') return String(value);
        if (typeof value === 'number') return String(value);
        if (value instanceof Date) return String(cell.text || '');
        if (typeof value === 'object') {
            if ('text' in value && typeof value.text === 'string') {
                return String(value.text).toUpperCase();
            }
            if ('result' in value && value.result !== undefined && value.result !== null) {
                return String(value.result).toUpperCase();
            }
        }
    } catch {
        return '';
    }
    return '';
}

// Convierte a mayúsculas y trimea texto general. Retorna undefined si está vacío.
export function normalizeString(value?: string): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    try {
        const text = String(value).toUpperCase();
        return text === '' ? undefined : text;
    } catch {
        return undefined;
    }
}


// Parsea fechas formato DD/MM/YYYY. Valida lógica de fechas.
export function parseDateFromValidated(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;

    try {
        const [day, month, year] = String(dateStr).split('/').map(Number);
        if (!day || !month || !year) return undefined;

        const date = new Date(year, month - 1, day);

        if (
            isNaN(date.getTime()) ||
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return undefined;
        }

        return date;
    } catch {
        return undefined;
    }
}
