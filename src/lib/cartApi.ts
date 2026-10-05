const API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
const CART_API_BASE = `${API_BASE}/cart`;
const CART_TOKEN_KEY = 'x-cart-token';

if (!import.meta.env.VITE_PRODUCTS_API_BASE_URL) {
  throw new Error('VITE_PRODUCTS_API_BASE_URL is missing in .env');
}

const setCartToken = (token: string) => localStorage.setItem(CART_TOKEN_KEY, token);

// 💡 Login မဝင်ထားတဲ့ User တွေကို Login Page ကို ပို့ပေးမယ့် Function
const redirectToLogin = () => {
  window.location.href = '/login'; 
};

// 🔴 Anti-Cache URL Generator Function
const appendAntiCacheParam = (url: string) => {
  const timestamp = new Date().getTime();
  return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
};

// 🔴 Anti-Cache Default Headers
const getAntiCacheHeaders = (existingHeaders?: HeadersInit): Headers => {
  const headers = new Headers(existingHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return headers;
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const authToken = localStorage.getItem('authToken');
  const cartToken = localStorage.getItem(CART_TOKEN_KEY);

  // 🔴 Login ဝင်ထားခြင်း မရှိပါက ချက်ချင်း Login Page သို့ ပို့မည်
  if (!authToken) {
    redirectToLogin();
    return new Promise(() => {}); 
  }

  const headers = getAntiCacheHeaders(options.headers);
  headers.set('Authorization', `Bearer ${authToken}`);
  
  if (cartToken) {
    headers.set('X-Cart-Token', cartToken);
  }

  // 🔴 Time-stamp ကိုသုံးပြီး URL ကို အမြဲအသစ်ဖြစ်နေစေခြင်း
  const fetchUrl = appendAntiCacheParam(`${CART_API_BASE}${endpoint}`);

  const response = await fetch(fetchUrl, {
    ...options,
    headers,
  });

  if (response.headers.has('X-Cart-Token')) {
    const newToken = response.headers.get('X-Cart-Token');
    if (newToken) setCartToken(newToken);
  }

  if (!response.ok) {
    throw new Error(`Cart API error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const getCart = () => request('');
export const addToCart = (variation_id: number, quantity: number) =>
  request('/add', { method: 'POST', body: JSON.stringify({ variation_id, quantity }) });
export const updateCartItem = (item_id: number, quantity: number) =>
  request(`/items/${item_id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
export const removeCartItem = (item_id: number) =>
  request(`/items/${item_id}`, { method: 'DELETE' });
export const clearCart = () => request('/clear', { method: 'POST' });

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
}

export interface CheckoutItem {
  variation_id: number;
  quantity: number;
}

export interface CheckoutPayload {
  payment_method: string;
  customer_phone: string;
  order_note?: string;
}

export interface CheckoutPaymentResult {
  success: boolean;
  reference?: string;
  qr_data?: string | null;
  deeplink?: string | null;
}

export interface CheckoutOrderItem {
  id: number;
  product_id?: number;
  product_variation_id?: number;
  name: string;
  sku?: string;
  quantity: number;
  unit_price?: number;
  subtotal?: number;
  tax_total?: number;
  total: number;
}

export interface CheckoutOrder {
  id: number;
  order_number: string;
  status: string;
  payment_status?: string;
  currency?: string;
  subtotal?: number;
  tax_total?: number;
  discount_total?: number;
  total: number;
  payment_method?: string;
  payment_method_title?: string;
  customer_email?: string;
  order_note?: string;
  items: CheckoutOrderItem[];
}

export interface CheckoutResponse {
  message?: string;
  order?: CheckoutOrder;
  payment?: CheckoutPaymentResult;
}

export interface OrderPaymentStatusResponse {
  order?: CheckoutOrder;
  payment_status?: string;
}

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    redirectToLogin();
    return [];
  }

  // 🔴 Anti-Cache Headers ထည့်သွင်းခြင်း
  const headers = getAntiCacheHeaders();
  headers.set('Authorization', `Bearer ${authToken}`);

  // 🔴 URL တွင် Timestamp ကပ်ခြင်း
  const fetchUrl = appendAntiCacheParam(`${API_BASE}/payment-methods`);

  const response = await fetch(fetchUrl, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
  }

  const data = await response.json();
  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.payment_methods)
    ? data.payment_methods
    : [];

  return rows.map((r: any) => ({
    id: String(r.id ?? r.code ?? r.slug ?? ''),
    name: String(r.name ?? r.label ?? r.title ?? r.id ?? ''),
    code: String(r.code ?? r.slug ?? r.id ?? ''),
    logo_url: r.logo_url ?? r.logo ?? r.icon_url ?? undefined,
  }));
};

// 🌟 SUBMIT CHECKOUT METHOD
export const submitCheckout = async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    redirectToLogin();
    throw new Error('Unauthorized');
  }

  // 🔴 Anti-Cache Headers ထည့်သွင်းခြင်း
  const headers = getAntiCacheHeaders();
  headers.set('Authorization', `Bearer ${authToken}`);

  // 🔴 URL တွင် Timestamp ကပ်ခြင်း
  const fetchUrl = appendAntiCacheParam(`${API_BASE}/checkout`);

  try {
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await clearCart().catch(() => {});
      
      let detail = response.statusText;
      try {
        const err = await response.json();
        detail = err?.message ?? err?.error ?? detail;
      } catch { /* ignore */ }
      throw new Error(`Checkout failed: ${detail}`);
    }

    const resResult: CheckoutResponse = await response.json();

    if (!resResult?.payment?.success) {
      console.log('[TELEMETRY ALERT] Payment verification unsuccessful. Purging connection slots.');
      await clearCart().catch(() => {});
    }

    return resResult;
  } catch (error) {
    await clearCart().catch(() => {});
    throw error;
  }
};

