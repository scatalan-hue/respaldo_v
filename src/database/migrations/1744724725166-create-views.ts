import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateViews1744724725166 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_USERS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_MOVEMENTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_LOT_CONTRACTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_CONTRACTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_MOVEMENTS_LATEST";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_MOVEMENT_PAYMENT";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_TAXPAYER_CONTRACTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_TAXPAYERS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_LOTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_ORGANIZATIONS";`);
 
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_USERS" AS 
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
  `);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_MOVEMENTS" AS 
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
	  op.[organizationId]																			    AS [organizationId],
	  op.[productId]																			        AS [productId],
	  vpr.[name]																			            AS [productName],
      m.[contractId]                                                                                    AS [contractId],
      COALESCE(NULLIF(m.[expenditureNumber], ''), c.[consecutive])                                      AS [expenditureNumber],
      m.[createdAt]                                                                                     AS [createdAt],
      m.[movId]								                                                            AS [movId],
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
    [isRevert]
  FROM 
    cte
  WHERE 
    rn = 1;
  `);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_LOT_CONTRACTS" AS 
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
    mov.[status]                                                                  AS [status] 
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
        COUNT(CASE WHEN mov.[type] = 'APPLY' THEN mov.[id] END)   AS [movementsCount], 
        SUM(mov.[liquidatedValue])                                                AS [liquidatedTotal], 
        CASE WHEN SUM(
          CASE WHEN mov.[status] = 'ERROR' THEN 1 ELSE 0 END
        ) > 0 THEN 'ERROR' WHEN SUM(
          CASE WHEN mov.[status] = 'UNSENT' THEN 1 ELSE 0 END
        ) > 0 THEN 'PENDING' ELSE 'SEND' END          AS [status] 
      FROM 
        V_VUDEC_MOVEMENTS                                                      AS [mov] 
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
  `);
        await queryRunner.query(`CREATE VIEW "dbo"."V_CONTRACTS" AS 
  WITH CTE_Lot_contracts AS (
    SELECT
      id                                                                  AS [contractId],
      SUM(liquidatedTotal)                                                AS [liquidatedTotal],
      SUM(movementsCount)                                                 AS [movementsCount],
      CASE WHEN SUM(
        CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END
      ) > 0 THEN 'ERROR' WHEN SUM(
        CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END
      ) > 0 THEN 'PENDING' ELSE 'SEND' 
      END                                                                 AS [status]
    FROM
      V_VUDEC_LOT_CONTRACTS 
    GROUP BY
      id
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
`);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_MOVEMENTS_LATEST" AS 
  SELECT
    m.*,
    s.[stampNumber]                     AS [stampNumber],
    CAST(m.movId AS NVARCHAR)           AS [movId_nvarchar],
    CASE
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
`);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_MOVEMENT_PAYMENT" AS 
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
      m.[type] <> 'REGISTER'
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
`);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_TAXPAYER_CONTRACTS" AS 
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
  `);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_TAXPAYERS" AS 
  WITH CTE_Taxpayer_organization AS (
    SELECT 
      t.id                                                                                        AS [id],
      vot.organizationId                                                                          AS [organizationId],
      COUNT(DISTINCT c.id)                                                                        AS [contractCount],
      COALESCE(SUM(m.liquidatedValue), 0)                                                         AS [liquidatedTotal],
      COALESCE(SUM(m.paidValue), 0)                                                               AS [paidTotal],
      (
          COALESCE(SUM(m.liquidatedValue), 0)
        - COALESCE(SUM(m.paidValue), 0)
      )                                                                                           AS [totalPayable]
    FROM 
      vudec_taxpayer                                                                              AS [t]
    INNER JOIN 
      vudec_organization_taxpayer                                                                 AS [vot]
      ON vot.taxpayerId = t.id
      AND vot.deletedAt IS NULL
    INNER JOIN 
      vudec_contract                                                                              AS [c]
      ON c.taxpayerId = t.id
      AND c.deletedAt IS NULL
    INNER JOIN 
      vudec_organization_product                                                                  AS [op]
      ON op.id = c.organizationProductId
      AND op.organizationId = vot.organizationId
    INNER JOIN 
      V_VUDEC_MOVEMENTS                                                                        AS [m]
      ON m.contractId = c.id
    GROUP BY
        t.id,
        vot.organizationId
  )
  SELECT
    txo.id,
    tx.taxpayerNumber,
    tx.phone,
    tx.email,
    tx.taxpayerNumberType,
    txo.organizationId,
    txo.contractCount,
    txo.liquidatedTotal,
    txo.paidTotal,
    txo.totalPayable,
    RTRIM(LTRIM(tx.[name])) + 
    COALESCE(NULLIF(' ' + RTRIM(LTRIM(tx.[lastName])), ' '), '')                                  AS [name]
  FROM 
    CTE_Taxpayer_organization AS [txo]
  INNER JOIN 
    vudec_taxpayer AS [tx]
    ON tx.id = txo.id;
