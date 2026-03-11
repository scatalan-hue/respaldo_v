import { ContractsFunctionalityKeys } from './main/vudec/contracts/contract/contract.functionalities';
import { DailyLotFunctionalityKeys } from './main/vudec/lots/lot.functionalities';
import { TaxpayersFunctionalityKeys } from './main/vudec/taxpayer/taxpayer.functionalities';
import { FunctionalityModel } from './security/functionalities/functionality/types/functionality.type';

export const FunctionalityKeys: FunctionalityModel = {
  name: 'APP',
  key: 'app',
  description: 'app',
  url: '/',
  children: [
    {
      name: 'Principal',
      title: 'Principal',
      key: 'home',
      description: 'home',
      url: '/private/home',
      children: [...DailyLotFunctionalityKeys, ...ContractsFunctionalityKeys, ...TaxpayersFunctionalityKeys],
    },
  ],
};
