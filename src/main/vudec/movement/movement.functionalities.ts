import { FunctionalityModel, FunctionalityTag } from '../../../security/functionalities/functionality/types/functionality.type';

const key = 'movement';

const name = 'Movimientos';

export const MovementFunctionalityKeys = {
  name,
  key,
  description: 'Movimientos',
  tags: [FunctionalityTag.RESOLVER, FunctionalityTag.PARENT],
  FIND: {
    name: 'Ver detalles',
    title: 'Ver detalles',
    key: `${key}.find`,
    description: `Ver detalles de ${name}/s`,
    tags: [FunctionalityTag.METHOD, FunctionalityTag.STANDARD],
  } as FunctionalityModel,
};

export const MovementsFunctionalityKeys: FunctionalityModel[] = [
  {
    name: 'Movimientos del contrato',
    title: 'Movimientos del contrato',
    key: 'movements',
    description: 'Movimientos del contrato',
    tags: [FunctionalityTag.MODULE, FunctionalityTag.PARENT],
    children: [MovementFunctionalityKeys.FIND],
  },
];