`);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_LOTS" AS 
    SELECT 
      l.[id]                                                                                  AS [id],
      l.[consecutive]                                                                         AS [consecutive],
      l.[createdAt]                                                                           AS [createdAt],
      l.[name]                                                                                AS [name],
      o.[id]                                                                                  AS [organizationId],
      p.[id]                                                                                  AS [productId],
      COUNT(DISTINCT lc.[contractId])                                                         AS [total],
      CASE 
        WHEN COUNT(CASE WHEN c.[contractStatus] = 'ERROR' THEN 1 END) > 0 
            THEN 'ERROR'
        WHEN COUNT(CASE WHEN c.[contractStatus] = 'PENDING' THEN 1 END) > 0 
            THEN 'PENDING'
        ELSE 'SEND'
      END                                                                                     AS [status],
      COUNT(CASE WHEN c.[contractStatus] = 'PENDING' THEN 1 END)                    AS [totalPending],
      COUNT(CASE WHEN c.[contractStatus] = 'SEND' THEN 1 END)                       AS [totalSend],
      COUNT(CASE WHEN c.[contractStatus] = 'ERROR' THEN 1 END)                      AS [totalError]
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
          WHEN COUNT(CASE WHEN m.[status] = 'ERROR' THEN 1 END) > 0 
            THEN 'ERROR'
          WHEN COUNT(CASE WHEN m.[status] = 'UNSENT' THEN 1 END) > 0 
            THEN 'PENDING'
          ELSE 'SEND'
        END                                                                                   AS [contractStatus]
      FROM 
        vudec_contract                                                                        AS [contract]
      INNER JOIN 
        V_VUDEC_MOVEMENTS                                                                  AS [m] 
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
        p.[id];
    `);
        await queryRunner.query(`CREATE VIEW "dbo"."V_VUDEC_ORGANIZATIONS" AS 
   SELECT 
  o.[id] AS [id],
  o.[name] AS [name],
  o.[createdAt] AS [createdAt],
  o.[nit] AS [nit],
  o.[ordenType] AS [orderType],
  d.[name] AS [department],
  c.[name] AS [city],
  op.[name] AS [organizationParent],
  CASE 
    WHEN f.id IS NOT NULL AND f.fileExtension IS NOT NULL THEN 
      CONCAT('/attachment/files/static/', f.id, '.', f.fileExtension)
    ELSE 
      NULL
  END AS [logoUrl],
  (
    SELECT COUNT(m.id)
    FROM V_VUDEC_MOVEMENTS AS m
    WHERE m.[organizationId] = o.[id]
      AND m.[isRevert] = 0
      AND m.[type] = 'APPLY'
  ) AS [movementsPaidTotal] -- Subconsulta para contar los movimientos
FROM 
  vudec_organization AS [o]
LEFT JOIN 
  grl_department AS [d] ON o.[departmentId] = d.[id]
LEFT JOIN 
  grl_city AS [c] ON o.[cityId] = c.[id]
LEFT JOIN 
  vudec_organization AS [op] ON o.[organizationParentId] = op.[id]
LEFT JOIN 
  grl_file AS [f] ON o.[logoId] = f.[id];
  
  `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_USERS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_MOVEMENTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_LOT_CONTRACTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_CONTRACTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_MOVEMENTS_LATEST";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_MOVEMENT_PAYMENT";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_TAXPAYER_CONTRACTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_TAXPAYERS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_LOTS";`);
        await queryRunner.query(`DROP VIEW IF EXISTS "V_VUDEC_ORGANIZATIONS";`);

    }

}
