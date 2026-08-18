import type { Country } from '../types';

// API Response Types
export interface ProductVariation {
  effective_price?: number;
  price_mmk?: number;
  price?: number;
  [key: string]: any;
}

export interface RegionItem {
  mcc?: string;
  [key: string]: any;
}

export interface ProductItem {
  slug: string;
  name: string;
  description?: string;
  type?: string;
  flag_image?: string;
  secondary_cover_image?: string;
  starting_price?: number;
  variations?: ProductVariation[];
  regions?: RegionItem[];
  [key: string]: any;
}

export interface ReviewSliderItem {
  id: string | number;
  image_url: string;
  alt_text?: string;
  title?: string;
  customer_name?: string;
  is_active?: boolean;
  [key: string]: any;
}

export interface ApiPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedApiResponse {
  items: ProductItem[];
  meta: ApiPaginationMeta;
}

// 🌟 Base URL Helper (.env မှ VITE_PRODUCTS_API_BASE_URL ကို သီးသန့်ယူသုံးခြင်း)
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL || '';
  return envUrl.replace(/\/+$/, '');
};

// 🌟 Image URL Slashes Clean လုပ်ပေးသည့် Helper
const cleanImageUrlSlashes = (url?: string): string => {
  if (!url) return '';
  return url.replace(/([^:]\/)\/+/g, '$1');
};

// 🌟 Raw API Response ကို ProductItem အဖြစ် parse လုပ်ပေးသည့် Helper
const parseProduct = (raw: any): ProductItem => {
  if (!raw) return {} as ProductItem;
  const data = raw.data || raw;

  return {
    ...data,
    slug: data.slug || data.id || '',
    name: data.name || '',
    description: data.description || '',
    type: data.type || 'country',
    flag_image: cleanImageUrlSlashes(data.flag_image || data.flagUrl),
    secondary_cover_image: cleanImageUrlSlashes(data.secondary_cover_image),
    starting_price: data.starting_price ?? data.startingPrice ?? 0,
    variations: Array.isArray(data.variations) ? data.variations : [],
    regions: Array.isArray(data.regions) ? data.regions : [],
  };
};

// 🌟 Popular Products API Fetcher (per_page ကို လုံးဝ မသုံးဘဲ type ခေါ်ဆိုခြင်း)
export async function fetchPopularProducts(params?: { type?: string }): Promise<ProductItem[]> {
  const cleanBase = getApiBaseUrl();
  const queryParams = new URLSearchParams();
  
  if (params?.type) {
    queryParams.append('type', params.type);
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await fetch(`${cleanBase}/products/popular${queryString}`, { method: 'GET' });
  
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const body = await res.json();
  const rawArray = body.data || body.items || (Array.isArray(body) ? body : []);
  
  return rawArray.map(parseProduct);
}

// 🌟 Paginated Products API Fetcher
export async function fetchProductsPaginated(params: { type: 'country' | 'region' | 'global'; perPage?: number; page?: number; search?: string }): Promise<PaginatedApiResponse> {
  const cleanBase = getApiBaseUrl();
  const queryParams = new URLSearchParams();
  
  queryParams.append('type', params.type);
  if (params.perPage) queryParams.append('per_page', String(params.perPage));
  if (params.page) queryParams.append('page', String(params.page));
  if (params.search) queryParams.append('search', params.search);

  const res = await fetch(`${cleanBase}/products?${queryParams.toString()}`, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
  const body = await res.json();
  const rawArray = body.data || body.items || (Array.isArray(body) ? body : []);
  const mappedItems = rawArray.map(parseProduct);
  
  const metaSource = body.meta || body;
  const mappedMeta: ApiPaginationMeta = {
    current_page: Number(metaSource?.current_page || 1),
    from: metaSource?.from ?? null,
    last_page: Number(metaSource?.last_page || 1),
    links: Array.isArray(metaSource?.links) ? metaSource.links : [],
    path: metaSource?.path || '',
    per_page: Number(metaSource?.per_page || 12),
    to: metaSource?.to ?? null,
    total: Number(metaSource?.total || 0),
  };

  return { items: mappedItems, meta: mappedMeta };
}

// 🌟 Plan Detail Page API Fetcher
export async function fetchProductBySlug(slug: string): Promise<ProductItem> {
  const cleanBase = getApiBaseUrl();
  const res = await fetch(`${cleanBase}/products/${slug}`, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
  const body = await res.json();
  return parseProduct(body);
}

// 🌟 Review Sliders API Fetcher
export async function fetchReviewSliders(): Promise<ReviewSliderItem[]> {
  const cleanBase = getApiBaseUrl();
  const res = await fetch(`${cleanBase}/review-sliders`, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const resBody = await res.json();
  const loadedSliders = resBody && Array.isArray(resBody.data) ? resBody.data : [];

  return loadedSliders
    .map((item: any) => ({
      ...item,
      image_url: cleanImageUrlSlashes(item.image_url)
    }))
    .filter((item: ReviewSliderItem) => item.is_active);
}

export { fetchProductsPaginated as fetchProducts };