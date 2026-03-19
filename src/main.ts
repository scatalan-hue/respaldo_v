import { addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { ThrowExceptionFilter } from './common/functions/throw-exception-filter';
import { GraphQLSchemaBuilderModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nMiddleware, I18nValidationPipe } from 'nestjs-i18n';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ApolloServer } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import * as express from 'express';
import * as https from 'https';
import * as fs from 'fs';
import { DataSource } from 'typeorm';


async function bootstrap() {

  initializeTransactionalContext();

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  const server = express.default();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), new GraphQLSchemaBuilderModule());
  app.useGlobalFilters(new ThrowExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(I18nMiddleware);
  configureMiscellaneous(app);
  configureSwagger(app);

  await app.init();

  let appServer: any = app;

  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  if (process.env.HTTPS == 'true') appServer = configureHttpsServer(server);
  await configureSubscriptions(app, server);

  appServer.listen(+process.env.APP_PORT);
}

function configureMiscellaneous(app) {
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors();
  app.useLogger(['error', 'warn']);
  app.use(bodyParser.json({ limit: process.env.FILES_UPLOAD_LIMIT }));
  app.use(
    bodyParser.urlencoded({
      limit: process.env.FILES_UPLOAD_LIMIT,
      extended: true,
    }),
  );
}

function configureHttpsServer(server) {
  return https.createServer({
    pfx: fs.readFileSync(process.env.CERT_PFX),
    passphrase: fs.readFileSync(process.env.CERT_PASS),
  } as any, server);
}

async function configureSubscriptions(app, server) {
  const { schema } = app.get(GraphQLSchemaHost);
  const apolloServer = new ApolloServer({
    schema,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app: server, path: '/graphql' });
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
      onConnect: () => {
        console.log('-- Usuario graphql Conectado -- ');
      },
    },
    {
      server: server,
      path: '/graphql',
    },
  );
}

function configureSwagger(app) {
  const config = new DocumentBuilder().setTitle(process.env.NAME).setDescription('CS3 BASE').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

bootstrap();
