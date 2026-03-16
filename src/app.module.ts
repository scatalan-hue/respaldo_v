import { OrganizationProductInterceptor } from './security/auth/decorators/organization-product.decorator';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { SqlServerConnectionOptions } from 'typeorm/driver/sqlserver/SqlServerConnectionOptions';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { TrimAndRenameInterceptor } from './common/functions/clean-underscore.interceptor';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { ThrowExceptionFilter } from './common/functions/throw-exception-filter';
import { LanguageInterceptor } from './common/i18n/decorators/language.decorator';
import { CustomPasswordScalar } from './security/users/scalars/password.scalar';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { I18nValidation } from './common/functions/i18n-validation-pipe';
import { ExternalApiModule } from './external-api/external-api.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DateTimeScalar } from './common/scalars/date.scalar';
import { PatternsModule } from './patterns/patterns.module';
import { SecurityModule } from './security/security.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GeneralModule } from './general/general.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { MainModule } from './main/main.module';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { format, transports } from 'winston';
import { Module } from '@nestjs/common';
import { config } from './config';
import { join } from 'path';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: Joi.object({
        STATE: Joi.string().required(),

        APP_PORT: Joi.number().required(),

        HTTPS: Joi.string().optional(),
        HTTPS_PFX_PATH: Joi.string().optional(),
        HTTPS_PFX_PASS: Joi.string().optional(),

        FILES_UPLOAD_LIMIT: Joi.string().required(),

        DB_TYPE: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),

        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),

        DB_FILE_MODE: Joi.string().required(),

        DB_MONGODB_SERVER: Joi.string().optional(),
        DB_MONGODB_NAME: Joi.string().optional(),

        SA_EMAIL: Joi.string().required(),
        SA_PASSWORD: Joi.string().required(),

        SIGEC_URL: Joi.string().required(),
        VALIDATION_URL: Joi.string().required(),
        VALIDATION_SECOP: Joi.boolean().required()
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      resolvers: { ValidatePassword: CustomPasswordScalar },
      formatError: (formattedError, error: any) => {
        return {
          message: formattedError.message,
          code: formattedError.extensions.code,
          status: error.extensions.status,
          path: process.env.STATE === 'prod' ? undefined : formattedError.path,
          locations: process.env.STATE === 'prod' ? undefined : formattedError.locations,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        return {
          type: configService.database.type,
          host: configService.database.host,
          port: +configService.database.port,
          username: configService.database.user,
          password: configService.database.password,
          database: configService.database.name,
          synchronize: true,
          autoLoadEntities: true,
          logging: false /*['query', 'error']*/,
          extra: {
            trustServerCertificate: true,
          },
          schema: 'dbo',
        } as SqlServerConnectionOptions;
      },
    }),

    EventEmitterModule.forRoot(),
    ...(process.env.DB_MONGODB_SERVER
      ? [MongooseModule.forRoot(process.env.DB_MONGODB_SERVER + '/' + process.env.DB_MONGODB_NAME, { dbName: process.env.DB_MONGODB_NAME })]
      : []),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: 'es',
        loaderOptions: {
          path: join(__dirname, '/common/i18n/'),
          watch: true,
        },
      }),
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver, new HeaderResolver(['x-lang'])],
      inject: [ConfigService],
    }),
    WinstonModule.forRootAsync({
      useFactory: () => ({
        level: 'info',
        transports: [
          new transports.Console({
            format: format.combine(
              format.timestamp(),
              format.ms(),
              nestWinstonModuleUtilities.format.nestLike('base', {
                colors: true,
                prettyPrint: true,
              }),
            ),
          }),
        ],
      }),
      inject: [],
    }),

    SecurityModule,
    MainModule,
    GeneralModule,
    PatternsModule,
    ExternalApiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ThrowExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LanguageInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TrimAndRenameInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OrganizationProductInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: I18nValidation,
    },
    DateTimeScalar,
  ],
})
export class AppModule { }
