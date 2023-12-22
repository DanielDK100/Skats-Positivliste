import https from "https";
import fs from "fs";
import { JSDOM } from "jsdom";

async function fetchData(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

function fetchElement(body: string): HTMLAnchorElement | null {
  const dom = new JSDOM(body);
  return dom.window.document.querySelector("a[title^='ABIS Listen' i]");
}

function downloadFile(element: HTMLAnchorElement): void {
  https.get(process.env.SKAT_URL + element.href, (response) => {
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
      console.info("Download finished: " + currentDate.toLocaleString("da-DK"));
    });
  });
}

export default async function main(): Promise<void> {
  const data = await fetchData(
    process.env.SKAT_URL +
      "erhverv/ekapital/vaerdipapirer/beviser-og-aktier-i-investeringsforeninger-og-selskaber-ifpa"
  );
  const element = fetchElement(data);

  if (!element) {
    return;
  }
  downloadFile(element);
}
