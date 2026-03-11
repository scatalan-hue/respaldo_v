import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Mutex } from 'async-mutex';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { FindManyOptions, Not, Repository } from 'typeorm';
import { UserDocumentTypes } from '../../../../common/enum/document-type.enum';
import { I18N_SPACE } from '../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../common/i18n/functions/response';
import { CreateTokenInput } from '../../../../security/auth/dto/inputs/createToken.input';
import { createExternalUserInputEvent, findUserByEvent, updateUserEvent } from '../../../../security/users/constants/events.constants';
import { User } from '../../../../security/users/entities/user.entity';
import { UserTypes } from '../../../../security/users/enums/user-type.enum';
import { findOrCreateOrganizationTaxpayerEvent } from '../../organizations/organization-taxpayer/constants/events.constants';
import { OrganizationTaxpayer } from '../../organizations/organization-taxpayer/entities/organization-taxpayer.entity';
import { createOrUpdateTaxpayerEvent, findTaxpayerByEvent, findTaxpayerByIdEvent, findTaxpayerEvent } from '../constants/events.constants';
import { FindTaxpayerArgs } from '../dto/args/find-taxpayer.args';
import { CreateTaxpayerInput } from '../dto/inputs/create-taxpayer.input';
import { UpdateTaxpayerInput } from '../dto/inputs/update-taxpayer.input';
import { Taxpayer } from '../entity/taxpayer.entity';
import { TypeDoc } from '../enums/taxpayer-type.enum';

export const serviceStructure = CrudServiceStructure({
  entityType: Taxpayer,
  createInputType: CreateTaxpayerInput,
  updateInputType: UpdateTaxpayerInput,
  findArgsType: FindTaxpayerArgs,
});

