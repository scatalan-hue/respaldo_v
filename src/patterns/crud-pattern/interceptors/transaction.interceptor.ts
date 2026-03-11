import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Connection } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly connection: Connection) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return next.handle().pipe(
      tap(async () => {
        await queryRunner.commitTransaction();
      }),
      catchError(async (error) => {
        try {
          // Verificamos si el queryRunner no ha sido liberado antes de hacer rollback
          if (!queryRunner.isReleased) {
            await queryRunner.rollbackTransaction();

            throw error;
          }
        } catch (rollbackError) {
          // Manejamos cualquier error durante el rollback
          console.error('Error durante el rollback:', rollbackError);
          throw rollbackError;
        }

        throw error;
      }),
      tap({
        finalize: async () => {
          try {
            // Verificamos si el queryRunner no ha sido l iberado antes de liberarlo
            if (!queryRunner.isReleased) {
              await queryRunner.release();
            }
          } catch (releaseError) {
            console.error('Error al liberar el queryRunner:', releaseError);

            throw releaseError;
          }
        },
      }),
    );
  }
}
