import * as https from "https";
import * as fs from "fs";
import { JSDOM } from "jsdom";
import JobInterface from "./JobInterface";

enum UserAgent {
  MyCustomUserAgent,
}

interface DownloadFileOptions {
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

    const title = dom.window.document.querySelector(
      "a[title^='ABIS Listen' i]"
    );

    return dom.window.document.querySelector("a[title^='ABIS Listen' i]");
  }

  private downloadFile(element: HTMLAnchorElement): void {
    const options: DownloadFileOptions = {
      headers: {
        "User-Agent": UserAgent.MyCustomUserAgent,
      },
    };

    https
      .get(process.env.SKAT_URL + element.href, options, (response) => {
        const fileStream = fs.createWriteStream(
          "./public/xlsx/skats-positivliste.xlsx"
        );

        if (response.statusCode !== 200) {
          console.error("Request failed with status:", response.statusCode);
          return;
        }

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
      })
      .on("error", (err) => {
        console.error("HTTP request error:", err.message);
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
