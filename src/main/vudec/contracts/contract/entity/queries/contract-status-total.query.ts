import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { V_VUDEC_LOT_CONTRACTS } from '../../../../lots/lot/entity/queries/lot-contracts.view.query';
import { MovementStatus } from '../../../../movement/enums/movement-status.enum';
import { Status } from '../../enum/contract-status.enum';

export const V_CONTRACTS_STATUS_TOTAL: string = 'V_CONTRACTS_STATUS_TOTAL';

const V_CONTRACTS_STATUS_TOTAL_QUERY: ViewEntityOptions = {
  name: V_CONTRACTS_STATUS_TOTAL,
  dependsOn: [V_VUDEC_LOT_CONTRACTS],
  synchronize: false,
  expression: `
  WITH CTE_Lot_contracts AS (
    SELECT 
      id                                                                                                      AS [contractId],
      taxpayerId,
      organizationId,
      CASE 
        WHEN SUM(CASE WHEN status = '${Status.Error}' THEN 1 ELSE 0 END) > 0 THEN '${Status.Error}'
        WHEN SUM(CASE WHEN status = '${Status.Pending}' THEN 1 ELSE 0 END) > 0 THEN '${Status.Pending}'
        ELSE '${MovementStatus.Send}'
      END                                                                                                     AS [status]
    FROM 
      ${V_VUDEC_LOT_CONTRACTS}
    GROUP BY 
      id,
      taxpayerId,
      organizationId
  )
  SELECT 
    taxpayerId                                                                                                AS [id],
    organizationId                                                                                            AS [organizationId],
    SUM(CASE WHEN status = '${Status.Error}' THEN 1 ELSE 0 END)                                               AS [totalError],
    SUM(CASE WHEN status = '${Status.Pending}' THEN 1 ELSE 0 END)                                             AS [totalPending],
    SUM(CASE WHEN status = '${MovementStatus.Send}' THEN 1 ELSE 0 END)                                        AS [totalSend]
  FROM 
    CTE_Lot_contracts
  GROUP BY 
    taxpayerId,
    organizationId;
`,
};

export default V_CONTRACTS_STATUS_TOTAL_QUERY;
