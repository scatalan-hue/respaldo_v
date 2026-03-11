import { bufferToArrayBuffer } from 'src/common/functions/excel/excel-buffer-conversion';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';


//Guarda un workbook como archivo en el sistema
export async function loadWorkbookFromPath(templatePath: string): Promise<ExcelJS.Workbook> {
    if (!fs.existsSync(templatePath)) throw new Error(`No se encontró la plantilla en ${templatePath}`);
    const templateBuffer = fs.readFileSync(templatePath);
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = bufferToArrayBuffer(templateBuffer);
    await workbook.xlsx.load(arrayBuffer);
    return workbook;
}

export async function loadWorkbookFromBuffer(buffer: Buffer): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = bufferToArrayBuffer(buffer);
    await workbook.xlsx.load(arrayBuffer);
    return workbook;
}

