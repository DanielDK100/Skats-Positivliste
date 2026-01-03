import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';
import * as https from 'https';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';

enum UserAgent {
  Chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  Firefox = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
  Edge = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  Safari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  Opera = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/99.0.0.0',
}

interface RequestOptions {
  headers: {
    'User-Agent': UserAgent;
  };
}

/**
 * Service for handling operations related to Skat's Positivliste
 */
@Injectable()
export class SkatsPositivlisteService {
  private readonly filePath: string = './public/xlsx/skats-positivliste.xlsx';
  private readonly logger: LoggerService;

  constructor(
    private configService: ConfigService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(SkatsPositivlisteService.name);
  }

  /**
   * Download the latest Skats Positivliste
   */
  public async downloadPositivliste(): Promise<boolean> {
    try {
      const url =
        this.configService.get<string>('SKAT_URL') +
        'erhverv/ekapital/vaerdipapirer/beviser-og-aktier-i-investeringsforeninger-og-selskaber-ifpa';

      this.logger.debug(`Fetching data from: ${url}`);
      const data = await this.fetchData(url);

      const element = this.fetchElement(data);
      if (!element) {
        this.logger.warn('No download link found on SKAT website');
        return false;
      }

      return await this.downloadFile(element);
    } catch (error) {
      this.logger.error(
        `Failed to download positivliste: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Get the file path of the downloaded XLSX file
   */
  public getFilePath(): string {
    return this.filePath;
  }

  /**
   * Fetch HTML data from the URL
   */
  private async fetchData(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      this.logger.error(`Error fetching data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Extract the download link element from the HTML
   */
  private fetchElement(body: string): HTMLAnchorElement | null {
    try {
      const dom = new JSDOM(body);
      return dom.window.document.querySelector("a[title^='ABIS Listen' i]");
    } catch (error) {
      this.logger.error(`Error parsing HTML: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get a random user agent to avoid detection
   */
  private getRandomUserAgent(): UserAgent {
    const userAgents = Object.values(UserAgent);
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
  }

  /**
   * Download the file from the provided link
   */
  private downloadFile(element: HTMLAnchorElement): Promise<boolean> {
    return new Promise((resolve) => {
      const randomUserAgent = this.getRandomUserAgent();
      const options: RequestOptions = {
        headers: {
          'User-Agent': randomUserAgent,
        },
      };

      this.logger.debug(`Using User-Agent: ${options.headers['User-Agent']}`);
      const url = this.configService.get('SKAT_URL') + element.href;

      https
        .get(url, options, (response) => {
          if (response.statusCode !== 200) {
            this.logger.error(
              `Download request failed with status: ${response.statusCode}`,
            );
            resolve(false);
            return;
          }

          const fileStream = fs.createWriteStream(this.filePath);

          response.pipe(fileStream);

          fileStream.on('error', (err) => {
            this.logger.error(`Error writing file: ${err.message}`, err.stack);
            resolve(false);
          });

          fileStream.on('finish', () => {
            const currentDate = new Date();
            try {
              fs.utimesSync(this.filePath, currentDate, currentDate);
              fileStream.close();
              this.logger.log(
                `Download finished successfully: ${currentDate.toLocaleString('da-DK')}`,
              );
              resolve(true);
            } catch (error) {
              this.logger.error(
                `Error finalizing file: ${error.message}`,
                error.stack,
              );
              resolve(false);
            }
          });
        })
        .on('error', (err) => {
          this.logger.error(`HTTP request error: ${err.message}`, err.stack);
          resolve(false);
        });
    });
  }
}
