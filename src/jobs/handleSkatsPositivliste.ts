import https from "https";
import fs from "fs";
import { JSDOM } from "jsdom";

async function fetchData(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

function parseDOM(body: string): HTMLAnchorElement | null {
  const dom = new JSDOM(body);
  return dom.window.document.querySelector("#toggleHdr4u-3 a:first-child");
}

function formatDate(element: string): Date | null {
  const regex = /listen (\d{2})(\d{2})(\d{4})/;
  const match = element.match(regex);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}`);
}

function downloadFile(element: HTMLAnchorElement | null) {
  if (!element) {
    return;
  }
  https.get(process.env.SKAT_URL + element.href, (response) => {
    const fileStream = fs.createWriteStream(
      "./public/xlsx/skats-positivliste.xlsx"
    );
    response.pipe(fileStream);
    fileStream.on("finish", () => {
      const lastModified = formatDate(element.title);
      if (!lastModified) {
        return;
      }
      fs.utimesSync(
        "./public/xlsx/skats-positivliste.xlsx",
        lastModified,
        lastModified
      );
      fileStream.close();
      console.info("Download finished: " + new Date().toLocaleString("da-DK"));
    });
  });
}

export default async function main(): Promise<void> {
  const data = await fetchData(process.env.SKAT_URL + "data.aspx?oid=2244641");
  const element = parseDOM(data);
  downloadFile(element);
}
