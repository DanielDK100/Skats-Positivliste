import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './common/logger/logger.service';
import { registerHandlebarsHelpers } from './common/helpers/handlebars-helpers';

async function bootstrap() {
  // Create a standalone logger for bootstrap process
  const bootstrapLogger = new LoggerService('Bootstrap');

  try {
    // Create Fastify adapter with explicit cast to work around TypeScript error
    const fastifyAdapter = new FastifyAdapter() as any;
    const app = await NestFactory.create(AppModule, fastifyAdapter, {
      bufferLogs: true,
    });

    // Get application logger from the logger module
    const logger = app.get(LoggerService);
    app.useLogger(logger);

    const configService = app.get(ConfigService);

    // Set up global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip properties not defined in DTOs
        transform: true, // Automatically transform payloads to DTO instances
        forbidNonWhitelisted: true, // Throw error on unknown properties
      }),
    );

    // Set up global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Set up global interceptors
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );

    // Serve static files
    const fastifyInstance = app.getHttpAdapter().getInstance();
    await fastifyInstance.register(import('@fastify/static'), {
      root: join(__dirname, '..', '..', 'public'),
      prefix: '/', // optional: default '/'
    });

    // Register Handlebars helpers
    registerHandlebarsHelpers();

    // Set up view engine
    await fastifyInstance.register(import('@fastify/view'), {
      engine: {
        handlebars: require('handlebars'),
      },
      defaultContext: {
        // Global variables available in all templates
        appName: 'Skats Positivliste',
      },
      templates: join(__dirname, '..', '..', 'views'),
      layout: 'layouts/main',
      options: {
        partials: {
          header: 'partials/header.hbs',
          footer: 'partials/footer.hbs',
        },
        extension: 'hbs', // file extension for handlebars templates
      },
    });

    const PORT = configService.get('PORT') ?? 3001;
    const HOST = configService.get('HOST') ?? 'localhost';

    await app.listen(PORT, HOST);
    logger.log(`Application running on http://${HOST}:${PORT}`);
  } catch (error) {
    bootstrapLogger.error(
      `Error during application bootstrap: ${error.message}`,
      error.stack,
    );
    process.exit(1);
  }
}

bootstrap();
