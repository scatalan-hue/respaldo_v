import dotenv from 'dotenv';
import { ViewColumn, ViewEntity } from 'typeorm';
import { MovementStatus } from '../../enums/movement-status.enum';
import { MovementTypeValue } from '../../enums/movement-type-value.enum copy';
import { TypeMovement } from '../../enums/movement-type.enum';
import V_VUDEC_MOVEMENTS_LATEST_QUERY from '../queries/movement-latest.view.query';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_MOVEMENTS_LATEST_QUERY)
export class MovementLatestView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  description: string;

  @ViewColumn()
  contractId: string;

  @ViewColumn()
  lotId: string;

  @ViewColumn()
  expenditureNumber: string;

  @ViewColumn()
  liquidatedValue: number;

  @ViewColumn()
  paidValue: number;

  @ViewColumn()
  stampId: string;

  @ViewColumn()
  associatedMovement: string;

  @ViewColumn()
  type: TypeMovement;

  @ViewColumn()
  date: Date;

  @ViewColumn()
  value: number;

  @ViewColumn()
  status: MovementStatus;

  @ViewColumn()
  isRevert: boolean;

  @ViewColumn()
  movId: string;

  @ViewColumn()
  taxpayerId: string;

  @ViewColumn()
  stampNumber: string;

  @ViewColumn({
    transformer: {
      from: (value: number) => Boolean(value),
      to: (value: boolean) => value ? 1 : 0
    }
  })
  isLatest: boolean;

  @ViewColumn()
  documentValue: number;

  @ViewColumn()
  typeValue: MovementTypeValue;

  @ViewColumn()
  percentageValue: number;

  @ViewColumn()
  fixedValue: number;

  @ViewColumn()
  taxBasisValue: number;

  @ViewColumn()
  transactionId: string;
}
