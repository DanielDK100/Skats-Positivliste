import { Module, DynamicModule } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Module({
  providers: [
    {
      provide: LoggerService,
      useValue: new LoggerService(),
    }
  ],
  exports: [LoggerService],
})
export class LoggerModule {
  /**
   * Create a logger module with a specific context
   * @param context The context string to use for all log messages
   */
  static forRoot(context?: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LoggerService,
          useValue: new LoggerService(context),
        },
      ],
      exports: [LoggerService],
    };
  }
}
