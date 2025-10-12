import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkatsPositivlisteController } from './controllers/skats-positivliste.controller';
import { RegistrationService } from './services/registration.service';
import { XlsxService } from './services/xlsx.service';
import { RegistrationEntity } from './entities/registration.entity';
import { CronService } from './services/cron.service';
import { MailService } from './services/mail.service';
import { SkatsPositivlisteService } from './services/skats-positivliste.service';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistrationEntity]),
    LoggerModule.forRoot('SkatsPositivlisteModule'),
  ],
  controllers: [SkatsPositivlisteController],
  providers: [
    RegistrationService, 
    XlsxService, 
    SkatsPositivlisteService,
    CronService, 
    MailService
  ],
})
export class SkatsPositivlisteModule {}
