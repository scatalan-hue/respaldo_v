import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../../common/i18n/functions/response';
import { City } from '../../../../../general/city/entities/city.entity';
import { findDepartmentEvent } from '../../../../../general/department/constants/events.constants';
import { Department } from '../../../../../general/department/entities/department.entity';
import { FileInfo } from '../../../../../general/files/entities/file-info.entity';
import { FilesService } from '../../../../../general/files/services/files.service';
import { findCityEvent } from '../../../../../security/auth/constants/events.constants';
import { createExternalUserInputEvent, findUserByEvent } from '../../../../../security/users/constants/events.constants';
import { UserTypes } from '../../../../../security/users/enums/user-type.enum';
import { findOrCreateProductEvent } from '../../../product/constants/events.constants';
import { CreateProductInput } from '../../../product/dto/inputs/create-products.input';
import { Product } from '../../../product/entities/products.entity';
import { createOrFindOrganizationProductEvent } from '../../organization-product/constants/events.constants';
import { OrganizationProduct } from '../../organization-product/entities/organization-product.entity';
import { createOrganizationUserEvent, findOrganizationUserEvent } from '../../organization-user/constants/events.constants';
import { findOrCreateOrganizationEvent, findOrganizationByIdEvent, findOrganizationByNitEvent } from '../constants/events.constants';
import { FindOrganizationArgs } from '../dto/args/find-organization.args';
import { CreateOrganizationInput } from '../dto/inputs/create-organization.input';
import { UpdateOrganizationInput } from '../dto/inputs/update-organization.input';
import { ResponseOrganization } from '../dto/models/response-create-organization.model';
import { Organization } from '../entity/organization.entity';
import { CreateTokenInput } from '../../../../../security/auth/dto/inputs/createToken.input';
import { Country } from '../../../../../general/country/entities/country.entity';
import { UserDocumentTypes } from '../../../../../common/enum/document-type.enum';
import { OrganizationStatus } from '../enums/organization-status.enum';

