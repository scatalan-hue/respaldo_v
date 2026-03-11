import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { V_VUDEC_MOVEMENTS } from '../../../movement/entity/queries/movement.view.query';

export const V_VUDEC_TAXPAYERS: string = 'V_VUDEC_TAXPAYERS';

const V_VUDEC_TAXPAYERS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_TAXPAYERS,
  dependsOn: [V_VUDEC_MOVEMENTS],
  synchronize: false,
  expression: `
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
      ${V_VUDEC_MOVEMENTS}                                                                        AS [m]
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
`,
};

export default V_VUDEC_TAXPAYERS_QUERY;
