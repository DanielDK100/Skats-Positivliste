import https from "https";
import fs from "fs";
import { JSDOM } from "jsdom";

async function fetchData(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

function parseDOM(body: string): Element | null {
  const dom = new JSDOM(body);
  return dom.window.document.querySelector("#toggleHdr4u-3 a:first-child");
}

function formatDate(element: Element): Date | null {
  const regex = /listen (\d{2})(\d{2})(\d{4})/;
  const match = element.textContent?.match(regex);

  if (match) {
    const [, day, month, year] = match;
    return new Date(`${year}-${month}-${day}`);
  } else {
    return null;
  }
}

function downloadFile(element: Element | null): void {
  if (element) {
    https.get(
      process.env.SKAT_URL + (element as HTMLAnchorElement).href,
      (response) => {
        const fileStream = fs.createWriteStream(
          "./public/xlxs/skats-positivliste.xlsx"
        );
        response.pipe(fileStream);
        fileStream.on("finish", () => {
          const lastModified = formatDate(element);
          if (lastModified) {
            fs.utimesSync(
              "./public/xlxs/skats-positivliste.xlsx",
              lastModified,
              lastModified
            );
          }
          fileStream.close();
          console.info(
            "Download finished: " + new Date().toLocaleString("da-DK")
          );
        });
      }
    );
  }
}

export default async function main(): Promise<void> {
  const data = await fetchData(process.env.SKAT_URL + "data.aspx?oid=2244641");
  const element = parseDOM(data);
  downloadFile(element);
}
