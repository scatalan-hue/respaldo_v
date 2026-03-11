import { adhesionMovementDto, applyMovementDto, contractDto, taxpayerDto } from "../../mappers/save-transaction.mapper/excel-to-dto.mapper";
import { CreateContractInput } from "src/main/vudec/contracts/contract/dto/inputs/create-contract.input";
import { createContractEvent } from "src/main/vudec/contracts/contract/constants/events.constants";
import { createOrUpdateTaxpayerEvent } from "src/main/vudec/taxpayer/constants/events.constants";
import { CreateTaxpayerInput } from "src/main/vudec/taxpayer/dto/inputs/create-taxpayer.input";
import { CreateMovementInput } from "src/main/vudec/movement/dto/inputs/create-movement.input";
import { findOrCreateCustomLotEvent } from "src/main/vudec/lots/lot/constants/lot.constants";
import { createMovementEvent } from "src/main/vudec/movement/constants/events.constants";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { TransactionRowDto } from "../../validators/save-transaction.validator";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Injectable, Logger } from "@nestjs/common";
import pMap from 'p-map';


@Injectable()
export class SaveExcelService {
    private readonly logger = new Logger(SaveExcelService.name);
    constructor(
        private readonly eventEmitter: EventEmitter2,
    ) { }
    private async createTaxpayer(taxpayerInput: CreateTaxpayerInput, context: IContext) {
        const [result] = await this.eventEmitter.emitAsync(createOrUpdateTaxpayerEvent, { context, createInput: taxpayerInput })
        const taxpayer = Array.isArray(result) ? result[0] : result;
        if (!taxpayer || !taxpayer.id) throw new Error('No se pudo crear el tercero');
        return taxpayer;
    }
    private async createContract(createInput: CreateContractInput, context: IContext) {
        const [result] = await this.eventEmitter.emitAsync(createContractEvent, { context, createInput });
        const contract = Array.isArray(result) ? result[0] : result;
        if (!contract || !contract.id) throw new Error('No se pudo crear el conrtrato');
        return contract;
    }
    private async createAdhesionMovement(movementInput: CreateMovementInput, context: IContext, contract: any, createContractInput: CreateContractInput) {
        const [result] = await this.eventEmitter.emitAsync(createMovementEvent, { movementInput, context, contract, createContractInput });
        const movement = Array.isArray(result) ? result[0] : result;
        if (!movement || !movement.id) throw new Error('No se pudo crear el movimiento de adhesion');
        return movement;
    }
    private async createApplyMovement(movementInput: CreateMovementInput, context: IContext, contract: any, createContractInput: CreateContractInput) {
        const [result] = await this.eventEmitter.emitAsync(createMovementEvent, { movementInput, context, contract, createContractInput });
        const movement = Array.isArray(result) ? result[0] : result;
        if (!movement || !movement.id) throw new Error('No se pudo crear el movimiento de aplicacion');
        return movement;
    }
    async insertExcelInfo(rows: TransactionRowDto[], context: IContext) {
        const CONCURRENCY = 10;
        const processRow = async (row: TransactionRowDto, index: number) => {
            try {
                if (!row || !row.stampNumber || !row.contractValue || !row.docNumber)
                    throw new Error('Fila incompleta campos requeridos (stampNumber, contractValue, docNumber)');

                const taxpayerInput = taxpayerDto(row);
                const taxpayer = await this.createTaxpayer(taxpayerInput, context);
                const contractInput = contractDto(row, taxpayer.id, taxpayerInput, context);
                const contract = await this.createContract(contractInput, context);

                const [lot] = await this.eventEmitter.emitAsync(findOrCreateCustomLotEvent, {
                    context,
                    name: `Lote - ${row.contractNumber}`,
                    organizationProductId: context.organizationProduct?.id,
                    internalId: 'custom-lot-' + row.contractNumber
                });

                const lotId = lot?.id;

                if (!lotId) throw new Error('No se pudo obtener o crear el lote'); //FIXME no se deben guardar datos a medias o se guarda toda la transaccion o nada.
                const adhesionMovementInput = adhesionMovementDto(row, contract.id, lotId, taxpayer.id, context);
                const adhesionMovement = await this.createAdhesionMovement(adhesionMovementInput, context, contract, contractInput);

                const applyMovementInput = applyMovementDto(row, contract.id, lotId, taxpayer.id, context);
                const applyMovement = await this.createApplyMovement(applyMovementInput, context, contract, contractInput);

                return {
                    row,
                    taxpayer,
                    contract,
                    lotId,
                    adhesionMovement,
                    applyMovement
                };
            } catch (error) {
                this.logger.error(`Error guardando fila ${index + 1}: ${error.message}`);
                return { row, error: error.message, success: false };
            }
        };
        // Procesa las filas en paralelo con el limite inpuesto
        return await pMap(rows, processRow, { concurrency: CONCURRENCY });
    }
}