export const EXCEL_CONFIG = {
  HEADER_ROWS: 2,
  START_ROW: 3,
  CONCURRENCY: 10,
  BATCH_SIZE: 200,
} as const;

export const COLUMNS_INPUT_TEMPLATE_EDIT_TRANSACTIONS = {
  item: 1,
  contractNumber: 2,
  taxpayerNumber: 3,
  tipoDeError: 4,
  error: 5,
  newContractNumber: 6,
  newTaxpayerNumber: 7,
} as const;

export const COLUMNS_ERROR_TEMPLATE_EDIT_TRANSACTIONS = {
  state: 8,
  errorsUpdating: 9,
} as const;