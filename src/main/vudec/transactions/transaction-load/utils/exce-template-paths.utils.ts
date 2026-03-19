import * as path from 'path';

//Si el ambiente es productivo buscara el archivo excel en el (dist) y si el ambiente es de desarrollo (src)
const state = process.env.STATE

//Si state no es (dev) y tampoco es (prod), entonces el programa se detiene y se lanza un error
if (state !== 'dev' && state !== 'prod') throw new Error('ERROR de configuracion: la variable de entorno STATE debe ser "dev" o "prod" ')
const environment = state === 'prod' ? 'prod' : 'dev'
const isProd = environment === 'prod'

// Ruta de la plantilla (para escribir los datos que el ususario diligencio mal)
export const TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH = path.resolve(process.cwd(), isProd
    ? 'dist/common/docs/excel/plantilla.xlsx' : 'src/common/docs/excel/plantilla.xlsx');

// Ruta de la plantill(para escribir los registros que tienen errores en la tabla transaction)
export const TRANSACTION_LOAD_TRANSACTION_ERROR_TEMPLATE_PATH = path.resolve(process.cwd(), isProd
    ? 'dist/common/docs/excel/listado_de_registros_vudec.xlsx' : 'src/common/docs/excel/listado_de_registros_vudec.xlsx');

// Ruta de la plantilla (plantilla_errores_al_actualizar)
export const TEMPLATE_ERRORS_WHEN_UPDATING = path.resolve(process.cwd(), isProd
    ? 'dist/common/docs/excel/plantilla_errores_al_actualizar.xlsx' : 'src/common/docs/excel/plantilla_errores_al_actualizar.xlsx');
