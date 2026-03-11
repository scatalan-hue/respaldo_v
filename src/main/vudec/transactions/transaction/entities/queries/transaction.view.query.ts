import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';
import { Status } from '../../../../contracts/contract/enum/contract-status.enum';
import { MovementStatus } from '../../../../movement/enums/movement-status.enum';
import { V_VUDEC_MOVEMENTS } from '../../../../movement/entity/queries/movement.view.query';

export const V_VUDEC_TRANSACTIONS: string = 'V_VUDEC_TRANSACTIONS';

const V_VUDEC_TRANSACTIONS_QUERY: ViewEntityOptions = {
  name: V_VUDEC_TRANSACTIONS,
  synchronize: false,
  expression: `
    SELECT
        trn.id	AS id
        ,prd.id AS productId
		,prd.name AS productName
        ,('/attachment/files/static/' + CAST(fil.id AS varchar(36)) + '.' + fil.fileExtension) AS productUrl
        ,trn.createdAt AS receptionDate
        ,trn.documentPrincipal AS document
        ,trn.contractNumber AS contractNumber
        ,txp.id AS taxpayerId
        ,txp.taxpayerNumber + ' - ' + 
            LTRIM(RTRIM(
                CASE 
                    WHEN txp.lastName IS NOT NULL AND txp.lastName <> '' THEN
                        REPLACE(
                            LTRIM(RTRIM(
                                CONCAT(
                                    ISNULL(txp.name, ''), ' ',
                                    ISNULL(txp.middleName, ''), ' ',
                                    ISNULL(txp.lastName, ''), ' ',
                                    ISNULL(txp.secondSurname, '')
                                )
                            )),
                            '  ', ' '
                        )
                    ELSE 
                        LTRIM(RTRIM(ISNULL(txp.name, '')))
                END
            )) AS taxpayer
        ,'$' + FORMAT(
			trn.contractValue,
            'N2',
            'es-CO'
        ) AS contractValue
        ,trn.status
        ,trn.description
        ,trn.action AS actionType
        ,trn.message AS errorMessage
        ,'$' + FORMAT(
            (
                SELECT 
                    SUM(TRY_CAST(JSON_VALUE(m.value, '$.liquidatedValue') AS decimal(18,2)))
                FROM OPENJSON(trn.data, '$.movementsInput') AS m
                WHERE JSON_VALUE(m.value, '$.type') = 'ADHESION'
            ),
            'N2',
            'es-CO'
        ) AS totalStampValue
    FROM
        vudec_transaction AS trn
    INNER JOIN 
        vudec_organization_product AS orp
        ON orp.id = trn.organizationProductId
    INNER JOIN 
        vudec_product AS prd
        ON orp.productId = prd.id
    INNER JOIN 
        grl_file AS fil
        ON fil.id = prd.logoId
    INNER JOIN
        vudec_taxpayer AS txp
        ON txp.id = trn.taxpayerId;
    `,
};

export default V_VUDEC_TRANSACTIONS_QUERY;
