export type Source = "avito" | "mubawab" | "sarouty";
export type TransactionType = "sale" | "rent";

export interface RawListing {
  source: Source;
  sourceId?: string;
  url: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  city?: string;
  neighborhood?: string;
  surfaceM2?: number;
  rooms?: number;
  bedrooms?: number;
  propertyType?: string;
  transactionType?: TransactionType;
  raw: Record<string, unknown>;
}

export interface FetchListingUrlsParams {
  city?: string;
  transactionType?: TransactionType;
  maxPages?: number;
}

export interface ScraperAdapter {
  source: Source;
  fetchListingUrls(params: FetchListingUrlsParams): Promise<string[]>;
  fetchListingDetail(url: string): Promise<RawListing | null>;
}
