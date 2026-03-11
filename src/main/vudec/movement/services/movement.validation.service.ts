import { Not } from 'typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { Movement } from 'src/main/vudec/movement/entity/movement.entity';
import { compareContractMovementsEvent, validateExistingMovementsEvent, validateMovementsEvent } from 'src/main/vudec/movement/constants/events.constants';
import { RequestCreateMovement } from 'src/main/vudec/movement/dto/models/request-create-movement.model';
import { ValidationResponse } from '../../transactions/transaction/enum/validation-response.enum';
import { TypeMovement } from '../enums/movement-type.enum';
import { findStampEvent } from '../../stamp/constants/stamp.constants';
import { ValidationResponseModel } from '../../transactions/transaction/dto/models/validation-response.model';
import { MovementService } from './movement.service';
import { MovementStatus } from '../enums/movement-status.enum';
import { CreateMovementInput } from '../dto/inputs/create-movement.input';

@Injectable()
export class MovementValidationService {
    private readonly I18N_SPACE = I18N_SPACE.Movement;

    constructor(
        @Inject(forwardRef(() => MovementService))
        private readonly movementService: MovementService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    private async validateMovementsEvent(context: IContext, movementsInput: RequestCreateMovement[]): Promise<ValidationResponseModel> {

        //Caso 1: Contrato sin movimientos
        if (!(movementsInput || [])?.find((movement) => (movement?.type === TypeMovement.Register || movement?.type === TypeMovement.Amendment || movement?.type === TypeMovement.Assignment))) {
            return { 
                status: ValidationResponse.CONTRACT_INCORRECT,
                message: 'El contrato no tiene movimiento de registro válido.'
            };
        }

        //Caso 2: Contrato con mas de un movimiento de registro
        if ((movementsInput || [])?.filter((movement) => movement?.type === TypeMovement.Register)?.length > 1) {
            return { 
                status: ValidationResponse.CONTRACT_INCORRECT,
                message: 'El contrato tiene mas de un movimiento de registro.'
            };
        }

        for (const movement of movementsInput) {

            //Caso 3: Validacion de estampillas
            if (movement.stampInput.stampNumber) {
                const [stamp] = await this.eventEmitter.emitAsync(findStampEvent, {
                    context,
                    stampNumber: movement.stampInput.stampNumber,
                    orFail: false
                });

                if (!stamp) {
                    return {
                        status: ValidationResponse.STAMP_NOT_EXIST,
                        message: 'La estampilla con número ' + movement.stampInput.stampNumber + ' no existe.'
                    };
                }
            }

            //Caso 4: Validacion si el movimiento es de reversion
            if (movement.isRevert) {
                const isValidRevert: boolean = await this.movementService.validateRevertMovement(context, movement);
                if (!isValidRevert) {
                    return {
                        status: ValidationResponse.MOVEMENT_NOT_EXIST,
                        message: 'El contrato no tiene movimientos válidos para revertir.'
                    };
                }
            }
        }

        return { status: ValidationResponse.IN_PROCESS };
    }

    private async compareContractMovements(context: IContext, contractId: string, newMovements: RequestCreateMovement[]): Promise<boolean> {
        const currentMovements = await this.movementService.find(context, {
            where: {
                contract: { id: contractId },
                deletedAt: null,
            },
            relations: ['stamp'],
        });

        if (currentMovements.length !== newMovements.length) return false;

        for (const currentMovement of currentMovements) {
            const stamp = await Promise.resolve(currentMovement.stamp);
            
            const matchingNewMovement = newMovements.find(newMov => 
                this.compareMovementFields(currentMovement, newMov, stamp?.stampNumber)
            );

            if (!matchingNewMovement) return false;
        }

        return true;
    }

    private compareMovementFields(currentMovement: Movement, newMovement: RequestCreateMovement, currentStampNumber?: string): boolean {

        if (currentMovement.description !== newMovement.description) {
            return false;
        }

        if (currentMovement.typeValue !== newMovement.typeValue) {
            return false;
        }

        if (currentMovement.expenditureNumber !== newMovement.expenditureNumber) {
            return false;
        }

        if (Number(currentMovement.liquidatedValue) !== Number(newMovement.liquidatedValue)) {
            return false;
        }

        if (Number(currentMovement.documentValue) !== Number(newMovement.documentValue)) {
            return false;
        }

        if (Number(currentMovement.percentageValue) !== Number(newMovement.percentageValue)) {
            return false;
        }

        if (Number(currentMovement.taxBasisValue) !== Number(newMovement.taxBasisValue)) {
            return false;
        }

        if (Number(currentMovement.fixedValue) !== Number(newMovement.fixedValue)) {
            return false;
        }

        if (Number(currentMovement.paidValue) !== Number(newMovement.paidValue)) {
            return false;
        }

        if (currentMovement.type !== newMovement.type) {
            return false;
        }

        const currentDate = currentMovement.date ? new Date(currentMovement.date).toISOString().split('T')[0] : null;
        const newDate = newMovement.date ? new Date(newMovement.date).toISOString().split('T')[0] : null;
        if (currentDate !== newDate) {
            return false;
        }

        if (currentMovement.value !== newMovement.value) {
            return false;
        }

        const newStampNumber = newMovement.stampInput?.stampNumber;
        if (currentStampNumber !== newStampNumber) {
            return false;
        }

        return true;
    }

    private async validateExistingMovements(context: IContext, contractId: string): Promise<void> {

        const existingMovements = await this.movementService.find(context, {
            where: {
                status: Not(MovementStatus.Send),
                contract: { id: contractId },
                isRevert: false
            },
        });

        if (existingMovements && existingMovements.length > 0) {

            const organizationProductId = (await existingMovements[0].organizationProduct)?.id;

            for (const existingMovement of existingMovements) {

                const stamp = await Promise.resolve(existingMovement.stamp);

                existingMovement.createdAt = undefined;
                existingMovement.updatedAt = undefined;

                const revertMovement: CreateMovementInput = {
                    ...existingMovement,
                    isRevert: true,
                    date: new Date(),
                    value: existingMovement.value,
                    status: MovementStatus.Unsent,
                    contractId: contractId,
                    organizationProductId: organizationProductId,
                    documentId: (await existingMovement.document)?.id,
                    description: `Reversión de ${existingMovement.description}`,
                    movementRevertId: (await existingMovement.movementRevert)?.id,
                    taxpayerId: (await existingMovement.taxpayer)?.id,
                    stampInput: { 
                        stampNumber: stamp?.stampNumber,
                        name: stamp?.name
                    }
                };
                revertMovement["id"] = undefined;

                await this.movementService.create(context, revertMovement);
            }
        }

    }

    @OnEvent(validateMovementsEvent, { suppressErrors: false })
    async onValidateMovementsEvent({ context, movementsInput }: { context: IContext; movementsInput: RequestCreateMovement[] }): Promise<ValidationResponseModel> {
        return await this.validateMovementsEvent(context, movementsInput);
    }

    @OnEvent(compareContractMovementsEvent, { suppressErrors: false })
    async onCompareContractMovementsEvent({ context, contractId, movementsInput }: { context: IContext; contractId: string; movementsInput: RequestCreateMovement[] }): Promise<boolean> {
        return await this.compareContractMovements(context, contractId, movementsInput);
    }

    @OnEvent(validateExistingMovementsEvent, { suppressErrors: false })
    async onValidateExistingMovementsEvent({ context, contractId }: { context: IContext; contractId: string }): Promise<void> {
        return await this.validateExistingMovements(context, contractId);
    }
}