@Injectable()
export class TaxpayerService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
    this.taxpayerMutex = new Mutex();
  }

  private readonly I18N_SPACE = I18N_SPACE.Taxpayer;
  private taxpayerMutex = new Mutex();

  /**
   * Mapea los tipos de documento de TypeDoc a los códigos aceptados por SIGEC
   * @param {TypeDoc | string} docTypePayload - Tipo de documento desde TypeDoc
   * @returns {string} Código del tipo de documento para SIGEC
   */
  private mapDocumentPayloadToTaxpayerType(docTypePayload: string): TypeDoc {
    const docType = String(docTypePayload)?.trim();

    if (!docType) return TypeDoc.CC;

    if (Object.values(TypeDoc).includes(docType as TypeDoc)) {
      return docType as TypeDoc;
    } else {
      const documentTypeMap: Record<string, TypeDoc> = {
        ['CEDULA']: TypeDoc.CC,
        ['CÉDULA DE CIUDADANIA']: TypeDoc.CC,
        ['TARJETAI']: TypeDoc.TI,
        ['TARJETA DE IDENTIDAD']: TypeDoc.TI,
        ['TARJETAE']: TypeDoc.TE,
        ['TARJETA DE EXTRANJERÍA']: TypeDoc.TE,
        ['CEDULAE']: TypeDoc.CE,
        ['CÉDULA DE EXTRANJERÍA']: TypeDoc.CE,
        ['REGISTROCIVIL']: TypeDoc.RC,
        ['REGISTRO CIVIL']: TypeDoc.RC,
        ['NIT DE EXTRANJERÍA']: TypeDoc.NITEXT,
      };

      return documentTypeMap[docType] || TypeDoc.CC;
    }
  }

  private mapTaxpayerToUserDocumentType(typeDoc: string): UserDocumentTypes {
    const documentTypeMap = {
      [TypeDoc.CC]: UserDocumentTypes.CitizenshipCard,
      [TypeDoc.NIT]: UserDocumentTypes.Nit,
      [TypeDoc.TI]: UserDocumentTypes.IdentityCard,
      [TypeDoc.TE]: UserDocumentTypes.ForeignerCard,
      [TypeDoc.CE]: UserDocumentTypes.ForeignerIdentityCard,
      [TypeDoc.RC]: UserDocumentTypes.CivilRegistry,
      [TypeDoc.NITEXT]: UserDocumentTypes.ForeignNit,
    };

    return documentTypeMap[typeDoc] || UserDocumentTypes.CitizenshipCard;
  }

  private validateInput(context: IContext): void {
    const { organizationProduct }: IContext = context;

    if (!organizationProduct) {
      throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'validateInput.organizationProduct'));
    }
  }

  private async homologateTaxpayerInUser(context: IContext, taxpayer: Taxpayer): Promise<User> {
    const [existingUserPublic] = await this.eventEmitter.emitAsync(findUserByEvent, {
      context,
      options: {
        where: {
          identificationNumber: String(taxpayer?.taxpayerNumber),
          type: UserTypes.Public,
        },
      },
    });

    let existingUserPublicInOrganization: User;

    if (existingUserPublic) {
      const findExistingUserPayload = {
        id: existingUserPublic?.id,
        organizationUsers: { organization: { id: context?.organization?.id } },
        type: UserTypes.Public,
      };

      [existingUserPublicInOrganization] = await this.eventEmitter.emitAsync(findUserByEvent, {
        context,
        options: {
          where: findExistingUserPayload,
        },
      });
    }

    let userCreatedOrUpdated: User;

    const userInput: CreateTokenInput = {
      email: taxpayer?.email,
      identificationNumber: String(taxpayer?.taxpayerNumber),
      name: taxpayer?.name,
      lastName: taxpayer?.lastName,
      phoneNumber: taxpayer?.phone,
      identificationType: this.mapTaxpayerToUserDocumentType(taxpayer?.taxpayerNumberType),
    };

    if (existingUserPublicInOrganization instanceof User) {
      const [userUpdated] = await this.eventEmitter.emitAsync(updateUserEvent, {
        context,
        input: { id: existingUserPublicInOrganization?.id, ...userInput },
      });

      userCreatedOrUpdated = userUpdated;
    } else {
      const [userCreated] = await this.eventEmitter.emitAsync(createExternalUserInputEvent, {
        context,
        user: { ...userInput, type: UserTypes.Public },
      });

      userCreatedOrUpdated = userCreated;
    }

    return userCreatedOrUpdated;
  }

  async createOrUpdate(context: IContext, payload: CreateTaxpayerInput) {
    return await this.taxpayerMutex.runExclusive(async () => {
      const { taxpayerNumber }: CreateTaxpayerInput = payload;

      let taxpayer = await this.findOneBy(context, { where: { taxpayerNumber: taxpayerNumber.toString() } });

      const basicInfoFormatted = {
        ...payload,
        taxpayerNumber: payload.taxpayerNumber.toString(),
        name: !payload?.name && !payload?.lastName && payload?.fullName ? String(payload.fullName || "").trim() : (payload?.name || '')?.trim(),
        middleName: !payload?.name && !payload?.lastName && payload?.fullName ? '' : (payload?.middleName || '')?.trim(),
        lastName: !payload?.name && !payload?.lastName && payload?.fullName ? '' : (payload?.lastName || '')?.trim(),
        secondSurname: !payload?.name && !payload?.lastName && payload?.fullName ? '' : (payload?.secondSurname || '')?.trim(),
      };

      if (!taxpayer) return await this.create(context, { ...basicInfoFormatted });

      taxpayer = await this.update(context, taxpayer.id, { id: taxpayer?.id, ...basicInfoFormatted });

      return taxpayer;
    });
  }

  async assignTaxpayerToOrganization(context: IContext, entity: Taxpayer): Promise<OrganizationTaxpayer> {
    const { organization } = context;

    const [organizationTaxpayer] = await this.eventEmitter.emitAsync(findOrCreateOrganizationTaxpayerEvent, {
      context,
      input: {
        organizationId: organization?.id,
        taxpayerId: entity?.id,
      },
    });

    if (!(organizationTaxpayer instanceof OrganizationTaxpayer)) {
      throw new BadRequestException('Error al asociar el tercero a la organización');
    }

    return organizationTaxpayer;
  }

  async beforeCreate(context: IContext, repository: Repository<Taxpayer>, entity: Taxpayer, createInput: CreateTaxpayerInput): Promise<void> {
    await this.validateInput(context);

    let findTaxpayerExisting = await this.findOneBy(context, {
      where: { taxpayerNumber: createInput?.taxpayerNumber },
    });

    if (findTaxpayerExisting) throw new BadRequestException('Ya existe un tercero con esta identificación');

    entity.taxpayerNumber = createInput.taxpayerNumber.toString(),
      entity.taxpayerNumberType = createInput.taxpayerNumberType ? this.mapDocumentPayloadToTaxpayerType(createInput?.taxpayerNumberType) : TypeDoc.CC;
    entity.email = String(createInput.email || '')
      ?.trim()
      ?.toLowerCase();
    entity.name = String(createInput.name || '').trim();
    entity.middleName = String(createInput.middleName || '').trim();
    entity.lastName = String(createInput.lastName || '').trim();
    entity.secondSurname = String(createInput.secondSurname || '').trim();
  }

  async beforeUpdate(context: IContext, repository: Repository<Taxpayer>, entity: Taxpayer, updateInput: UpdateTaxpayerInput): Promise<void> {
    const { taxpayerNumber }: UpdateTaxpayerInput = updateInput;

    if (updateInput?.taxpayerNumber && taxpayerNumber !== entity?.taxpayerNumber) {
      const existingTaxpayerWithIdentificationNumber = await this.findOneBy(context, {
        where: { taxpayerNumber, id: Not(entity.id) },
      });

      if (existingTaxpayerWithIdentificationNumber) {
        throw new BadRequestException('Ya existe un tercero con esta identificación');
      }
    }

    entity.taxpayerNumberType = updateInput?.taxpayerNumberType
      ? this.mapDocumentPayloadToTaxpayerType(updateInput?.taxpayerNumberType)
      : entity?.taxpayerNumberType;
    entity.email = updateInput?.email
      ? String(updateInput.email || '')
        ?.trim()
        ?.toLowerCase()
      : entity?.email;
    entity.name = updateInput?.name ? String(updateInput.name || '').trim() : entity?.name;
    entity.middleName = updateInput?.middleName ? String(updateInput.middleName || '').trim() : entity?.middleName;
    entity.lastName = updateInput?.lastName ? String(updateInput.lastName || '').trim() : entity?.lastName;
    entity.secondSurname = updateInput?.secondSurname ? String(updateInput.secondSurname || '').trim() : entity?.secondSurname;
  }

  async afterCreate(context: IContext, repository: Repository<Taxpayer>, entity: Taxpayer, createInput: CreateTaxpayerInput): Promise<void> {
    const organizationTaxpayer: OrganizationTaxpayer = await this.assignTaxpayerToOrganization(context, entity);

    entity.organizationTaxpayers = [organizationTaxpayer];

    await this.homologateTaxpayerInUser(context, entity);
  }

  async afterUpdate(context: IContext, repository: Repository<Taxpayer>, entity: Taxpayer, updateInput: UpdateTaxpayerInput): Promise<void> {
    const organizationTaxpayer: OrganizationTaxpayer = await this.assignTaxpayerToOrganization(context, entity);

    entity.organizationTaxpayers = [organizationTaxpayer];

    await this.homologateTaxpayerInUser(context, entity);
  }

  @OnEvent(createOrUpdateTaxpayerEvent, { suppressErrors: false })
  async onCreateOrUpdateTaxpayerEvent({ context, createInput }: { context: IContext; createInput: CreateTaxpayerInput }): Promise<Taxpayer> {
    return await this.createOrUpdate(context, createInput);
  }

  @OnEvent(findTaxpayerEvent)
  async onFindTaxpayerEvent({ context, taxpayerNumber }: { context: IContext; taxpayerNumber: string }): Promise<Taxpayer> {
    if (!taxpayerNumber) {
      throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'findTaxpayer.taxpayerNumberRequired'));
    }
    return await this.findOneBy(context, { where: { taxpayerNumber } });

  }

  @OnEvent(findTaxpayerByIdEvent, { suppressErrors: false })
  async onFindTaxpayerByIdEvent({ context, id }: { context: IContext; id: string }): Promise<Taxpayer> {
    return await this.findOneBy(context, { where: { id } }, true);
  }

  @OnEvent(findTaxpayerByEvent)
  async onFindTaxpayerByEvent({ context, options }: { context: IContext; options: FindManyOptions }): Promise<Taxpayer> {
    return await this.findOneBy(context, options);
  }
}
