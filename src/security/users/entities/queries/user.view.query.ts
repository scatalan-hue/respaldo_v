import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';

export const V_VUDEC_USERS: string = 'V_VUDEC_USERS';

export const V_VUDEC_USERS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_USERS,
  synchronize: false,
  expression: `
    SELECT 
      u.id                                                                                          AS [id],
      u.name                                                                                        AS [name],
      u.lastName                                                                                    AS [lastName],
      RTRIM(LTRIM(u.[name])) + 
      COALESCE(NULLIF(' ' + RTRIM(LTRIM(u.[lastName])), ' '), '')                                   AS [fullName],
      u.email                                                                                       AS [email],
      u.phoneNumber                                                                                 AS [phoneNumber],
      u.identificationType                                                                          AS [identificationType],
      u.identificationNumber                                                                        AS [identificationNumber],
      u.status                                                                                      AS [status],
      u.type                                                                                        AS [type],
      u.createdAt                                                                                   AS [createdAt],
      u.updatedAt                                                                                   AS [updatedAt],
      u.credentialsExpirationDate                                                                   AS [credentialsExpirationDate],
      ou.organizationId                                                                             AS [organizationId]
    FROM 
      sec_user                                                                                      AS [u]
    INNER JOIN 
      vudec_organization_user                                                                       AS [ou]
      ON u.id = ou.userId
  `,
};

export default V_VUDEC_USERS_QUERY;
