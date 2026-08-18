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
// ရေရှည်အတွက် အကောင်းဆုံးဖြစ်အောင် ရောက်ရှိလာတဲ့ ဒေတာတွေကို Cache သိမ်းပြီး Request တစ်ကြိမ်တည်းပဲသွားစေမည့် စနစ်
let activeBannerPromise: Promise<BannerItem[]> | null = null;
let cachedBanners: BannerItem[] | null = null;

export const fetchBanners = async (): Promise<BannerItem[]> => {
  // ၁။ အကယ်၍ ယခင်က ဒေတာဆွဲယူပြီးသား (Cached data) ရှိနေရင် API လုံးဝမခေါ်တော့ဘဲ ချက်ချင်း ပြန်ပေးမည်
  if (cachedBanners) {
    return cachedBanners;
  }

  // ၂။ အကယ်၍ API ခေါ်ယူခြင်း လုပ်ငန်းစဉ်တစ်ခု တည်းလုပ်ဆောင်နေဆဲ (Pending request) ရှိနေရင် ဒုတိယ Request ထပ်မထွက်စေဘဲ ၎င်းလုပ်ငန်းစဉ်ကိုပဲ မျှဝေသုံးစွဲမည်
  if (activeBannerPromise) {
    return activeBannerPromise;
  }

  // ၃။ ပထမဦးဆုံးအကြိမ် စတင်ခေါ်ယူမှုအား သိမ်းဆည်းခြင်း
  activeBannerPromise = (async () => {
    try {
      const response = await fetch(`${PRODUCTS_API_BASE}/banners`);
      if (!response.ok) {
        throw new Error(`Banner request failed: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const result = extractBanners(payload).sort((a, b) => a.id - b.id);
      
      // Cache ဒေတာအဖြစ် သတ်မှတ်ခြင်း
      cachedBanners = result;
      return result;
    } catch (error) {
      // Error တက်ပါက နောက်တစ်ကြိမ် ပြန်ခေါ်နိုင်ရန် Lock ကို ပြန်ဖြည်ပေးခြင်း
      cachedBanners = null;
      throw error;
    } finally {
      // လုပ်ငန်းစဉ်ပြီးဆုံးပါက ခေါ်ဆိုမှုလမ်းကြောင်းကို ရှင်းလင်းပေးခြင်း
      activeBannerPromise = null;
    }
  })();

  return activeBannerPromise;
};