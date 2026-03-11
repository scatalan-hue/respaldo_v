import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';

export const V_VUDEC_TAXPAYER_CONTRACTS: string = 'V_VUDEC_TAXPAYER_CONTRACTS';

const V_VUDEC_TAXPAYER_CONTRACTS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_TAXPAYER_CONTRACTS,
  synchronize: false,
  expression: `
  SELECT
    c.[id]                                                                    AS [id],
    c.[consecutive]                                                           AS [contractConsecutive],
    c.[contractType]                                                          AS [contractType],
    c.[taxpayerId]                                                            AS [taxpayerId],
    t.[taxpayerNumber]                                                        AS [taxpayerNumber],
    RTRIM(LTRIM(t.[name])) + 
    COALESCE(NULLIF(' ' + RTRIM(LTRIM(t.[lastName])), ' '), '')               AS [taxpayerName],
    c.[contractDateIni]                                                       AS [contractDateIni],
    c.[contractDateEnd]                                                       AS [contractDateEnd],
    c.[contractValue]                                                         AS [contractValue],
    o.[id]                                                                    AS [organizationId],
    p.[id]                                                                    AS [productId]
  FROM
    vudec_contract                                                            AS [c]
  INNER JOIN
    vudec_taxpayer                                                            AS [t]
    ON t.[id] = c.[taxpayerId]
    AND t.[deletedAt] IS NULL
  INNER JOIN
    vudec_organization_product                                                AS [vop]
    ON vop.[id] = c.[organizationProductId]
    AND vop.[deletedAt] IS NULL
  INNER JOIN
    vudec_product                                                             AS [p]
    ON p.[id] = vop.[productId]
    AND p.[deletedAt] IS NULL
  INNER JOIN
    vudec_organization                                                        AS [o]
    ON o.[id] = vop.[organizationId]
    AND o.[deletedAt] IS NULL
  WHERE
    c.[deletedAt] IS NULL;
  `,
};

export default V_VUDEC_TAXPAYER_CONTRACTS_QUERY;
