const PRODUCTS_API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;

// 🔴 Anti-Cache Helper Functions
const appendAntiCacheParam = (url: string): string => {
  const timestamp = new Date().getTime();
  return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
};

const getAntiCacheHeaders = (existingHeaders?: HeadersInit): Headers => {
  const headers = new Headers(existingHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return headers;
};

export const fetchOrderDetailApi = async (orderNumber: string) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    throw new Error('Authentication token missing. Please sign in again.');
  }

  const rawUrl = `${PRODUCTS_API_BASE}/orders/${encodeURIComponent(orderNumber)}`;
  const fetchUrl = appendAntiCacheParam(rawUrl);
  const headers = getAntiCacheHeaders();
  headers.set('Authorization', `Bearer ${authToken}`);

  const response = await fetch(fetchUrl, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to load order details (Status: ${response.status})`);
  }

  const json = await response.json();
  return json.order || json.data || json;
};