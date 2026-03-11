import { Repository, LessThan } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { ValidationResponse } from '../enum/validation-response.enum';

@Injectable()
export class TransactionRecoveryService {
    private readonly logger = new Logger(TransactionRecoveryService.name);

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {}

    @Cron(CronExpression.EVERY_5_MINUTES)
    async recoverStuckTransactions() {
        try {
            const stuckTransactions = await this.transactionRepository.find({
                where: {
                    status: TransactionStatus.IN_PROCESS,
                    updatedAt: LessThan(new Date(Date.now() - 10 * 60 * 1000)) // 10 minutos atrás
                }
            });

            if (stuckTransactions.length > 0) {
                for (const transaction of stuckTransactions) {
                    await this.transactionRepository.update(transaction.id, {
                        status: TransactionStatus.ERROR,
                        message: 'Transacción recuperada automáticamente - proceso interrumpido',
                        validation: ValidationResponse.ERROR
                    });
                }
            }
        } catch (error) {
            this.logger.error('Error en recuperación de transacciones:', error);
        }
    }

    async forceRecoverTransaction(transactionId: string): Promise<void> {
        try {
            const transaction = await this.transactionRepository.findOne({
                where: { id: transactionId, status: TransactionStatus.IN_PROCESS }
            });

            if (transaction) {
                await this.transactionRepository.update(transactionId, {
                    status: TransactionStatus.ERROR,
                    message: 'Transacción recuperada manualmente',
                    validation: ValidationResponse.ERROR
                });
            }
        } catch (error) {
            this.logger.error(`Error recuperando transacción ${transactionId}:`, error);
        }
    }

    async getStuckTransactionsCount(): Promise<number> {
        try {
            return await this.transactionRepository.count({
                where: {
                    status: TransactionStatus.IN_PROCESS,
                    updatedAt: LessThan(new Date(Date.now() - 10 * 60 * 1000))
                }
            });
        } catch (error) {
            this.logger.error('Error obteniendo conteo de transacciones bloqueadas:', error);
            return 0;
        }
    }
}