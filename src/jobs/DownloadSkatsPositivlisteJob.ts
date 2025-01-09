import * as https from "https";
import * as fs from "fs";
import { JSDOM } from "jsdom";
import JobInterface from "./JobInterface";

enum UserAgent {
  Chrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  Firefox = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0",
  Edge = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
  Safari = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  Opera = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/99.0.0.0",
}

interface RequestOptions {
  headers: {
    "User-Agent": UserAgent;
  };
}

class DownloadSkatsPositivlisteJob implements JobInterface {
  private async fetchData(url: string): Promise<string> {
    const response = await fetch(url);

    return await response.text();
  }

  private fetchElement(body: string): HTMLAnchorElement | null {
    const dom = new JSDOM(body);

    return dom.window.document.querySelector("a[title^='ABIS Listen' i]");
  }

  private getRandomUserAgent(): UserAgent {
    const userAgents = Object.values(UserAgent);
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
  }

  private downloadFile(element: HTMLAnchorElement): void {
    const randomUserAgent = this.getRandomUserAgent();
    const options: RequestOptions = {
      headers: {
        "User-Agent": randomUserAgent,
      },
    };

    console.log("User-Agent: ", options.headers["User-Agent"]);

    https.get(process.env.SKAT_URL + element.href, options, (response) => {
      if (response.statusCode !== 200) {
        console.error("Request failed with status:", response.statusCode);
        return;
      }

      const fileStream = fs.createWriteStream(
        "./public/xlsx/skats-positivliste.xlsx"
      );

      response.pipe(fileStream);
      fileStream.on("finish", () => {
        const currentDate = new Date();

        fs.utimesSync(
          "./public/xlsx/skats-positivliste.xlsx",
          currentDate,
          currentDate
        );
        fileStream.close();
        console.info(
          "Download finished: " + currentDate.toLocaleString("da-DK")
        );
      });
    });
  }

  public async run(): Promise<void> {
    const data = await this.fetchData(
      process.env.SKAT_URL +
        "erhverv/ekapital/vaerdipapirer/beviser-og-aktier-i-investeringsforeninger-og-selskaber-ifpa"
    );
    const element = this.fetchElement(data);

    if (!element) {
      return;
    }
    this.downloadFile(element);
  }
}
export default new DownloadSkatsPositivlisteJob();
