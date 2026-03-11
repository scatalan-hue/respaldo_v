import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { Status } from '../../../../contracts/contract/enum/contract-status.enum';
import { MovementStatus } from '../../../../movement/enums/movement-status.enum';
import { V_VUDEC_MOVEMENTS } from '../../../../movement/entity/queries/movement.view.query';

export const V_VUDEC_LOTS: string = 'V_VUDEC_LOTS';

const V_VUDEC_LOTS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_LOTS,
  dependsOn: [V_VUDEC_MOVEMENTS],
  synchronize: false,
  expression: `
    SELECT 
      l.[id]                                                                                  AS [id],
      l.[consecutive]                                                                         AS [consecutive],
      l.[createdAt]                                                                           AS [createdAt],
      l.[name]                                                                                AS [name],
      o.[id]                                                                                  AS [organizationId],
      MAX(o.[name])                                                                           AS [organizationName],
	    o.[organizationParentId]                                                                AS [organizationParentId],
      p.[id]                                                                                  AS [productId],
      COUNT(DISTINCT lc.[contractId])                                                         AS [total],
      CASE 
        WHEN COUNT(CASE WHEN c.[contractStatus] = '${Status.Error}' THEN 1 END) > 0 
            THEN '${Status.Error}'
        WHEN COUNT(CASE WHEN c.[contractStatus] = '${Status.Pending}' THEN 1 END) > 0 
            THEN '${Status.Pending}'
        ELSE '${Status.Send}'
      END                                                                                     AS [status],
      COUNT(CASE WHEN c.[contractStatus] = '${Status.Pending}' THEN 1 END)                    AS [totalPending],
      COUNT(CASE WHEN c.[contractStatus] = '${Status.Send}' THEN 1 END)                       AS [totalSend],
      COUNT(CASE WHEN c.[contractStatus] = '${Status.Error}' THEN 1 END)                      AS [totalError]
    FROM 
      vudec_lot                                                                               AS [l]
    INNER JOIN 
      vudec_lot_contract                                                                      AS [lc] 
      ON lc.[lotId] = l.[id] 
       AND lc.[deletedAt] IS NULL
    CROSS APPLY (
      SELECT 
        contract.[id]                                                                         AS [contractId],
        CASE 
          WHEN COUNT(CASE WHEN m.[status] = '${MovementStatus.Error}' THEN 1 END) > 0 
            THEN '${Status.Error}'
          WHEN COUNT(CASE WHEN m.[status] = '${MovementStatus.Unsent}' THEN 1 END) > 0 
            THEN '${Status.Pending}'
          ELSE '${MovementStatus.Send}'
        END                                                                                   AS [contractStatus]
      FROM 
        vudec_contract                                                                        AS [contract]
      INNER JOIN 
        ${V_VUDEC_MOVEMENTS}                                                                  AS [m] 
        ON m.[contractId] = contract.[id] 
      WHERE 
        m.[lotId] = l.[id]
      AND 
        contract.[id] = lc.[contractId]
      AND 
        contract.[deletedAt] IS NULL
      GROUP BY 
        contract.[id]
    )                                                                                         AS [c]
    INNER JOIN 
      vudec_organization_product                                                              AS [vop] 
      ON vop.[id] = l.[organizationProductId] 
      AND vop.[deletedAt] IS NULL
    INNER JOIN 
      vudec_product                                                                           AS [p] 
      ON p.[id] = vop.[productId] 
      AND p.[deletedAt] IS NULL
    INNER JOIN 
      vudec_organization                                                                      AS [o] 
      ON o.[id] = vop.[organizationId] 
      AND o.[deletedAt] IS NULL
    WHERE l.[deletedAt] IS NULL
    GROUP BY 
        l.[id], 
        l.[consecutive], 
        l.[createdAt], 
        l.[name], 
        o.[id], 
        o.[organizationParentId],
        p.[id];
    `,
};

export default V_VUDEC_LOTS_QUERY;
