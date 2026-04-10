export const BASE_URL = "https://iss.moex.com/iss";

export const DEFAULT_PARAMS: Record<string, string> = {
  "iss.meta": "off",
  "iss.json": "extended",
};

export const DEFAULT_ENGINE = "stock";
export const DEFAULT_MARKET = "shares";
export const DEFAULT_TIMEOUT_MS = 15_000;
export const DEFAULT_PAGE_SIZE = 100;
export const MAX_AUTO_PAGES = 50;
