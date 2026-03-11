import { ViewEntityOptions } from 'typeorm/decorator/options/ViewEntityOptions';

export const V_VUDEC_TRANSACTION_HISTORY: string = 'V_VUDEC_TRANSACTION_HISTORY';

const V_VUDEC_TRANSACTION_HISTORY_QUERY: ViewEntityOptions = {
  name: V_VUDEC_TRANSACTION_HISTORY,
  synchronize: false,
  expression: `
	SELECT
        trh.[id]
        ,trh.[createdAt] AS [receptionDate]
        ,trh.[sequence]
        ,trh.[taxpayerId]
		,'$' + FORMAT(
			trh.contractValue,
            'N2',
            'es-CO'
        ) AS [contractValue]
		,trh.[contractNumber]
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
        ,trh.[action]
        ,trh.[message]
        ,trh.[data]
        ,tall.id AS [transactionId]
    FROM
        vudec_transaction_history AS trh
    INNER JOIN
        vudec_transaction AS trn
        ON trn.id = trh.transactionId
    INNER JOIN
        vudec_taxpayer AS txp
        ON txp.id = trh.taxpayerId
    INNER JOIN
        vudec_transaction AS tall
        ON (
            tall.id = trh.transactionId
            OR 
            tall.parentId = trh.transactionId
        );
    `,
};

export default V_VUDEC_TRANSACTION_HISTORY_QUERY;
