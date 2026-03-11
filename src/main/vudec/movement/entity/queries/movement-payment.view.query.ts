import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { V_VUDEC_MOVEMENTS } from './movement.view.query';
import { TypeMovement } from '../../enums/movement-type.enum';

export const V_VUDEC_MOVEMENT_PAYMENT: string = 'V_VUDEC_MOVEMENT_PAYMENT';

const V_VUDEC_MOVEMENT_PAYMENT_QUERY: ViewEntityOptions = {
  name: V_VUDEC_MOVEMENT_PAYMENT,
  dependsOn: [V_VUDEC_MOVEMENTS],
  synchronize: false,
  expression: `
  WITH grouped_movements AS (
    SELECT
      m.[contractId]                                                                                        AS [id],
      m.[expenditureNumber]                                                                                 AS [expenditureNumber],
      m.[documentUrl]                                                                                       AS [documentUrl],
      SUM(m.[liquidatedValue])                                                                              AS [totalLiquidatedValue],
      SUM(m.[paidValue])                                                                                    AS [totalPaidValue],
      MIN(m.[movementDate])                                                                                 AS [date],
      MIN(m.[createdAt])                                                                                    AS [createdAt],
      CASE 
        WHEN MIN(m.[movementDate]) = MIN(MIN(m.[movementDate])) OVER (PARTITION BY m.[contractId]) 
        THEN CAST(1 AS BIT) 
        ELSE CAST(0 AS BIT) 
      END                                                                                                   AS [isOldest]
    FROM 
      V_VUDEC_MOVEMENTS                                                                                     AS [m]
    WHERE 
      m.[type] <> '${TypeMovement.Register}'
    GROUP BY
      m.[expenditureNumber],
      m.[contractId],
      m.[documentUrl]
  )
  SELECT
    gm.id,
    gm.expenditureNumber,
    gm.totalLiquidatedValue,
    gm.totalPaidValue,
	gm.[createdAt],
    gm.date,
    gm.isOldest,
    vc.[consecutive]                                                                                       AS [contractConsecutive],
    vc.[taxpayerId],
    vop.[organizationId],
    gm.[documentUrl]                                                                                       AS [documentUrl]
  FROM 
    grouped_movements                                                                                      AS [gm]
  INNER JOIN 
    vudec_contract                                                                                         AS [vc]
    ON gm.[id] = vc.[id] 
    AND vc.[deletedAt] IS NULL
  INNER JOIN 
    vudec_organization_product                                                                             AS [vop] 
    ON vop.[id] = vc.[organizationProductId]  
    AND vop.[deletedAt] IS NULL;
`,
};

export default V_VUDEC_MOVEMENT_PAYMENT_QUERY;
