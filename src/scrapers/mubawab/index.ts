import { chromium, type Browser } from "playwright";
import type {
  FetchListingUrlsParams,
  RawListing,
  ScraperAdapter,
} from "../core/types";
import {
  inferPropertyType,
  parsePriceMAD,
  parseSurfaceM2,
  normalizeCity,
} from "../core/normalize";
import { politeDelay, SCRAPER_USER_AGENT } from "../core/rate-limit";

// Mubawab sits behind AWS WAF Bot Control: plain fetch/cheerio requests get a
// 503 regardless of headers, but a real Chromium context (Playwright) is let
// through cleanly. Verified by hand before writing this adapter.

const BASE_URL = "https://www.mubawab.ma";

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

export async function closeMubawabBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}

async function newPage() {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: SCRAPER_USER_AGENT,
    locale: "fr-FR",
  });
  return context.newPage();
}

function transactionSlug(transactionType: FetchListingUrlsParams["transactionType"]) {
  return transactionType === "rent" ? "immobilier-a-louer" : "immobilier-a-vendre";
}

async function fetchListingUrls(params: FetchListingUrlsParams): Promise<string[]> {
  const citySlug = (params.city ?? "casablanca").toLowerCase();
  const maxPages = params.maxPages ?? 3;
  const baseSearchUrl = `${BASE_URL}/fr/ct/${citySlug}/${transactionSlug(params.transactionType)}`;

  const urls = new Set<string>();

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const searchUrl = pageNum === 1 ? baseSearchUrl : `${baseSearchUrl}:p:${pageNum}`;
    const page = await newPage();
    try {
      const response = await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      if (!response || response.status() >= 400) {
        console.warn(`[mubawab] search page ${pageNum} returned ${response?.status()}, stopping pagination`);
        break;
      }
      await page.waitForTimeout(1500);

      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href*='/fr/a/']"))
          .map((a) => a.href)
          .filter((href) => /\/fr\/a\/\d+\//.test(href))
      );

      if (hrefs.length === 0) break;
      for (const href of hrefs) urls.add(href);
    } finally {
      await page.close();
    }
    await politeDelay();
  }

  return [...urls];
}

async function fetchListingDetail(url: string): Promise<RawListing | null> {
  const page = await newPage();
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!response || response.status() >= 400) {
      console.warn(`[mubawab] detail page returned ${response?.status()} for ${url}`);
      return null;
    }
    await page.waitForTimeout(1200);

    const extracted = await page.evaluate(() => {
      const title = document.querySelector("h1.searchTitle")?.textContent?.trim();
      const priceText = document.querySelector(".orangeTit")?.textContent?.trim();

      const features = Array.from(document.querySelectorAll(".adDetailFeature")).map((el) =>
        el.textContent?.trim() ?? ""
      );

      const typeBreadcrumb = document.querySelector<HTMLAnchorElement>("a[href*='/fr/st/']");
      const neighborhoodBreadcrumb = document.querySelector<HTMLAnchorElement>("a[href*='/fr/sd/']");
      const cityBreadcrumb = document.querySelector<HTMLAnchorElement>("a[href*='/fr/ct/']");

      return {
        title,
        priceText,
        features,
        typeBreadcrumbText: typeBreadcrumb?.textContent?.trim(),
        typeBreadcrumbHref: typeBreadcrumb?.getAttribute("href"),
        neighborhood: neighborhoodBreadcrumb?.textContent?.trim(),
        city: cityBreadcrumb?.textContent?.trim()?.replace(/^Immobilier\s+/i, ""),
      };
    });

    if (!extracted.title) {
      console.warn(`[mubawab] could not find title on ${url}, skipping`);
      return null;
    }

    const surfaceFeature = extracted.features.find((f) => /m²$/.test(f));
    const piecesFeature = extracted.features.find((f) => /Pi[eè]ces?$/i.test(f));
    const chambresFeature = extracted.features.find((f) => /Chambres?$/i.test(f));

    const sourceIdMatch = url.match(/\/fr\/a\/(\d+)\//);
    const sourceId = sourceIdMatch?.[1];
    const transactionType = /a-louer/i.test(extracted.typeBreadcrumbHref ?? url) ? "rent" : "sale";

    const listing: RawListing = {
      source: "mubawab",
      sourceId,
      url,
      title: extracted.title,
      price: parsePriceMAD(extracted.priceText),
      currency: "MAD",
      surfaceM2: parseSurfaceM2(surfaceFeature),
      rooms: piecesFeature ? Number(piecesFeature.match(/^\d+/)?.[0]) : undefined,
      bedrooms: chambresFeature ? Number(chambresFeature.match(/^\d+/)?.[0]) : undefined,
      propertyType: inferPropertyType(extracted.typeBreadcrumbText ?? extracted.title),
      transactionType,
      city: normalizeCity(extracted.city),
      neighborhood: extracted.neighborhood,
      raw: { ...extracted, scrapedUrl: url },
    };

    return listing;
  } finally {
    await page.close();
  }
}

export const mubawabAdapter: ScraperAdapter = {
  source: "mubawab",
  fetchListingUrls,
  fetchListingDetail,
};
