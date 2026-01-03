import { Controller, Get, Render, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { RegistrationService } from '../services/registration.service';
import { XlsxService } from '../services/xlsx.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class TopRegistrationController {
  private filePath: string = './public/xlsx/skats-positivliste.xlsx';

  constructor(
    private readonly registrationService: RegistrationService,
    private readonly xlsxService: XlsxService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/top-registreringer')
  @Render('pages/index.hbs')
  async topRegistrationsView(@Req() req: FastifyRequest) {
    try {
      const fileModified = await this.xlsxService.getLastModifiedTime(
        this.filePath,
      );
      return {
        fileModified: {
          value: fileModified.fileModified,
          toISOString: fileModified.fileModified.toISOString(),
          toLocaleString: fileModified.fileModified.toLocaleString('da-DK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          getFullYear: fileModified.fileModified.getFullYear(),
        },
        url: req.url,
        env: {
          SKAT_URL: this.configService.get('SKAT_URL'),
          SKATS_POSITIVLISTE_URL: this.configService.get(
            'SKATS_POSITIVLISTE_URL',
          ),
        },
      };
    } catch (error) {
      return { error: 'Internal Server Error' };
    }
  }

  @Get('/top-registrations')
  async getTopRegistrations() {
    try {
      const topRegistrations =
        await this.registrationService.topRegistrations(10);
      return topRegistrations;
    } catch (error) {
      return { error: 'Internal Server Error' };
    }
  }
}
