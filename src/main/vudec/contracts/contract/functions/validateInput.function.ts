import { BadRequestException } from '@nestjs/common';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { sendResponse } from 'src/common/i18n/functions/response';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CreateContractInput } from '../dto/inputs/create-contract.input';
import { TypeMovement } from 'src/main/vudec/movement/enums/movement-type.enum';

export const validateInput = async (context: IContext, input: CreateContractInput): Promise<void> => {
  const { consecutive, contractType, taxpayerInput, movementsInput } = input;
  const { organizationProduct }: IContext = context;

  if (!organizationProduct) {
    throw new BadRequestException(sendResponse(context, I18N_SPACE.Contract, 'validateInput.organizationProduct'));
  }

  if (!taxpayerInput) {
    throw new BadRequestException(sendResponse(context, I18N_SPACE.Contract, 'validateInput.taxpayerInput'));
  }

  if (!contractType) {
    throw new BadRequestException(sendResponse(context, I18N_SPACE.Contract, 'validateInput.contractType'));
  }

  if (!consecutive) {
    throw new BadRequestException(sendResponse(context, I18N_SPACE.Contract, 'validateInput.consecutive'));
  }

  if (!(movementsInput || [])?.find((movement) => (movement?.type === TypeMovement.Register || movement?.type === TypeMovement.Amendment || movement?.type === TypeMovement.Assignment))) {
    throw new BadRequestException(sendResponse(context, I18N_SPACE.Contract, 'validateInput.registerNotExists'));
  }

  if ((movementsInput || [])?.filter((movement) => movement?.type === TypeMovement.Register)?.length > 1) {
    throw new BadRequestException(sendResponse(context, I18N_SPACE.Contract, 'validateInput.moreThanOneRegister'));
  }
};
