import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { GetErrorDBService } from '../services/generate-error-template/generate-error-transaction.service';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';
import { SecurityAuthGuard } from 'src/security/auth/guards/auth.guard';
import { ObtainErrorDbDto } from '../dto/response/response.dto';
import { ObtainErrorDto } from '../dto/model/error.dto';
import { Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

@Resolver(() => ObtainErrorDto)
export class ObtainErrorResolver {
    constructor(readonly getErrorDBService: GetErrorDBService) { }

    @Mutation(() => ObtainErrorDbDto, { name: 'ObtainErrorsFromTableTransaction' })
    @UseGuards(SecurityAuthGuard)
    @AnyUser()
    async generateErrorExcel(@CurrentContext() context: IContext): Promise<ObtainErrorDbDto> {
        return await this.getErrorDBService.generateErrorExcel(context);
    }


}