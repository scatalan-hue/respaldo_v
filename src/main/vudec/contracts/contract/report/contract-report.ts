import { defaultCellConfig, defaultColConfig, Filter } from '../../../../../common/report/dynamic-filter';

const reportOptDeft = {
  colConfig: defaultColConfig(),
  cellConfig: defaultCellConfig(),
};

export const contract_fields = [
  {
    filterName: 'contractConsecutive',
    reportOpt: {
      columnName: 'No. del contrato',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'taxpayerNumber',
    reportOpt: {
      columnName: 'Identificación',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'taxpayerName',
    reportOpt: {
      columnName: 'Nombre/Razón Social',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'movementsCount',
    reportOpt: {
      columnName: 'Movimientos',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'contractValue',
    reportOpt: {
      columnName: 'Valor del contrato',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'liquidatedTotal',
    reportOpt: {
      columnName: 'Valor Liquidado',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'status',
    reportOpt: {
      columnName: 'Estado',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
] as Filter[];
