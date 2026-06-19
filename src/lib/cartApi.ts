const API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL || 'http://168.144.129.220/api/v1';
const CART_API_BASE = `${API_BASE}/cart`;
const CART_TOKEN_KEY = 'x-cart-token';

const getCartToken = () => localStorage.getItem(CART_TOKEN_KEY);
const setCartToken = (token: string) => localStorage.setItem(CART_TOKEN_KEY, token);

const bootstrapGuestToken = async () => {
  const response = await fetch(CART_API_BASE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.headers.has('X-Cart-Token')) {
    const token = response.headers.get('X-Cart-Token');
    if (token) setCartToken(token);
  }
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const authToken = localStorage.getItem('authToken');
  let cartToken = getCartToken();
  const method = (options.method || 'GET').toUpperCase();

  if (!authToken && !cartToken && !(method === 'GET' && endpoint === '')) {
    await bootstrapGuestToken();
    cartToken = getCartToken();
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  } else if (cartToken) {
    headers['X-Cart-Token'] = cartToken;
  }

  const response = await fetch(`${CART_API_BASE}${endpoint}`, {
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
