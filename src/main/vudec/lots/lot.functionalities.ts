import { FunctionalityModel, FunctionalityTag } from '../../../security/functionalities/functionality/types/functionality.type';
import { ContractFunctionalityKeys } from '../contracts/contract/contract.functionalities';
import { MovementFunctionalityKeys } from '../movement/movement.functionalities';

const name = 'Lotes';
const key = 'lot';
export const LotFunctionalityKeys = {
  name,
  title: name,
  key: 'lot',
  description: 'Lotes',
  tags: [FunctionalityTag.RESOLVER, FunctionalityTag.PARENT],
  CREATE: {
    name: 'Crear informe',
    title: 'Crear informe',
    key: `${key}.create`,
    description: `Crear informe`,
    tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
  } as FunctionalityModel,
  FIND: {
    name: 'Ver detalles',
    title: 'Ver detalles',
    key: `${key}.find`,
    description: `Ver detalles de ${name}/s`,
    tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
  } as FunctionalityModel,
};

export const DailyLotFunctionalityKeys: FunctionalityModel[] = [
  {
    name: 'Lotes diarios de contrato',
    key: 'lots',
    title: 'Lotes diarios de contrato',
    description: 'Modulo lotes diarios de contratos',
    url: '/private/batches',
    tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
    children: [
      LotFunctionalityKeys.CREATE,
      LotFunctionalityKeys.FIND,
      {
        name: 'Gestión de contratos',
        title: 'Gestión de contratos',
        key: 'lots.contracts',
        description: 'Gestión de contratos',
        url: '/private/batches/:lotId',
        tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
        children: [
          {
            name: 'Información de liquidación y pago de estampillas',
            title: 'Información de liquidación y pago de estampillas',
            key: 'lots.contracts.movements',
            description: 'Movimientos del contrato',
            url: '/private/batches/:lotId/movements/:idContract',
            tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
            children: [MovementFunctionalityKeys.FIND],
          },
          ContractFunctionalityKeys.FIND,
        ],
      },
    ],
  },
];
