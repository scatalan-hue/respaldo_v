import * as ExcelJS from 'exceljs';

type ExcelInput = Buffer | ArrayBuffer;

export async function loadInputWorksheet(input: ExcelInput, sheetIndex = 0): Promise<ExcelJS.Worksheet> {
    const workbook = new ExcelJS.Workbook();
    const data = input instanceof ArrayBuffer ? Buffer.from(input) : input;
    await workbook.xlsx.load(data as any);
    const worksheet = workbook.worksheets[sheetIndex];
    if (!worksheet) {
        throw new Error('El archivo no contiene hojas válidas');
    }
    return worksheet;
}