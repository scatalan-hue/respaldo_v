import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';

export const V_VUDEC_ORGANIZATIONS: string = 'V_VUDEC_ORGANIZATIONS';

export const V_VUDEC_ORGANIZATIONS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_ORGANIZATIONS,
  synchronize: false,
  expression: `
   SELECT 
  o.[id] AS [id],
  o.[name] AS [name],
  o.[createdAt] AS [createdAt],
  o.[nit] AS [nit],
  o.[email] AS [email],
  o.[phone] AS [phone],
  o.[token] AS [token],
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
  
  `,
};

export default V_VUDEC_ORGANIZATIONS_QUERY;
