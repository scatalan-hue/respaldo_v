import { Pagination } from '../classes/inputs/pagination.input';

export interface IFindArgs {
  pagination?: Pagination;

  where?: any;

  orderBy?: any[];
}
