import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { V_VUDEC_LOT_CONTRACTS } from 'src/main/vudec/lots/lot/entity/queries/lot-contracts.view.query';
import { MovementStatus } from 'src/main/vudec/movement/enums/movement-status.enum';
import { Status } from '../../enum/contract-status.enum';

export const V_CONTRACTS: string = 'V_CONTRACTS';

const V_CONTRACTS_QUERY: ViewEntityOptions = {
  name: V_CONTRACTS,
  dependsOn: [V_VUDEC_LOT_CONTRACTS],
  synchronize: false,
  expression: `
  WITH CTE_Lot_contracts AS (
    SELECT
      id                                                                  AS [contractId],
      SUM(liquidatedTotal)                                                AS [liquidatedTotal],
      SUM(movementsCount)                                                 AS [movementsCount],
      CASE WHEN SUM(
        CASE WHEN status = '${Status.Error}' THEN 1 ELSE 0 END
      ) > 0 THEN '${Status.Error}' WHEN SUM(
        CASE WHEN status = '${Status.Pending}' THEN 1 ELSE 0 END
      ) > 0 THEN '${Status.Pending}' ELSE '${MovementStatus.Send}' 
      END                                                                 AS [status],
	  MAX(description)													  AS [description],
	  hasAssignment													      AS [hasAssignment]
    FROM
      V_VUDEC_LOT_CONTRACTS
    GROUP BY
      id
	  ,hasAssignment
  )
  SELECT
    vct.[id]                                                              AS [id],
    NULL                                                                  AS [lotId],
    vct.[consecutive]                                                     AS [contractConsecutive],
    vct.[id]                                                              AS [contractId],
    vct.[contractType]                                                    AS [contractType],
    vct.[taxpayerId]                                                      AS [taxpayerId],
    vtx.[taxpayerNumber]                                                  AS [taxpayerNumber],
    RTRIM(LTRIM(vtx.[name])) + 
    COALESCE(NULLIF(' ' + RTRIM(LTRIM(vtx.[lastName])), ' '), '')         AS [taxpayerName],
    vct.[updatedAt]                                                       AS [updatedAt],
    vct.[contractDate]                                                    AS [contractDate],
    vct.[contractDateIni]                                                 AS [contractDateIni],
    vct.[contractDateEnd]                                                 AS [contractDateEnd],
    vct.[contractValue]                                                   AS [contractValue],
    lct.[movementsCount]                                                  AS [movementsCount],
    lct.[liquidatedTotal]                                                 AS [liquidatedTotal],
    lct.[status]                                                          AS [status],
    lct.[description]                                                     AS [description],
    lct.[hasAssignment]                                                   AS [hasAssignment],
    vor.[id]                                                              AS [organizationId],
    vpr.[id]                                                              AS [productId],
    vpr.[name]                                                            AS [productName],
    CASE WHEN fil.[id] IS NOT NULL
    AND fil.[fileExtension] IS NOT NULL THEN CONCAT(
      '/attachment/files/static/', fil.[id],
      '.', fil.[fileExtension]
    ) ELSE NULL END                                                       AS [logoProductUrl]
  FROM
    vudec_contract                                                        AS [vct]
  INNER JOIN
    CTE_Lot_contracts                                                     AS [lct]
    ON lct.[contractId] = vct.[id]
  INNER JOIN 
    vudec_taxpayer                                                        AS [vtx]
    ON vct.[taxpayerId] = vtx.[id]
    AND vtx.[deletedAt] IS NULL
  INNER JOIN 
    vudec_organization_product                                            AS [vop]
    ON vop.[id] = vct.[organizationProductId]
    AND vop.[deletedAt] IS NULL
  INNER JOIN 
    vudec_product                                                         AS [vpr]
    ON vop.[productId] = vpr.[id]
  INNER JOIN 
    vudec_organization                                                    AS [vor]
    ON vop.[organizationId] = vor.[id]
    AND vor.[deletedAt] IS NULL
  LEFT JOIN 
    grl_file                                                              AS [fil]
    ON vpr.[logoId] = fil.[id]
    AND fil.[deletedAt] IS NULL
  WHERE
    vct.[deletedAt] IS NULL;
`,
};

export default V_CONTRACTS_QUERY;
