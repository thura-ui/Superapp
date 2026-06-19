export interface CheckUsageItem {
  esimTranNo: string;
  totalDataBytes: number;
  usedDataBytes: number;
  remainingDataBytes: number;
  status: string;
}

interface CheckUsageResponse {
  usage?: CheckUsageItem[];
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

export const getEsimUsage = async (esimTranNoList: string[]): Promise<CheckUsageItem[]> => {
  if (esimTranNoList.length === 0) return [];
  // Usage API is currently disabled for local-only environment.
  return [];
};

export const createOrderEsim = async (payload: OrderEsimRequest): Promise<OrderEsimResponse> => {
  // Return local mock success for local-only environment.
  const transactionId = payload.transaction_id || `LOCAL-${Date.now()}`;
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(transactionId)}`;

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
