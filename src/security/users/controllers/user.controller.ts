import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { AnyUser } from '../../auth/decorators/user-types.decorator';
import { SecurityAuthGuard } from '../../auth/guards/auth.guard';
import { FindUserViewArgs } from '../dto/args/find-user-view.args';
import { UserViewService } from '../services/views/user.view.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
@UseGuards(SecurityAuthGuard)
export class UserController {
  constructor(private readonly userViewService: UserViewService) {}

  @Post('user/reportUsers')
  @ApiOperation({ summary: 'Descargar archivo Excel' })
  @ApiHeader({
    name: 'organization-id',
    required: true,
    description: 'ID de la organización',
  })
  @AnyUser()
  @ApiBody({ type: FindUserViewArgs, required: true, isArray: false })
  async report(@CurrentContext() context: IContext, @Body() findUserViewArgs: FindUserViewArgs, @Res() res: Response) {
    await this.userViewService.usersReport(context, findUserViewArgs, res);
  }
}
