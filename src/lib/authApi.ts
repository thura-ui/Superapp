const AUTH_API_BASE = `${import.meta.env.VITE_PRODUCTS_API_BASE_URL}/auth`;
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_PROFILE_KEY = 'authProfile';

if (!import.meta.env.VITE_PRODUCTS_API_BASE_URL) {
  throw new Error('VITE_PRODUCTS_API_BASE_URL is missing in .env');
}

type UnknownRecord = Record<string, unknown>;

export interface AuthProfile {
  name: string;
  email: string;
  phone: string;
}

const toObject = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as UnknownRecord;
};

const asText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return '';
};

// 🔴 Anti-Cache URL Generator Function
const appendAntiCacheParam = (url: string) => {
  const timestamp = new Date().getTime();
  return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
};

// 🔴 Anti-Cache Default Headers Generator
const getAntiCacheHeaders = (existingHeaders?: HeadersInit): Headers => {
  const headers = new Headers(existingHeaders);
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return headers;
};

const findFirstTextByKeys = (value: unknown, keys: string[], depth = 0): string => {
  if (depth > 5) {
    return '';
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = findFirstTextByKeys(item, keys, depth + 1);
      if (text) {
        return text;
      }
    }
    return '';
  }

  const obj = toObject(value);
  if (!obj) {
    return '';
  }

  for (const key of keys) {
    const text = asText(obj[key]).trim();
    if (text) {
      return text;
    }
  }

  for (const nestedValue of Object.values(obj)) {
    const text = findFirstTextByKeys(nestedValue, keys, depth + 1);
    if (text) {
      return text;
    }
  }

  return '';
};

const getErrorMessage = (payload: unknown, fallback: string) => {
  const obj = toObject(payload);
  return (
    asText(obj?.message) ||
    asText(obj?.error) ||
    asText(obj?.details) ||
    fallback
  );
};

const extractToken = (payload: unknown): string => {
  const obj = toObject(payload);
  const nested = toObject(obj?.data);

  return (
    asText(obj?.token) ||
    asText(obj?.access_token) ||
    asText(nested?.token) ||
    asText(nested?.access_token)
  );
};

const normalizeProfile = (payload: unknown): AuthProfile => {
  const firstName = findFirstTextByKeys(payload, ['first_name', 'firstName', 'given_name']);
  const lastName = findFirstTextByKeys(payload, ['last_name', 'lastName', 'family_name']);
  const combinedName = `${firstName} ${lastName}`.trim();

  const name =
    findFirstTextByKeys(payload, ['name', 'userName', 'username', 'user_name', 'full_name', 'fullName', 'display_name', 'displayName', 'nickname']) ||
    combinedName ||
    'Simless User';

  const email =
    findFirstTextByKeys(payload, ['email', 'mail']) ||
    'N/A';

  const phone =
    findFirstTextByKeys(payload, ['phone', 'phoneNumber', 'mobile', 'mobile_number', 'msisdn']) ||
    'N/A';

  return { name, email, phone };
};

// 🔴 Anti-Cache logic များ ထည့်သွင်းထားသော requestJson Function
const requestJson = async (url: string, init?: RequestInit) => {
  const headers = getAntiCacheHeaders(init?.headers);
  const fetchUrl = appendAntiCacheParam(url);

  const response = await fetch(fetchUrl, {
    ...init,
    headers,
  });
  
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

export const register = async (userData: unknown) => {
  const { response, payload } = await requestJson(`${AUTH_API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Registration failed'));
  }

  return payload;
};

export const getProfile = async (): Promise<AuthProfile> => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    throw new Error('No auth token found');
  }

  const { response, payload } = await requestJson(`${AUTH_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to fetch profile'));
  }

  const profile = normalizeProfile(payload);
  localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
  return profile;
};

export const getCachedProfile = (): AuthProfile | null => {
  try {
    const raw = localStorage.getItem(AUTH_PROFILE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthProfile>;
    return {
      name: asText(parsed.name) || 'Simless User',
      email: asText(parsed.email) || 'N/A',
      phone: asText(parsed.phone) || 'N/A',
    };
  } catch {
    return null;
  }
};

export const login = async (credentials: unknown) => {
  const { response, payload } = await requestJson(`${AUTH_API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Login failed'));
  }

  const token = extractToken(payload);
  if (!token) {
    throw new Error('Login successful but token not found');
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);

  let profile: AuthProfile | null = null;
  try {
    profile = await getProfile();
  } catch {
    profile = null;
  }

  return { token, profile };
};

export const logout = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    const headers = getAntiCacheHeaders({ Authorization: `Bearer ${token}` });
    const fetchUrl = appendAntiCacheParam(`${AUTH_API_BASE}/logout`);

    await fetch(fetchUrl, {
      method: 'POST',
      headers,
    }).catch(() => undefined);
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
};

export const getTotalSparks = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    throw new Error('No auth token found');
  }

  const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
  const { response, payload } = await requestJson(`${baseUrl}/sparks/total`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to fetch sparks total'));
  }

  const obj = toObject(payload);
  const nestedData = toObject(obj?.data);
  const finalData = nestedData || obj;

  return {
    total_sparks: Number(finalData?.total_sparks) || 0,
    target_sparks: Number(finalData?.target_sparks ?? finalData?.next_tier_sparks ?? 100) || 100,
    tier_name: asText(finalData?.tier_name) || 'Member'
  };
};

// 🌟 Edit Profile API (PUT Method)
export const updateProfile = async (data: { name: string; email: string; phone: string }) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No auth token found');

  const { response, payload } = await requestJson(`${import.meta.env.VITE_PRODUCTS_API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to update profile'));
  }

  const currentCached = getCachedProfile();
  if (currentCached) {
    localStorage.setItem('authProfile', JSON.stringify({ ...currentCached, ...data }));
  }
  return payload;
};

// 🌟 Change Password API (POST Method)
export const changePasswordApi = async (passwordData: unknown) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No auth token found');

  const { response, payload } = await requestJson(`${import.meta.env.VITE_PRODUCTS_API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to change password'));
  }
  return payload;
};

// 🌟 Forgot Password API
export const forgotPasswordApi = async (email: string) => {
  const { response, payload } = await requestJson(`${import.meta.env.VITE_PRODUCTS_API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to process forgot password request'));
  }
  return payload;
};

// 🌟 Reset Password API
export const resetPasswordApi = async (resetData: unknown) => {
  const { response, payload } = await requestJson(`${import.meta.env.VITE_PRODUCTS_API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resetData),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to reset password'));
  }
  return payload;
};