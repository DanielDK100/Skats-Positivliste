import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { XlsxService } from '../services/xlsx.service';
import { RegistrationService } from '../services/registration.service';
import { RegistrationDto } from '../dtos/registration.dto';
import { RegistrationEntity } from '../entities/registration.entity';

enum StatusEnum {
  Success = 'success',
  Danger = 'danger',
}

@Controller()
export class SkatsPositivlisteController {
  private filePath: string = './public/xlsx/skats-positivliste.xlsx';

  constructor(
    private readonly xlsxService: XlsxService,
    private readonly registrationService: RegistrationService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/')
  @Render('pages/index.hbs')
  async indexView(@Req() req: FastifyRequest, @Query('status') status: string) {
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
        status: status,
        statusEnum: StatusEnum,
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

  @Post('/register')
  async register(
    @Body() registrationDto: RegistrationDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const registration = new RegistrationEntity();
      registration.isin = registrationDto.isin;
      registration.email = registrationDto.email;

      await this.registrationService.resetIsNotified(registration);

      return res.status(302).redirect(`/?status=${StatusEnum.Success}`);
    } catch (error) {
      return res.status(302).redirect(`/?status=${StatusEnum.Danger}`);
    }
  }

  @Get('/investment-companies')
  async investmentCompanies() {
    try {
      const data = await this.xlsxService.fetchXlsxFileData(this.filePath);
      return data;
    } catch (error) {
      throw new Error('Internal Server Error');
    }
  }
}
