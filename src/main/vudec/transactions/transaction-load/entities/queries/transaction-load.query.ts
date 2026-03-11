// TODO Generación del Excel
// Con los datos obtenidos de la query, el siguiente paso es llenar la plantilla excel guardada en el palicativo con los registros obtenidos en el excel.

export const GET_FAILED_TRANSACTIONS: string =
	`
SELECT
	t.id AS item,
    t.contractNumber,
    tp.taxpayerNumber,
    t.validation,
    t.message
		FROM vudec_transaction t
			JOIN vudec_taxpayer tp ON t.taxpayerId  = tp.id 
				WHERE t.status  = 'ERROR'
					ORDER BY t.id
	`

//FIXME: EL STATUS DEBE SER (ERROR) PARA LAS PRUEBAS USARÉ (PENDING)