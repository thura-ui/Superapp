const PRODUCTS_API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;

if (!PRODUCTS_API_BASE) {
  throw new Error('VITE_PRODUCTS_API_BASE_URL is missing in .env');
}

export interface BannerItem {
  id: number;
  image_url: string;
  title?: string;
  description?: string;
}

const toObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return undefined;
};

// 🔴 Anti-Cache URL Parameter
const appendAntiCacheParam = (url: string) => {
  const timestamp = new Date().getTime();
  return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
};

// 🔴 Anti-Cache Headers
const getAntiCacheHeaders = (existingHeaders?: HeadersInit): Headers => {
  const headers = new Headers(existingHeaders);
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return headers;
};

const parseBanner = (value: unknown): BannerItem | null => {
  const row = toObject(value);
  if (!row) return null;

  const id = toNumber(row.id);
  const image_url = toStringValue(row.image_url) ?? toStringValue(row.imageUrl);
  if (id === undefined || !image_url) {
    return null;
  }

  return {
    id,
    image_url,
    title: toStringValue(row.title),
    description: toStringValue(row.description),
  };
};

const extractBanners = (payload: unknown): BannerItem[] => {
  const directRows = toArray(payload).map(parseBanner).filter((b): b is BannerItem => b !== null);
  if (directRows.length > 0) {
    return directRows;
  }

  const top = toObject(payload);
  const nestedCandidates = [top?.data, toObject(top?.data ?? null)?.data, top?.banners];

  for (const candidate of nestedCandidates) {
    const parsed = toArray(candidate).map(parseBanner).filter((b): b is BannerItem => b !== null);
    if (parsed.length > 0) {
      return parsed;
    }
  }

  return [];
};

// 🌟 [API LAYER LOCK VARIABLES]
let activeBannerPromise: Promise<BannerItem[]> | null = null;

export const fetchBanners = async (): Promise<BannerItem[]> => {
  // 🔴 ရာသက်ပန် Cache မမိစေရန် cachedBanners စစ်ဆေးချက်အား ပိတ်၍ တိုက်ရိုက် Fresh Data ခေါ်ယူမည်
  if (activeBannerPromise) {
    return activeBannerPromise;
  }

  activeBannerPromise = (async () => {
    try {
      // 🔴 Anti-Cache URL နှင့် Headers သုံးပြီး Banner များကို ခေါ်ယူခြင်း
      const fetchUrl = appendAntiCacheParam(`${PRODUCTS_API_BASE}/banners`);
      const headers = getAntiCacheHeaders();

      const response = await fetch(fetchUrl, { headers });
      if (!response.ok) {
        throw new Error(`Banner request failed: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const result = extractBanners(payload).sort((a, b) => a.id - b.id);
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      activeBannerPromise = null;
    }
  })();

  return activeBannerPromise;
};