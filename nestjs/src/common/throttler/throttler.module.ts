import { Module } from '@nestjs/common';
import {
  ThrottlerModule as NestThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { CustomThrottlerGuard } from './custom-throttler.guard';

/**
 * ThrottlerModule provides rate limiting to protect against brute force attacks
 */
@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60), // Time to live in seconds
          limit: config.get('THROTTLE_LIMIT', 100), // Number of requests allowed in TTL window
        },
      ],
    }),
    LoggerModule.forRoot('ThrottlerModule'),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ThrottlerModule {}
