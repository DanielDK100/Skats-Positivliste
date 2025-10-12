import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';
import { RegistrationEntity } from '../entities/registration.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: this.configService.get('MAIL_FROM'),
        pass: this.configService.get('MAIL_AUTH_PASS'),
      },
    });

    // Verify mail configuration in development mode
    if (this.configService.get('NODE_ENV') === 'development') {
      this.verifyMailConnection();
    }
  }

  private async verifyMailConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('SMTP connection verification failed:');
      console.error('- Error: ' + error.message);
      if (error.code === 'EAUTH') {
        console.error('- It appears your credentials are invalid.');
        console.error('- For Gmail, make sure to use an "App Password", not your regular password.');
        console.error('- Create an App Password at: https://myaccount.google.com/apppasswords');
      }
    }
  }

  public getTransporter(): nodemailer.Transporter {
    return this.transporter;
  }

  private compileHandlebarsTemplate(templateName: string, data: any): string {
    const templatePath = join(process.cwd(), 'views/mails', templateName);
    const templateSource = readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  public async sendRegistrationNotification(
    registration: RegistrationEntity
  ): Promise<string> {
    try {
      const response = await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: registration.email,
        subject: `${registration.isin} - tilføjet til SKATs positivliste`,
        html: this.compileHandlebarsTemplate('registration.hbs', {
          registration: registration,
          currentYear: new Date().getFullYear()
        }),
      });
      console.info('Email sent: ', response.response);
      
      return response.response;
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error;
    }
  }
}
