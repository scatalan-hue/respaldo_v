export type transactionUpdateDto = {
    transactionId: string,
    contractNumber: string
    taxpayerNumber: string
    errorType?: string
    errorDescription?: string
    newContractNumber: string
    newTaxpayerNumber?: string
}

export const contractNumberFormat = /^CO1\.[A-Z0-9]+\.\d+$/;



// export const fieldValidations: Record<keyof transactionUpdateDto, (v: string) => string | null> = {

//     transactionId: (v) => {
//         if (!v) return 'es obligatorio';
//         if (v.length < 6 || v.length > 10) return 'mínimo 6 caracteres y máximo 10 caracteres';
//         return null;
//     },
//     contractNumber: (v) => {
//         if (!v) return 'es obligatorio';
//         return contractNumberFormat.test(v.toUpperCase()) ? null : 'formato inválido (ej: CO1.ABC123.456)';
//     },
//     taxpayerNumber: (v) => {
//         if (!v) return 'es obligatorio';
//         return contractNumberFormat.test(v.toUpperCase()) ? null : 'formato inválido (ej: CO1.ABC123.456)';
//     },
//     newContractNumber: (v) => {
//         if (!v) return null;
//         return v.length > 255 ? 'máximo 255 caracteres' : null
//     },
//     newTaxpayerNumber: (v) => {
//         if (!v) return 'es obligatorio';
//         return contractNumberFormat.test(v.toUpperCase()) ? null : 'formato inválido (ej: CO1.ABC123.456)';
//     },
// };

