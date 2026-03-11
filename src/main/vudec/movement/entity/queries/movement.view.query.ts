import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';

export const V_VUDEC_MOVEMENTS: string = 'V_VUDEC_MOVEMENTS';

const V_VUDEC_MOVEMENTS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_MOVEMENTS,
  synchronize: false,
  expression: `
  WITH cte AS (
    SELECT
      m.[id]                                                                                            AS [id],
      s.[name]                                                                                          AS [stampName],
      m.[type]                                                                                          AS [type],
      m.[typeValue]                                                                                     AS [typeValue],
      m.[documentValue]                                                                                 AS [documentValue],
      m.[taxBasisValue]                                                                                 AS [taxBasisValue],
      m.[percentageValue]                                                                               AS [percentageValue],
      m.[fixedValue]                                                                                    AS [fixedValue],
      m.[status]                                                                                        AS [status],
      m.[date]                                                                                          AS [movementDate],
      m.[liquidatedValue]                                                                               AS [liquidatedValue],
      m.[paidValue]                                                                                     AS [paidValue],
      m.[value]                                                                                         AS [value],
      m.[lotId]                                                                                         AS [lotId],
      m.[transactionId]                                                                                 AS [transactionId],
      m.[description]                                                                                   AS [description],
	    m.[message]														                                            								AS [message],
      op.[organizationId]																			                                          AS [organizationId],
	    op.[productId]																			                                              AS [productId],
	    vpr.[name]																			                                                  AS [productName],
      m.[contractId]                                                                                    AS [contractId],
      COALESCE(NULLIF(m.[expenditureNumber], ''), c.[consecutive])                                      AS [expenditureNumber],
      m.[createdAt]                                                                                     AS [createdAt],
      m.[movId]								                                                                          AS [movId],
      s.[id]                                                                                            AS [stampId],
      m.[isRevert]                                                                                      AS [isRevert],
      CASE WHEN fil.[id] IS NOT NULL
      AND fil.[fileExtension] IS NOT NULL THEN CONCAT(
      '/attachment/files/static/', fil.[id],
      '.', fil.[fileExtension]
       ) ELSE NULL END                                                                                  AS [logoProductUrl],
      CASE WHEN docFile.[id] IS NOT NULL
      AND docFile.[fileExtension] IS NOT NULL THEN CONCAT(
      '/attachment/files/static/', docFile.[id],
      '.', docFile.[fileExtension]
       ) ELSE NULL END                                                                                  AS [documentUrl],
      ROW_NUMBER() OVER (
        PARTITION BY 
          s.[name],
          m.[type],
          m.[movId],
          m.[contractId],
          COALESCE(NULLIF(m.[expenditureNumber], ''), c.[consecutive]),
          s.[id]
        ORDER BY 
          m.[createdAt] DESC  
      )                                                                                                 AS [rn]
    FROM 
      vudec_movement                                                                                    AS [m]
    INNER JOIN 
      vudec_stamp                                                                                       AS [s]
      ON m.[stampId] = s.[id]
    INNER JOIN 
      vudec_contract                                                                                    AS [c]
      ON m.[contractId] = c.[id]
	INNER JOIN 
      vudec_lot																							                                            AS [l]
      ON m.[lotId] = l.[id]
	LEFT JOIN 
      vudec_organization_product                                                                        AS [op]
      ON m.[organizationProductId] = op.[id]
    LEFT JOIN 
      vudec_product                                                                                     AS [vpr]
      ON op.[productId] = vpr.[id]
    LEFT JOIN 
        grl_file                                                                                        AS [fil]
        ON vpr.[logoId] = fil.[id]
        AND fil.[deletedAt] IS NULL
    LEFT JOIN 
        grl_file                                                                                        AS [docFile]
        ON m.[documentId] = docFile.[id]
        AND docFile.[deletedAt] IS NULL
    WHERE 
      m.deletedAt IS NULL
  )
  SELECT
    [id],
    [stampName],
    [type],
    [status],
    [movementDate],
    [liquidatedValue],
    [paidValue],
    [value],
    [lotId],
    [typeValue],
    [documentValue],
    [taxBasisValue],
    [percentageValue],
    [fixedValue],
	[organizationId],
	[productId],
	[logoProductUrl],
	[productName],
    [documentUrl],
    [contractId],
    [expenditureNumber],
    [createdAt],
    [stampId],
    [description],
    [isRevert],
	  [message]
  FROM 
    cte
  WHERE 
    rn = 1;
  `,
};

export default V_VUDEC_MOVEMENTS_QUERY;
