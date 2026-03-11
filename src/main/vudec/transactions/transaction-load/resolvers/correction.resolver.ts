import { TransactionCorrectionExcelService } from '../services/edit-transaction/correction-transaction-excel.service';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { ResponseErrorUpdatingTransaction } from '../dto/response/response.dto';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';
import { SecurityAuthGuard } from 'src/security/auth/guards/auth.guard';
import { FilesService } from 'src/general/files/services/files.service';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class TransactionCorrectionResolver {
    constructor(
        private readonly correctionService: TransactionCorrectionExcelService,
        private readonly filesService: FilesService,
    ) { }

    @Mutation(() => ResponseErrorUpdatingTransaction, { name: 'processCorrectionTransactionExcel' })
    @UseGuards(SecurityAuthGuard)
    @AnyUser()
    async processCorrectionTransactionExcel(
        @Args('fileId', { type: () => String }) fileId: string,
        @CurrentContext() context: IContext,): Promise<ResponseErrorUpdatingTransaction> {
        const fileData = await this.filesService.findBuffer(context, fileId, true);
        const buffer = fileData.buffer;
        const result = await this.correctionService.processCorrectionExcel(context, buffer, fileId);

        if (result.errorFileId) {
            return {
                fileErrorId: result.errorFileId,
                message: `Se encontraron errores. Descargue el archivo para detalles.`,
            };
        }

        return {
            fileErrorId: null,
            message: `Actualizados ${result.updated}, errores ${result.errors.length}`,
        };
    }
}