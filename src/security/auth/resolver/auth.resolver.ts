import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { ExternalApiKey } from '../../decorators/external-api-key.decorator';
import { UserAdmin } from '../../decorators/user-admin.decorator';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { AdminOnly } from '../decorators/user-types.decorator';
import { SignInInput as SigninInput, SignupEmailInput } from '../dto/inputs';
import { ApprovalTokenInput } from '../dto/inputs/approval-token.input';
import { CreateTokenInput } from '../dto/inputs/createToken.input';
import { RevokeCredentialInput } from '../dto/inputs/revoke-credential.input';
import { SendDoubleVerificationInput } from '../dto/inputs/send-double-verification.input';
import { SigninAdminInput } from '../dto/inputs/signin-admin.input';
import { ValidateTokenInput } from '../dto/inputs/validate-token.input';
import { SecurityAuthGuard } from '../guards/auth.guard';
import { AuthService } from '../service/auth.service';
import { AuthResponse, CreateTokenResponse } from '../types/auth-response.type';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signUp' })
  async signUp(@Args('signupInput') signupInput: SignupEmailInput): Promise<AuthResponse> {
    return this.authService.signUp({ user: undefined }, signupInput);
  }

  @Mutation(() => AuthResponse, { name: 'resendCode' })
  async resendCode(@Args('email') email: string): Promise<AuthResponse> {
    return this.authService.ResendCode({ user: undefined }, email);
  }

  @Mutation(() => AuthResponse, { name: 'signIn' })
  async signIn(@Args('signinInput') signinInput: SigninInput): Promise<AuthResponse> {
    return this.authService.signIn({ user: undefined }, signinInput);
  }

  @Mutation(() => AuthResponse, { name: 'signInAdmin' })
  @UserAdmin()
  async signInAdmin(@Args('signInAdminInput') signInAdminInput: SigninAdminInput, @Context() context: any): Promise<AuthResponse> {
    return this.authService.signInUserAdmin(context.req.user, signInAdminInput);
  }

  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(SecurityAuthGuard)
  revalidate(@CurrentUser() user: User): AuthResponse {
    return this.authService.revalidateToken(user);
  }

  @Query(() => User, { name: 'validateUserToken' })
  validateUserToken(@Args('validateTokenInput') validateTokenInput: ValidateTokenInput): Promise<User> {
    return this.authService.validateUserToken(validateTokenInput);
  }

  @Query(() => AuthResponse, { name: 'approvalJwt' })
  approvalJwt(@Args('approvalTokenInput') approvalTokenInput: ApprovalTokenInput): Promise<AuthResponse> {
    return this.authService.approvalJwt(approvalTokenInput);
  }

  @Mutation(() => String, { name: 'sendCodeDoubleVerification' })
  async sendCodeDoubleVerification(
    @Args('sendDoubleVerificationInput')
    sendDoubleVerificationInput: SendDoubleVerificationInput,
  ): Promise<string> {
    return this.authService.sendCodeDoubleVerification(sendDoubleVerificationInput);
  }

  @Mutation(() => CreateTokenResponse, { name: 'createAuthToken' })
  @Public()
  @ExternalApiKey()
  async createAuthToken(@CurrentContext() context: IContext, @Args('userInput') userInput: CreateTokenInput): Promise<CreateTokenResponse> {
    const result = await this.authService.getTokenAuth(context, userInput);

    return { token: result } as CreateTokenResponse;
  }

  @Mutation(() => [User], { name: 'revokeCredential' })
  @UseGuards(SecurityAuthGuard)
  @AdminOnly()
  async sendRevokeCredential(
    @CurrentContext() context: IContext,
    @Args('revokeCredentialInput') revokeCredentialInput: RevokeCredentialInput,
  ): Promise<User[]> {
    return this.authService.revokeCredential(context, revokeCredentialInput);
  }
}
