import { EntityManager } from 'typeorm';
import { OrganizationProduct } from '../../../main/vudec/organizations/organization-product/entities/organization-product.entity';
import { Organization } from '../../../main/vudec/organizations/organization/entity/organization.entity';
import { Product } from '../../../main/vudec/product/entities/products.entity';
import { User } from '../../../security/users/entities/user.entity';
import { DatosGovResponse } from 'src/external-api/sigec/dto/datos-gov.response.dto';

export interface IContext {
  transactionManager?: EntityManager;
  user: User;
  language?: string;
  organization?: Organization;
  product?: Product;
  organizationProduct?: OrganizationProduct;
  ip?: string;
  disableAudits?: boolean;
  transactionId?: string;
  movementId?: string;
  dataSigec?: DatosGovResponse;
}
