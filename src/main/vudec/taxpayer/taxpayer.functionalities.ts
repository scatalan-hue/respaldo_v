import { FunctionalityModel, FunctionalityTag } from '../../../security/functionalities/functionality/types/functionality.type';
import { MovementFunctionalityKeys } from '../movement/movement.functionalities';

const name = 'Terceros';
const key = 'taxpayer';

export const TaxpayerFunctionalityKeys = {
  name,
  title: name,
  key,
  description: 'Terceros',
  tags: [FunctionalityTag.RESOLVER, FunctionalityTag.PARENT],
  DOWNLOAD: {
    name: 'Descargar listado',
    title: 'Descargar listado',
    key: `${key}.download`,
    description: `Descargar listado`,
    tags: [FunctionalityTag.METHOD, FunctionalityTag.CUSTOM],
  } as FunctionalityModel,
  FIND: {
    title: 'Ver detalles',
    name: 'Ver detalles',
    key: `${key}.find`,
    description: `Ver detalles de ${name}/s`,
    tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
  } as FunctionalityModel,
  UPDATE: {
    title: 'Editar terceros',
    name: 'Editar terceros',
    key: `${key}.update`,
    description: `Editar terceros`,
    tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
  } as FunctionalityModel,
};

export const TaxpayersFunctionalityKeys: FunctionalityModel[] = [
  {
    name: 'Gestión de terceros',
    title: 'Gestión de terceros',
    key: 'taxpayers',
    description: 'Gestión de terceros',
    url: '/private/taxpayers',
    tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
    children: [
      TaxpayerFunctionalityKeys.DOWNLOAD,
      TaxpayerFunctionalityKeys.FIND,
      TaxpayerFunctionalityKeys.UPDATE,
      {
        name: 'Contratos',
        title: 'Contratos',
        key: 'taxpayers.contracts',
        description: 'Gestión de contratos',
        url: '/private/taxpayers/:idTaxpayer',
        tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
        children: [
          {
            name: 'Información de liquidación y pago de estampillas',
            title: 'Información de liquidación y pago de estampillas',
            key: 'taxpayers.contracts.movements',
            description: 'Movimientos del contrato',
            url: '/private/taxpayers/:idTaxpayer/movements/:idContract',
            tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
            children: [MovementFunctionalityKeys.FIND],
          },
        ],
      },
    ],
  },
];
