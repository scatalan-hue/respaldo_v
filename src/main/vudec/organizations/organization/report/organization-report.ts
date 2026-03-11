import { defaultCellConfig, defaultColConfig, Filter } from '../../../../../common/report/dynamic-filter';

const reportOptDeft = {
  colConfig: defaultColConfig(),
  cellConfig: defaultCellConfig(),
};

export const organization_fields = [
  {
    filterName: 'department',
    reportOpt: {
      columnName: 'Departamento',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'nit',
    reportOpt: {
      columnName: 'Nit',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'city',
    reportOpt: {
      columnName: 'Ciudad',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'orderType',
    reportOpt: {
      columnName: 'Orden',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'organizationParent',
    reportOpt: {
      columnName: 'Entidad Superior',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
  {
    filterName: 'name',
    reportOpt: {
      columnName: 'Nombre',
      columnHidden: false,
      columnFmt: '',
      ...reportOptDeft,
    },
  },
] as Filter[];