const getAuthTokenOrThrow = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    redirectToLogin();
    throw new Error('Auth token not found. Please sign in again.');
  }
  return token;
};

const normalizeOrderPaymentStatusResponse = (raw: any): OrderPaymentStatusResponse => {
  const root = raw?.data ?? raw?.result ?? raw?.payload ?? raw;
  const order = root?.order ?? raw?.order;
  const payment_status =
    root?.payment_status ??
    order?.payment_status ??
    root?.payment?.status ??
    root?.payment?.payment_status ??
    raw?.payment?.status ??
    raw?.payment?.payment_status ??
    root?.status ??
    raw?.payment_status ??
    raw?.order?.payment_status ??
    raw?.status;

  return {
    order,
    payment_status: typeof payment_status === 'string' ? payment_status : undefined,
  };
};

export const checkOrderPaymentStatus = async (orderNumber: string): Promise<OrderPaymentStatusResponse> => {
  const token = getAuthTokenOrThrow();

  // 🔴 Anti-Cache Headers ထည့်သွင်းခြင်း
  const headers = getAntiCacheHeaders();
  headers.set('Authorization', `Bearer ${token}`);

  // 🔴 URL တွင် Timestamp ကပ်ခြင်း
  const fetchUrl = appendAntiCacheParam(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}/payment-status`);

  const response = await fetch(fetchUrl, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const err = await response.json();
      detail = err?.message ?? err?.error ?? detail;
    } catch { /* ignore */ }
    throw new Error(`Failed to fetch payment status: ${detail}`);
  }

  const raw = await response.json();
  const normalized = normalizeOrderPaymentStatusResponse(raw);

  if (normalized.payment_status === 'failed' || normalized.payment_status === 'unpaid') {
    await clearCart().catch(() => {});
  }

  return normalized;
};

// 🌟 CANCEL ORDER API FUNCTION
export const cancelOrder = async (orderNumber: string): Promise<CheckoutResponse> => {
  const token = getAuthTokenOrThrow();

  // 🔴 Anti-Cache Headers ထည့်သွင်းခြင်း
  const headers = getAntiCacheHeaders();
  headers.set('Authorization', `Bearer ${token}`);

  // 🔴 URL တွင် Timestamp ကပ်ခြင်း
  const fetchUrl = appendAntiCacheParam(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}/cancel`);

  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const err = await response.json();
      detail = err?.message ?? err?.error ?? detail;
    } catch { /* ignore */ }
    throw new Error(`Failed to cancel order: ${detail}`);
  }

  return response.json();
};