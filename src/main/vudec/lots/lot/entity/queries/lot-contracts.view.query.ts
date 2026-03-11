import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { V_VUDEC_MOVEMENTS } from '../../../../movement/entity/queries/movement.view.query';

export const V_VUDEC_LOT_CONTRACTS: string = 'V_VUDEC_LOT_CONTRACTS';

const V_VUDEC_LOT_CONTRACTS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_LOT_CONTRACTS,
  dependsOn: [V_VUDEC_MOVEMENTS],
  synchronize: false,
  expression: `
  SELECT 
    vct.[id]                                                                      AS [id], 
    vct.[consecutive]                                                             AS [contractConsecutive], 
    vct.[id]                                                                      AS [contractId], 
    vct.[contractType]                                                            AS [contractType], 
    vct.[taxpayerId]                                                              AS [taxpayerId], 
    vtx.[taxpayerNumber]                                                          AS [taxpayerNumber], 
    RTRIM(LTRIM(vtx.[name])) + 
    COALESCE(NULLIF(' ' + RTRIM(LTRIM(vtx.[lastName])), ' '), '')                 AS [taxpayerName],
    vct.[updatedAt]                                                               AS [updatedAt], 
    vct.[contractDate]                                                            AS [contractDate], 
    vct.[contractDateIni]                                                         AS [contractDateIni], 
    vct.[contractDateEnd]                                                         AS [contractDateEnd], 
    vct.[contractValue]                                                           AS [contractValue], 
    vor.[id]                                                                      AS [organizationId], 
    vpr.[id]                                                                      AS [productId], 
    vpr.[name]                                                                    AS [productName], 
    CASE WHEN fil.[id] IS NOT NULL 
    AND fil.[fileExtension] IS NOT NULL THEN CONCAT(
      '/attachment/files/static/', fil.[id], 
      '.', fil.[fileExtension]
    ) ELSE NULL END                                                               AS [logoProductUrl], 
    vlt.[id]                                                                      AS [lotId], 
    vlt.[name]                                                                    AS [lotName], 
    mov.[movementsCount]                                                          AS [movementsCount], 
    mov.[liquidatedTotal]                                                         AS [liquidatedTotal], 
    mov.[status]                                                                  AS [status],
    mov.[description]                                                             AS [description],
    mov.[hasAssignment]                                                           AS [hasAssignment]
  FROM 
    vudec_lot_contract                                                            AS [vlc] 
  INNER JOIN 
    vudec_contract                                                                AS [vct] 
    ON vlc.[contractId] = vct.[id] 
    AND vct.[deletedAt] IS NULL 
  INNER JOIN 
    vudec_lot                                                                     AS [vlt] 
    ON vlc.[lotId] = vlt.[id] 
    AND vlt.[deletedAt] IS NULL 
  INNER JOIN 
    vudec_taxpayer                                                                AS [vtx] 
    ON vct.[taxpayerId] = vtx.[id] 
    AND vtx.[deletedAt] IS NULL 
  INNER JOIN 
    vudec_organization_product                                                    AS [vop] 
    ON vop.[id] = vct.[organizationProductId] 
    AND vop.[deletedAt] IS NULL 
  INNER JOIN 
    vudec_product                                                                 AS [vpr] 
    ON vop.[productId] = vpr.[id] 
    AND vpr.[deletedAt] IS NULL 
  INNER JOIN 
    vudec_organization                                                            AS [vor]
    ON vop.[organizationId] = vor.[id] 
    AND vor.[deletedAt] IS NULL 
  INNER JOIN 
    (
      SELECT 
        mov.[contractId], 
        mov.[lotId], 
        COUNT(CASE WHEN mov.[type] = 'APPLY' THEN mov.[id] END)                   AS [movementsCount], 
        SUM(mov.[liquidatedValue])                                                AS [liquidatedTotal], 
        CASE WHEN SUM(
          CASE WHEN mov.[status] = 'ERROR' THEN 1 ELSE 0 END
        ) > 0 THEN 'ERROR' WHEN SUM(
          CASE WHEN mov.[status] = 'UNSENT' THEN 1 ELSE 0 END
        ) > 0 THEN 'PENDING' ELSE 'SEND' END                                      AS [status],
       MAX(CASE WHEN mov.[type] = 'ASSIGNMENT' THEN mov.[description] END)       AS [description], -- MODIFICADO: Usa MAX en lugar de subconsulta
        CASE WHEN COUNT(CASE WHEN mov.[type] = 'ASSIGNMENT' THEN 1 END) > 0      -- MODIFICADO: Usa COUNT para verificar existencia
          THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END							 AS [hasAssignment]
      FROM 
        V_VUDEC_MOVEMENTS                                                         AS [mov] 
      GROUP BY 
        mov.[contractId], 
        mov.[lotId]
    )                                                                              AS [mov] 
    ON mov.[contractId] = vct.[id] 
    AND mov.[lotId] = vlt.[id] 
  LEFT JOIN 
    grl_file                                                                       AS [fil] 
    ON vpr.[logoId] = fil.[id] 
    AND [fil].[deletedAt] IS NULL 
  WHERE 
    vlc.[deletedAt] IS NULL;
  `,
};

export default V_VUDEC_LOT_CONTRACTS_QUERY;
