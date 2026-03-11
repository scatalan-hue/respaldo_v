import { defaultCellConfig, defaultColConfig, Filter } from '../../../../common/report/dynamic-filter';

const reportOptDeft = {
  colConfig: defaultColConfig(),
  cellConfig: defaultCellConfig(),
};

export const movement_fields = [
  {
    filterName: 'expenditureNumber',
    reportOpt: {
      columnName: 'Nro. de documento',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'stampName',
    reportOpt: {
      columnName: 'Nombre de la estampilla',
      columnHidden: false,
      columnWidth: 75,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'type',
    reportOpt: {
      columnName: 'Tipo',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'movementDate',
    reportOpt: {
      columnName: 'Fecha',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'liquidatedValue',
    reportOpt: {
      columnName: 'Liquidado',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'paidValue',
    reportOpt: {
      columnName: 'Pagado',
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
