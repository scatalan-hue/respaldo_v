import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { createExcelReportEvent } from '../../../../general/documents/document/constants/events.constants';
import { OrganizationUser } from '../../../../main/vudec/organizations/organization-user/entities/organization-user.entity';
import { Organization } from '../../../../main/vudec/organizations/organization/entity/organization.entity';
import { MetadataPagination } from '../../../../patterns/crud-pattern/classes/args/metadata-pagination.args';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FindUserViewArgs } from '../../dto/args/find-user-view.args';
import { User } from '../../entities/user.entity';
import { UserView } from '../../entities/views/user.view.entity';
import { UserTypes } from '../../enums/user-type.enum';
import { user_fields } from '../../report/user-report';

export const serviceStructure = CrudServiceStructure({
  entityType: UserView,
  findArgsType: FindUserViewArgs,
});

@Injectable()
export class UserViewService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async usersReport(context: IContext, args: FindUserViewArgs, res: Response) {
    const findArgs = args || {};
    await this.prepareWhereClause(context, findArgs);
    const users: UserView[] = await this.findAll(context, findArgs);

    const [workbook] = await this.eventEmitter.emitAsync(createExcelReportEvent, {
      context,
      data: users,
      fields: user_fields,
      fileName: `reporte_usuarios`,
      sheetName: 'Usuarios',
      res,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_usuarios.xlsx"');

    await workbook.xlsx.write(res);
    res.status(HttpStatus.OK).end();
  }

  async usersView(context: IContext, args?: FindUserViewArgs): Promise<UserView[]> {
    const findArgs = args || {};
    await this.prepareWhereClause(context, findArgs);
    return await this.findAll(context, findArgs);
  }

  async usersViewCount(context: IContext, args?: FindUserViewArgs): Promise<MetadataPagination> {
    const findArgs = args || {};
    await this.prepareWhereClause(context, findArgs);
    return await this.Count(context, findArgs);
  }

  private async prepareWhereClause(context: IContext, args: FindUserViewArgs): Promise<void> {
    const user: User = context.user;
    const organization: Organization = (await Promise.resolve(context.organization)) as Organization;

    if (!organization) {
      throw new ForbiddenException('No has proporcionado una organización');
    }

    const organizationUsers: OrganizationUser[] = await Promise.resolve(user.organizationUsers);
    const userOrganizations = await Promise.all(organizationUsers?.map(async (ou) => ((await Promise.resolve(ou.organization)) as Organization).id) || []);

    if (!userOrganizations.includes(organization.id)) {
      throw new ForbiddenException('No tienes acceso a esta organización');
    }

    if (!args['where']) {
      args['where'] = {};
    }

    args['where']['organizationId'] = { _eq: organization.id };

    // Aplicar filtros según el tipo de usuario
    switch (user?.type) {
      case UserTypes.SuperAdmin:
        await this.handleSuperAdminFilters(args, user);
        break;
      case UserTypes.Admin:
        -(await this.handleAdminFilters(args));
        break;
      case UserTypes.User:
        throw new ForbiddenException('No tienes permisos para consultar usuarios');
      default:
        throw new ForbiddenException('No tienes permisos para consultar usuarios');
    }
  }

  private async handleSuperAdminFilters(args: FindUserViewArgs, user: User): Promise<void> {
    args['where']['id'] = { _neq: user.id };

    // Si hay un filtro de tipo, verificar que no incluya SuperAdmin
    if (args['where']['type']) {
      if (args['where']['type']._in?.includes(UserTypes.SuperAdmin) || args['where']['type']._eq === UserTypes.SuperAdmin) {
        throw new ForbiddenException('No puedes filtrar usuarios de tipo SuperAdmin');
      }
    }
  }

  // private async handleUserFilters(args: FindUserViewArgs): Promise<void> {
  //   if (args['where']['type']) {
  //     const typeFilter = args['where']['type'];
  //     const isPublicType = typeFilter._eq === UserTypes.Public || (typeFilter._in && typeFilter._in.includes(UserTypes.Public));

  //     if (!isPublicType) {
  //       throw new ForbiddenException('Solo puedes ver usuarios de tipo publico');
  //     }
  //   }
  //   args['where']['type'] = { _eq: UserTypes.Public };
  // }

  private async handleAdminFilters(args: FindUserViewArgs): Promise<void> {
    if (args['where']['type']?._in?.includes(UserTypes.SuperAdmin)) {
      throw new ForbiddenException('No tienes permisos para filtrar usuarios de tipo SuperAdmin');
    }

    if (args['where']['type']?._eq) {
      if (args['where']['type']._eq !== UserTypes.Public && args['where']['type']._eq !== UserTypes.User) {
        throw new ForbiddenException('Solo puedes filtrar por usuarios de tipo Public o User');
      }
      return;
    }

    args['where']['type'] = { _in: [UserTypes.Public, UserTypes.User] };
  }
}
