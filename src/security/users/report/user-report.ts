import { defaultCellConfig, defaultColConfig, Filter } from '../../../common/report/dynamic-filter';

const reportOptDeft = {
  colConfig: defaultColConfig(),
  cellConfig: defaultCellConfig(),
};

export const user_fields = [
  {
    filterName: 'identificationNumber',
    reportOpt: {
      columnName: 'Identificación',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'fullName',
    reportOpt: {
      columnName: 'Nombre',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'email',
    reportOpt: {
      columnName: 'Correo',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'phoneNumber',
    reportOpt: {
      columnName: 'Teléfono',
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
