import { adhesionMovementDto, applyMovementDto, contractDto, taxpayerDto } from "../../mappers/save-transaction.mapper/excel-to-dto.mapper";
import { CreateContractInput } from "src/main/vudec/contracts/contract/dto/inputs/create-contract.input";
import { createContractEvent } from "src/main/vudec/contracts/contract/constants/events.constants";
import { createOrUpdateTaxpayerEvent } from "src/main/vudec/taxpayer/constants/events.constants";
import { CreateTaxpayerInput } from "src/main/vudec/taxpayer/dto/inputs/create-taxpayer.input";
import { CreateMovementInput } from "src/main/vudec/movement/dto/inputs/create-movement.input";
import { findOrCreateCustomLotEvent } from "src/main/vudec/lots/lot/constants/lot.constants";
import { createMovementEvent } from "src/main/vudec/movement/constants/events.constants";
import { createTransactionByContractEvent } from "src/main/vudec/transactions/transaction/constants/events.constants";
import { Transaction } from "src/main/vudec/transactions/transaction/entities/transaction.entity";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { TransactionRowDto } from "../../validators/save-transaction.validator";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Transactional } from "typeorm-transactional";
import { Injectable, } from "@nestjs/common";

@Injectable()
export class SaveExcelRowService {

    constructor(private readonly eventEmitter: EventEmitter2,) { }

    private async createTaxpayer(taxpayerInput: CreateTaxpayerInput, context: IContext) {
        const result = await this.eventEmitter.emitAsync(createOrUpdateTaxpayerEvent, { context, createInput: taxpayerInput });
        const taxpayer = Array.isArray(result) ? result[0] : result;

        if (!taxpayer?.id) throw new Error('No se pudo crear el tercero');

        return taxpayer;
    }

    private async createContract(createInput: CreateContractInput, context: IContext) {

        const result = await this.eventEmitter.emitAsync(createContractEvent, { context, createInput });
        const contract = Array.isArray(result) ? result[0] : result;

        if (!contract?.id) throw new Error('No se pudo crear el contrato');

        return contract;
    }

    private async createAdhesionMovement(movementInput: CreateMovementInput, context: IContext, contract: any, createContractInput: CreateContractInput) {
        const result = await this.eventEmitter.emitAsync(createMovementEvent, { movementInput, context, contract, createContractInput });
        const movement = Array.isArray(result) ? result[0] : result;

        if (!movement?.id) throw new Error('No se pudo crear el movimiento de adhesión');

        return movement;
    }

    private async createApplyMovement(movementInput: CreateMovementInput, context: IContext, contract: any, createContractInput: CreateContractInput) {
        const result = await this.eventEmitter.emitAsync(createMovementEvent, { movementInput, context, contract, createContractInput });
        const movement = Array.isArray(result) ? result[0] : result;

        if (!movement?.id) throw new Error('No se pudo crear el movimiento de aplicación');
    }

    // @Transactional()
    async processRow(row: TransactionRowDto, context: IContext) {

        if (!row?.stampNumber || !row?.contractValue || !row?.docNumber) throw new Error('Fila incompleta campos requeridos');

        const taxpayerInput = taxpayerDto(row);
        const taxpayer = await this.createTaxpayer(taxpayerInput, context);

        const contractInput = contractDto(row, taxpayer.id, taxpayerInput, context);
        const contract = await this.createContract(contractInput, context);

        const [lot] = await this.eventEmitter.emitAsync(findOrCreateCustomLotEvent,
            {
                context,
                name: `Lote - ${row.contractNumber}`,
                organizationProductId: context.organizationProduct?.id,
                internalId: 'custom-lot-' + row.contractNumber
            }
        );

        const lotId = lot?.id;
        if (!lotId) throw new Error('No se pudo obtener o crear el lote');

        const adhesionMovementInput = adhesionMovementDto(row, contract.id, lotId, taxpayer.id, context);
        const adhesionMovement = await this.createAdhesionMovement(adhesionMovementInput, context, contract, contractInput);

        const applyMovementInput = applyMovementDto(row, contract.id, lotId, taxpayer.id, context);
        const applyMovement = await this.createApplyMovement(applyMovementInput, context, contract, contractInput);

        // Crear la transacción
        const [transaction] = await this.eventEmitter.emitAsync(createTransactionByContractEvent, {
            context,
            createContractInput: contractInput
        });

        if (!(transaction instanceof Transaction)) {
            throw new Error('No se pudo crear la transacción asociada al contrato');
        }

        return {
            success: true,
            taxpayer,
            contract,
            lotId,
            adhesionMovement,
            applyMovement,
            transaction
        };
    }
}