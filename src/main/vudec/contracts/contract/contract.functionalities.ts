import { FunctionalityModel, FunctionalityTag } from "src/security/functionalities/functionality/types/functionality.type";
import { MovementFunctionalityKeys } from "../../movement/movement.functionalities";

const key = 'contract';

const name = 'Contratos';

export const ContractFunctionalityKeys = {
  name,
  title: name,
  key,
  description: 'Contratos',
  tags: [FunctionalityTag.RESOLVER, FunctionalityTag.PARENT],
  FIND: {
    name: 'Ver detalles',
    title: 'Ver detalles',
    key: `${key}.find`,
    description: `Ver detalles de ${name}/s`,
    tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
  } as FunctionalityModel,
};

export const ContractsFunctionalityKeys: FunctionalityModel[] = [
  {
    name: 'Contratos',
    title: 'Contratos',
    key: 'contracts',
    description: 'Gestión de contratos',
    url: '/private/contracts',
    tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
    children: [
      ContractFunctionalityKeys.FIND,
      {
        name: 'Información de liquidación y pago de estampillas',
        title: 'Información de liquidación y pago de estampillas',
        key: 'contracts.movements',
        description: 'Movimientos del contrato',
        url: '/private/contracts/movements/:idContract',
        tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
        children: [MovementFunctionalityKeys.FIND],
      },
    ],
  },
];
