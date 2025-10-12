import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SkatsPositivlisteModule } from './skats-positivliste/skats-positivliste.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { ENV_CONSTANTS } from './common/constants/env.constants';
import { LoggerModule } from './common/logger/logger.module';
import { ThrottlerModule } from './common/throttler/throttler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        HOST: Joi.string().default('localhost'),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_PORT: Joi.number().default(3306),
        THROTTLE_TTL: Joi.number().default(60),
        THROTTLE_LIMIT: Joi.number().default(100),
        API_KEY: Joi.string().optional(),
        SKAT_URL: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('MYSQL_HOST'),
        port: 3306,
        database: configService.get('MYSQL_DATABASE'),
        username: configService.get('MYSQL_USER'),
        password: configService.get('MYSQL_PASSWORD'),
        synchronize: configService.get('NODE_ENV') === 'production' ? false : true,
        autoLoadEntities: true,
        logging: false,
      }),
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot('AppModule'),
    ThrottlerModule,
    SkatsPositivlisteModule,
  ],
})
export class AppModule {}
