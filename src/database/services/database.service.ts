import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class DatabaseService {
  private static transactionalQueryRunner: QueryRunner;

  public static async Transaction(repo: Repository<any>, method): Promise<void> {
    if (!DatabaseService.transactionalQueryRunner?.isReleased) {
      if (repo.queryRunner) {
        DatabaseService.transactionalQueryRunner = repo.queryRunner;
      } else {
        DatabaseService.transactionalQueryRunner = repo.manager.connection.createQueryRunner();
      }

      await DatabaseService.transactionalQueryRunner.connect();
      await DatabaseService.transactionalQueryRunner.startTransaction();
      try {
        await method.apply(this);
        await DatabaseService.transactionalQueryRunner.commitTransaction();
      } catch (error) {
        await DatabaseService.transactionalQueryRunner.rollbackTransaction();
        throw error;
      } finally {
        await DatabaseService.transactionalQueryRunner.release();
      }
    } else {
      await method.apply(this);
    }
  }
}
