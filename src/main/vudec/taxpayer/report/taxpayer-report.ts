import { defaultCellConfig, defaultColConfig, Filter } from '../../../../common/report/dynamic-filter';

const reportOptDeft = {
  colConfig: defaultColConfig(),
  cellConfig: defaultCellConfig(),
};

export const taxpayer_fields = [
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
    filterName: 'name',
    reportOpt: {
      columnName: 'Nombre/Razón Social',
      columnHidden: false,
      columnWidth: 65,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'phone',
    reportOpt: {
      columnName: 'Teléfono',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'email',
    reportOpt: {
      columnName: 'Correo electrónico',
      columnHidden: false,
      columnFmt: '',
      columnWidth: 50,
      ...reportOptDeft,
    },
  },
  {
    filterName: 'contractCount',
    reportOpt: {
      columnName: 'No. de contratos',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'liquidatedTotal',
    reportOpt: {
      columnName: 'Total liquidadas',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'paidTotal',
    reportOpt: {
      columnName: 'Total pagadas',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'totalPayable',
    reportOpt: {
      columnName: 'Total por pagar',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
] as Filter[];
