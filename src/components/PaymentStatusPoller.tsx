import { useState, useEffect, useRef } from 'react';
import { checkOrderPaymentStatus, cancelOrder } from '../lib/cartApi';
import { showAlert } from '../lib/customAlert';

const POLL_INTERVAL_MS = 5000;

interface PaymentStatusResponse {
  order?: {
    id: number;
    order_number: string;
    status: string;
    payment_status?: string;
    customer_email?: string;
  };
  payment_status?: string;
}

interface PaymentStatusPollerProps {
  orderNumber: string;
  onStatusUpdate?: (statusText: string) => void;
  onSuccess: () => void;
  onTimeout: () => void;
  onCancel?: () => void;
  timeoutMs?: number;
  onStatusChange?: (status: string) => void;
}

export default function PaymentStatusPoller({
  orderNumber,
  onStatusUpdate,
  onSuccess,
  onTimeout,
  onCancel,
  timeoutMs = 2 * 60 * 1000, // 2 minutes
  onStatusChange,
}: PaymentStatusPollerProps) {
  const [isPolling, setIsPolling] = useState(true);
  const [statusText, setStatusText] = useState('Checking payment');
  const [error, setError] = useState<string | null>(null);

  // Function & Value များကို Ref ဖြင့် ထိန်းထားခြင်းကြောင့် Dependency အပြောင်းအလဲကြောင့် Re-trigger မဖြစ်တော့ပါ
  const orderNumberRef = useRef(orderNumber);
  const timeoutMsRef = useRef(timeoutMs);
  const onSuccessRef = useRef(onSuccess);
  const onTimeoutRef = useRef(onTimeout);
  const onCancelRef = useRef(onCancel);
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    orderNumberRef.current = orderNumber;
  }, [orderNumber]);

  useEffect(() => {
    timeoutMsRef.current = timeoutMs;
  }, [timeoutMs]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const getNormalizedOrderStatus = (data: PaymentStatusResponse): string => {
    return String(
      data?.order?.payment_status ?? data?.payment_status ?? data?.order?.status ?? ''
    ).trim().toLowerCase();
  };

  const isCompletedStatus = (data: PaymentStatusResponse): boolean => {
    const orderStatus = String(data?.order?.status ?? '').trim().toLowerCase();
    const paymentStatus = String(data?.order?.payment_status ?? data?.payment_status ?? '').trim().toLowerCase();
    const completedSet = new Set(['paid', 'complete', 'completed', 'success', 'succeeded']);
    return completedSet.has(orderStatus) || completedSet.has(paymentStatus);
  };

  const toDisplayStatus = (normalizedStatus: string): string => {
    if (!normalizedStatus) return 'Checking payment';
    if (normalizedStatus === 'paid') return 'Paid';
    if (normalizedStatus === 'complete' || normalizedStatus === 'completed') return 'Completed';
    if (normalizedStatus === 'failed') return 'Failed';
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') return 'Cancelled';
    if (normalizedStatus === 'pending') return 'Waiting for payment';
    return normalizedStatus;
  };

  useEffect(() => {
    const currentOrderNumber = orderNumberRef.current;
    if (!currentOrderNumber) return;

    let isActive = true;
    let isRequestInFlight = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextPoll = () => {
      if (!isActive) return;
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    const poll = async () => {
      if (!isActive || isRequestInFlight) {
        scheduleNextPoll();
        return;
      }

      isRequestInFlight = true;

      try {
        const data = await checkOrderPaymentStatus(orderNumberRef.current);
        
        const normalizedStatus = getNormalizedOrderStatus(data);
        const displayStatus = toDisplayStatus(normalizedStatus);
        setStatusText(displayStatus);
        onStatusUpdateRef.current?.(displayStatus);
        onStatusChangeRef.current?.(displayStatus);

        if (isCompletedStatus(data)) {
          setIsPolling(false);
          isActive = false;
          const email = data?.order?.customer_email || 'N/A';
          
          showAlert('order-success', () => {
            onSuccessRef.current();
          }, {
            message: email && email !== 'N/A'
              ? `Your order was successful. Please check your email: ${email}\n\nWould you like to return to the plans page?`
              : 'Your order was successful. Please check your email.\n\nWould you like to return to the plans page?',
            confirmText: 'Yes',
            cancelText: 'No',
            onCancel: () => {
              onCancelRef.current?.();
            },
          });
          return;
        }
      } catch (err) {
        console.error('Payment status polling failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to check payment status');
      } finally {
        isRequestInFlight = false;
      }

      scheduleNextPoll();
    };

    // ပထမအကြိမ် စတင်စစ်ဆေးပြီးမှ ၅ စက္ကန့်စီ ခြားပြီး နောက်ဆက်တွဲ ခေါ်ဆိုပါမည်
    poll();

    const timeoutId = setTimeout(async () => {
      if (!isActive) return;
      if (pollTimer) clearTimeout(pollTimer);
      isActive = false;
      setIsPolling(false);
      try {
        await cancelOrder(orderNumberRef.current);
      } catch (err) {
        console.error('Failed to auto-cancel timed out order:', err);
      }
      showAlert('timeout', () => {
        onTimeoutRef.current();
      });
    }, timeoutMsRef.current);

    return () => {
      isActive = false;
      if (pollTimer) clearTimeout(pollTimer);
      clearTimeout(timeoutId);
    };
  }, []); // 🌟 Empty Array ထားရှိခြင်းဖြင့် Component စဖွင့်ချိန် ၁ ကြိမ်သာ Timer တည်ဆောက်ပါတော့မည်

  return (
    <div className="space-y-1 text-center py-2">
      <p className="text-slate-500 font-bold text-xs tracking-wide">
        Order Number: <span className="text-slate-800 font-extrabold">{orderNumber}</span>
      </p>
      
      {error && (
        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl">
          {error}
        </div>
      )}

      {!error && !isPolling && (
        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-xl">
          Order completed!
        </div>
      )}
    </div>
  );
}