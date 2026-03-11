import { Body, Controller, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { ExternalApiKey } from '../../decorators/external-api-key.decorator';
import { CreateTokenInput } from '../dto/inputs/createToken.input';
import { AuthService } from '../service/auth.service';
import { CreateTokenResponse } from '../types/auth-response.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('getTokenAuth')
  @ApiHeader({
    name: 'api-key',
  })
  @ExternalApiKey()
  async getTokenAuth(@CurrentContext() context: IContext, @Body() input: CreateTokenInput) {
    const result = await this.authService.getTokenAuth(context, input);
    return { token: result } as CreateTokenResponse;
  }
}
