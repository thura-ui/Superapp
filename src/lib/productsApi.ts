const PRODUCTS_API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
const PRODUCT_DETAIL_API_URL = `${PRODUCTS_API_BASE}/products`;

if (!PRODUCTS_API_BASE) {
  throw new Error('VITE_PRODUCTS_API_BASE_URL is missing in .env');
}

export interface ProductRegion {
  id?: string | number;
  slug?: string;
  name?: string;
  mcc?: string;
}

export interface ProductVariation {
  id?: string | number;
  slug?: string;
  name?: string;
  description?: string;
  sku?: string;
  product_code?: string;
  package_code?: string;
  external_id?: string;
  data?: string;
  data_amount?: string;
  data_plan?: string;
  quota?: string;
  days?: number;
  validity_days?: number;
  price?: number | string;
  effective_price?: number | string;
  price_mmk?: number | string;
  price_usd?: number | string;
  currency?: string;
  plan_type?: string;
}

export interface ProductItem {
  id?: string | number;
  slug: string;
  name: string;
  type?: string;
  description?: string;
  code?: string;
  country_flag_url?: string;
  flag_image_url?: string;
  flag_url?: string;
  image_url?: string;
  is_popular?: boolean;
  popular?: boolean;
  featured?: boolean;
  regions: ProductRegion[];
  variations: ProductVariation[];
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

const pickArray = (obj: Record<string, unknown> | null, keys: string[]): unknown[] => {
  if (!obj) return [];
  for (const key of keys) {
    const arrayValue = toArray(obj[key]);
    if (arrayValue.length > 0) {
      return arrayValue;
    }
  }
  return [];
};

const parseVariation = (value: unknown): ProductVariation | null => {
  const row = toObject(value);
  if (!row) return null;

  return {
    id: (row.id as string | number | undefined) ?? (row.variation_id as string | number | undefined),
    slug: toStringValue(row.slug),
    name: toStringValue(row.name),
    description: toStringValue(row.description),
    sku: toStringValue(row.sku),
    product_code: toStringValue(row.product_code),
    package_code: toStringValue(row.package_code) ?? toStringValue(row.product_code),
    external_id: toStringValue(row.external_id),
    data: toStringValue(row.data) ?? toStringValue(row.data_plan),
    data_amount: toStringValue(row.data_amount),
    data_plan: toStringValue(row.data_plan),
    quota: toStringValue(row.quota),
    days: toNumber(row.days),
    validity_days: toNumber(row.validity_days),
    price:
      (row.effective_price as number | string | undefined) ??
      (row.price as number | string | undefined) ??
      (row.price_mmk as number | string | undefined),
    effective_price: row.effective_price as number | string | undefined,
    price_mmk: row.price_mmk as number | string | undefined,
    price_usd: row.price_usd as number | string | undefined,
    currency: toStringValue(row.currency),
    plan_type: toStringValue(row.plan_type),
  };
};

const parseRegion = (value: unknown): ProductRegion | null => {
  const row = toObject(value);
  if (!row) return null;
  return {
    id: (row.id as string | number | undefined) ?? (row.region_id as string | number | undefined),
    slug: toStringValue(row.slug) ?? toStringValue(row.region_slug),
    name: toStringValue(row.name) ?? toStringValue(row.region_name),
    mcc: toStringValue(row.mcc),
  };
};

const parseProduct = (value: unknown): ProductItem | null => {
  const row = toObject(value);
  if (!row) return null;

  const slug =
    toStringValue(row.slug) ||
    toStringValue(row.product_slug) ||
    toStringValue(row.code);

  const name =
    toStringValue(row.name) ||
    toStringValue(row.product_name);

  if (!slug || !name) {
    return null;
  }

  const regions = pickArray(row, ['regions', 'region']).map(parseRegion).filter((r): r is ProductRegion => r !== null);
  const variations = pickArray(row, ['variations', 'packages', 'plans']).map(parseVariation).filter((r): r is ProductVariation => r !== null);

  return {
    id: (row.id as string | number | undefined) ?? (row.product_id as string | number | undefined),
    slug,
    name,
    type: toStringValue(row.type) ?? toStringValue(row.product_type),
    description: toStringValue(row.description),
    code: toStringValue(row.code),
    country_flag_url: toStringValue(row.country_flag_url),
    flag_image_url: toStringValue(row.flag_image_url),
    flag_url:
      toStringValue(row.flag_url) ||
      toStringValue(row.country_flag_url) ||
      toStringValue(row.flag_image_url),
    image_url: toStringValue(row.image_url),
    is_popular: Boolean(row.is_popular),
    popular: Boolean(row.popular),
    featured: Boolean(row.featured),
    regions,
    variations,
  };
};

const extractProducts = (payload: unknown): ProductItem[] => {
  const top = toObject(payload);
  const directRows = toArray(payload).map(parseProduct).filter((p): p is ProductItem => p !== null);
  if (directRows.length > 0) {
    return directRows;
  }

  const nestedCandidates = [
    top?.data,
    toObject(top?.data ?? null)?.data,
    top?.products,
    toObject(top?.data ?? null)?.products,
  ];

  for (const candidate of nestedCandidates) {
    const parsed = toArray(candidate).map(parseProduct).filter((p): p is ProductItem => p !== null);
    if (parsed.length > 0) {
      return parsed;
    }
  }

  return [];
};

const extractSingleProduct = (payload: unknown): ProductItem | null => {
  const parsedDirect = parseProduct(payload);
  if (parsedDirect) return parsedDirect;

  const top = toObject(payload);
  if (!top) return null;

  const candidates = [top.data, top.product, toObject(top.data ?? null)?.product];
  for (const candidate of candidates) {
    const parsed = parseProduct(candidate);
    if (parsed) return parsed;
  }

  return null;
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const fetchProducts = async (params?: {
  region?: string;
  search?: string;
  perPage?: number;
}): Promise<ProductItem[]> => {
  const url = new URL(`${PRODUCTS_API_BASE}/products`);
  if (params?.region) url.searchParams.set('region', params.region);
  if (params?.search) url.searchParams.set('search', params.search);
  
  const requestedPerPage = params?.perPage ?? 220;
  const perPage = Math.min(requestedPerPage, 220);
  url.searchParams.set('per_page', String(perPage));

  const payload = await fetchJson(url.toString());
  return extractProducts(payload);
};

export const fetchProductBySlug = async (slug: string): Promise<ProductItem> => {
  const detailUrl = `${PRODUCT_DETAIL_API_URL}/${encodeURIComponent(slug)}`;
  
  const payload = await fetchJson(detailUrl);
  const product = extractSingleProduct(payload);
  if (!product) {
    throw new Error('Product detail payload is missing required fields.');
  }
  return product;
};