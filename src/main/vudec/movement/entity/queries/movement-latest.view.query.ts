import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';

export const V_VUDEC_MOVEMENTS_LATEST: string = 'V_VUDEC_MOVEMENTS_LATEST';

const V_VUDEC_MOVEMENTS_LATEST_QUERY: ViewEntityOptions = {
  name: V_VUDEC_MOVEMENTS_LATEST,
  synchronize: false,
  expression: `
    SELECT
      m.[id]
      ,m.[createdAt]
      ,m.[updatedAt]
      ,m.[deletedAt]
      ,m.[expenditureNumber]
      ,m.[movId]
      ,m.[liquidatedValue]
      ,m.[paidValue]
      ,m.[type]
      ,m.[date]
      ,m.[value]
      ,m.[status]
      ,m.[isRevert]
      ,m.[contractId]
      ,m.[stampId]
      ,m.[lotId]
      ,m.[description]
      ,m.[message]
      ,m.[associatedMovement]
      ,m.[organizationProductId]
      ,m.[typeValue]
      ,m.[documentValue]
      ,m.[percentageValue]
      ,m.[fixedValue]
      ,m.[documentId]
      ,m.[taxBasisValue]
      ,m.[movementRevertId]
      ,m.[group]
      ,m.[taxpayerId]
      ,m.[transactionId]
      ,s.[stampNumber]                     AS [stampNumber]
      ,CAST(m.movId AS NVARCHAR)           AS [movId_nvarchar]
      ,CASE
        WHEN ROW_NUMBER() OVER (
          PARTITION BY m.movId, m.contractId
          ORDER BY m.createdAt DESC
        ) = 1 THEN 1 -- TRUE
        ELSE 0 -- FALSE
      END AS isLatest
    FROM vudec_movement m
    INNER JOIN 
      [vudec_stamp]             AS [s]
      ON m.[stampId] = s.[id]
    WHERE m.deletedAt IS NULL;
`,
};

export default V_VUDEC_MOVEMENTS_LATEST_QUERY;
