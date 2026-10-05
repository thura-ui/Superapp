export interface CheckUsageItem {
  esimTranNo: string;
  totalDataBytes: number;
  usedDataBytes: number;
  remainingDataBytes: number;
  status: string;
}

export interface OrderEsimRequest {
  package_code: string;
  quantity: number;
  transaction_id: string;
  price: number;
  period_num: number;
  email?: string;
}

export interface OrderEsimResponse {
  success: boolean;
  esim_data?: {
    esimList?: Array<{
      qrCode?: string;
      iccid?: string;
    }>;
  };
  error?: string;
  details?: string;
}

// 🔴 Anti-Cache URL Parameter Helper
const appendAntiCacheParam = (url: string) => {
  const timestamp = new Date().getTime();
  return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
};

// 🔴 Anti-Cache Headers Helper
const getAntiCacheHeaders = (existingHeaders?: HeadersInit): Headers => {
  const headers = new Headers(existingHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return headers;
};

export const getEsimUsage = async (esimTranNoList: string[]): Promise<CheckUsageItem[]> => {
  if (esimTranNoList.length === 0) return [];
  
  /* 
  🔴 အနာဂတ်တွင် Real Usage API ချိတ်ဆက်သည့်အခါ အောက်ပါ Anti-Cache fetch ပုံစံအတိုင်း အသုံးပြုနိုင်ပါသည်။
  
  const token = localStorage.getItem('authToken');
  const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
  const fetchUrl = appendAntiCacheParam(`${baseUrl}/esim/usage`);
  const headers = getAntiCacheHeaders({ Authorization: `Bearer ${token}` });

  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ esimTranNoList })
  });
  */

  // Usage API is currently disabled for local-only environment.
  return [];
};

export const createOrderEsim = async (payload: OrderEsimRequest): Promise<OrderEsimResponse> => {
  // Return local mock success for local-only environment.
  const transactionId = payload.transaction_id || `LOCAL-${Date.now()}`;
  
  // 🔴 QR Code URL တွင်ပါ Cache မမိစေရန် Timestamp (Cache-buster) ထည့်ပေးထားပါသည်
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(transactionId)}&t=${Date.now()}`;

  return {
    success: true,
    esim_data: {
      esimList: [
        {
          qrCode,
          iccid: `LOCAL-${Date.now()}`,
        },
      ],
    },
  };
};