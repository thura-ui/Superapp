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

const requestJson = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
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

  // Try calling Auth Me immediately, but do not block login if profile API fails.
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
    await fetch(`${AUTH_API_BASE}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
};