export const serviceStructure = CrudServiceStructure({
  entityType: Organization,
  createInputType: CreateOrganizationInput,
  updateInputType: UpdateOrganizationInput,
  findArgsType: FindOrganizationArgs,
});
@Injectable()
export class OrganizationService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly filesService: FilesService,
  ) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Organization;

  async getQueryBuilder(context: IContext, args?: FindOrganizationArgs): Promise<SelectQueryBuilder<Organization>> {
    const qb = await super.getQueryBuilder(context, args);

    if (args?.organizationParentId) {
      qb.andWhere(`(aa.organizationParentId = '${args?.organizationParentId}')`);
    }
    return qb;
  }

  private async buildCreateOrganizationResponse(context: IContext, organization: Organization): Promise<ResponseOrganization> {
    const { id, name, nit } = organization;

    const organizationProducts = (await organization?.organizationProducts) ?? [];

    const products = await Promise.all(
      organizationProducts.map(async ({ product, key, url, urlTest }) => {
        const { id, name } = await product;
        return { id, name, key: key, url, urlTest };
      }),
    );

    return { id, name, nit, products, ordenType: organization.ordenType };
  }

  async beforeMutation(
    context: IContext,
    repository: Repository<Organization>,
    entity: Organization,
    input: CreateOrganizationInput | UpdateOrganizationInput,
  ): Promise<Organization> {
    let department;

    if (input.departmentId || input.departmentCode) {
      [department] = await this.eventEmitter.emitAsync(findDepartmentEvent, {
        context,
        departmentId: input.departmentId,
        departmentCode: input.departmentCode,
      });
      if (!department && !(department instanceof Department)) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.department'));

      entity.department = department;
    }

    if (input.cityId || input.cityCode) {
      const departmentCode = input.departmentCode || department.code;

      if (!departmentCode) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.department'));

      const [city] = await this.eventEmitter.emitAsync(findCityEvent, {
        context,
        cityId: input.cityId,
        cityCode: input.cityCode,
        departmentCode: departmentCode,
      });

      if (!city && !(city instanceof City)) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.city'));

      entity.city = city;
    }

    if (input.organizationParentId || input.organizationParentNit) {
      const organizationParent = await this.findOneBy(context, {
        where: {
          ...(input.organizationParentId && { id: input.organizationParentId }),
          ...(input.organizationParentNit && { nit: input.organizationParentNit }),
        },
      });

      if (!organizationParent && !(organizationParent instanceof Organization))
        throw new NotFoundException(
          sendResponse(context, this.I18N_SPACE, 'beforeMutation.organizationParent', {
            organizationParentId: input.organizationParentId,
          }),
        );

      entity.organizationParent = organizationParent;
    }

    if (input.logoInput) {
      const logo = await this.filesService.findOrCreateFileBySource(context, input.logoInput);

      if (!logo && !(logo instanceof FileInfo)) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.logo'));

      if (logo && logo.id && input.logoInput.fileId) {
        const organizationWithSameLogo = await this.findOneBy(context, {
          where: {
            logo: { id: logo.id },
          },
        });

        if (organizationWithSameLogo) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.logoAlreadyAssigned'));
      }

      entity.logo = logo;
    }

    if ((entity.token == '' || entity.token == undefined) && (input.token == '' || input.token == undefined)) {
      entity.status = OrganizationStatus.Incomplete;
    } else if (!input.status && entity.status == OrganizationStatus.Incomplete && input.token !== '') {
      entity.status = OrganizationStatus.Active;
    }

    return entity;
  }

  async assignOrFindProductToOrganization(context: IContext, entity: Organization, productInputs: CreateProductInput[]): Promise<OrganizationProduct[]> {
    let organizationProducts: OrganizationProduct[] = [];

    for (const productInput of productInputs || []) {
      const [product] = await this.eventEmitter.emitAsync(findOrCreateProductEvent, {
        context,
        productInput,
      });

      const [organizationProduct] = await this.eventEmitter.emitAsync(createOrFindOrganizationProductEvent, {
        context,
        input: {
          organizationId: entity.id,
          productId: product.id,
          url: productInput.url,
          urlTest: productInput.urlTest,
        },
      });

      await organizationProducts.push(organizationProduct);
    }

    return organizationProducts;
  }

  async findOrCreate(context: IContext, organizationInput: CreateOrganizationInput): Promise<ResponseOrganization> {
    let organization: Organization;

    if (organizationInput?.nit)
      organization = await this.findOneBy(context, {
        where: { nit: organizationInput.nit },
      });

    if (!organization) organization = await this.create(context, organizationInput);
    else {
      const [userToOrganizationFoundByIde] = await this.eventEmitter.emitAsync(findUserByEvent, {
        context,
        options: {
          where: [
            {
              identificationNumber: organizationInput.nit,
            },
          ],
        },
      });

      if (!userToOrganizationFoundByIde) {
        const [userToOrganizationFoundByEmail] = await this.eventEmitter.emitAsync(findUserByEvent, {
          context,
          options: {
            where: [
              {
                email: organization?.email,
              },
            ],
          },
        });

        if (userToOrganizationFoundByEmail?.identificationNumber && userToOrganizationFoundByEmail?.identificationNumber !== organizationInput?.nit) {
          throw new BadRequestException('No se puede asignar usuario a la organización, ya que el correo electrónico ya está asignado a otro usuario');
        }

        let organizationCity: City = await Promise.resolve(organization?.city);
        let organizationDepartment: Department = await Promise.resolve(organization?.department);
        let organizationCountry: Country = await Promise.resolve(organizationDepartment?.country);

        const userInput: CreateTokenInput = {
          email: organization?.email,
          identificationNumber: organization?.nit,
          name: organization?.name,
          lastName: '',
          type: UserTypes.Admin,
          countryId: organizationCountry?.id,
          departmentId: organizationDepartment?.id,
          cityId: organizationCity?.id,
          identificationType: UserDocumentTypes.Nit,
          phoneNumber: organization?.phone,
        };

        await this.eventEmitter.emitAsync(createExternalUserInputEvent, { context: { ...context, organization: organization }, user: userInput });
      }

      const [userSuperAdmin] = await this.eventEmitter.emitAsync(findUserByEvent, {
        context,
        options: {
          where: [
            {
              type: UserTypes.SuperAdmin,
            },
          ],
        },
      });

      const [organizationUserAdmin] = await this.eventEmitter.emitAsync(findOrganizationUserEvent, {
        context: { ...context, organization },
        organizationId: organization?.id,
        userId: userSuperAdmin.id,
      });

      if (!organizationUserAdmin) {
        await this.eventEmitter.emitAsync(createOrganizationUserEvent, {
          context: { ...context, organization: organization },
          createInput: {
            organizationId: organization.id,
            userId: userSuperAdmin.id,
          },
        });
      }
    }

    const productsOrganization = await this.assignOrFindProductToOrganization(context, organization, organizationInput?.products);

    organization.organizationProducts = productsOrganization;

    const response = await this.buildCreateOrganizationResponse(context, organization);

    return response;
  }

  async beforeCreate(context: IContext, repository: Repository<Organization>, entity: Organization, createInput: CreateOrganizationInput): Promise<void> {
    const prevEntity = await this.findOneBy(context, {
      where: { nit: createInput.nit },
    });

    if (prevEntity) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'beforeCreate.organizationAlreadyExists'));

    const organizationByEmail = await this.findOneBy(context, {
      where: { email: createInput.email },
    });

    if (organizationByEmail) throw new BadRequestException('Ya existe una organización con el mismo correo electrónico');

    entity = await this.beforeMutation(context, repository, entity, createInput);
  }

  async afterCreate(context: IContext, repository: Repository<Organization>, entity: Organization, createInput: CreateOrganizationInput): Promise<void> {
    let organizationCity: City = await Promise.resolve(entity?.city);
    let organizationDepartment: Department = await Promise.resolve(entity?.department);
    let organizationCountry: Country = await Promise.resolve(organizationDepartment?.country);

    const userInput: CreateTokenInput = {
      email: entity?.email,
      identificationNumber: entity?.nit,
      name: entity?.name,
      lastName: '',
      type: UserTypes.Admin,
      countryId: organizationCountry?.id,
      departmentId: organizationDepartment?.id,
      cityId: organizationCity?.id,
      identificationType: UserDocumentTypes.Nit,
      phoneNumber: entity?.phone,
    };

    await this.eventEmitter.emitAsync(createExternalUserInputEvent, { context: { ...context, organization: entity }, user: userInput });

    const [userSuperAdmin] = await this.eventEmitter.emitAsync(findUserByEvent, {
      context,
      options: {
        where: [
          {
            type: UserTypes.SuperAdmin,
          },
        ],
      },
    });

    if (userSuperAdmin) {
      await this.eventEmitter.emitAsync(createOrganizationUserEvent, {
        context: { ...context, organization: entity },
        createInput: {
          organizationId: entity.id,
          userId: userSuperAdmin.id,
        },
      });
    }
  }

  async beforeUpdate(context: IContext, repository: Repository<Organization>, entity: Organization, updateInput: UpdateOrganizationInput): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, updateInput);
  }

  async organizationProducts(context: IContext, organization: Organization): Promise<Product[]> {
    const currentOrganization = await this.findOne(context, organization.id, false);

    const organizationProducts = (await currentOrganization?.organizationProducts) ?? [];

    const products = await Promise.all(
      organizationProducts.map(async (orgProduct) => {
        return { ...(await orgProduct.product) };
      }),
    );

    return products;
  }

  @OnEvent(findOrCreateOrganizationEvent, { suppressErrors: false })
  async onFindOrCreateOrganizationEvent({ context, organizationInput }: { context: IContext; organizationInput: CreateOrganizationInput }): Promise<ResponseOrganization> {
    return await this.findOrCreate(context, organizationInput);
  }

  @OnEvent(findOrganizationByNitEvent)
  async onFindOrganizationByNitEvent({ context, nit }: { context: IContext; nit: string }): Promise<Organization> {
    return await this.findOneBy(context, {
      where: { nit },
    });
  }

  @OnEvent(findOrganizationByIdEvent)
  async onFindOrganizationByIdEvent({ context, id }: { context: IContext; id: string }): Promise<Organization> {
    return await this.findOne(context, id);
  }
}
