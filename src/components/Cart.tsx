import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Minus, Plus, X, CreditCard, Phone, Loader2, QrCode, Copy, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import {
  getCart,
  updateCartItem,
  fetchPaymentMethods,
  submitCheckout,
  cancelOrder,
  clearCart,
  type PaymentMethod,
  type CheckoutResponse,
} from '../lib/cartApi';
import { showAlert } from '../lib/customAlert';
import PaymentStatusPoller from './PaymentStatusPoller';

interface CartItem {
  id: number;
  variation_id?: number;
  name: string;
  price: number;
  quantity: number;
  days: number;
  currency: string;
  packageTypeLabel: string;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
}

interface CartProps {
  onBack: () => void;
  onGoProduct: () => void; 
  onGoHome: () => void; 
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCart = (payload: any): CartData => {
  const rawItems =
    (Array.isArray(payload?.items) && payload.items) ||
    (Array.isArray(payload?.data?.items) && payload.data.items) ||
    (Array.isArray(payload?.cart?.items) && payload.cart.items) ||
    (Array.isArray(payload?.cart_items) && payload.cart_items) ||
    [];

  const items: CartItem[] = rawItems.map((item: any, index: number) => {
    const rawName = String(item?.name ?? item?.product_name ?? item?.title ?? 'eSIM Plan');
    const daysCount = toNumber(item?.days ?? item?.validity_days ?? item?.duration_days ?? item?.variation?.days, 0);

    const rawPlanType = String(
      item?.plan_type ?? 
      item?.variation?.plan_type ?? 
      item?.variation_plan_type ?? 
      item?.type ?? 
      ''
    ).toLowerCase().trim();

    const savedPackageLabel = localStorage.getItem('selected_package_label');

    let packageTypeLabel = '';

    if (rawPlanType === 'daypass' || rawPlanType === 'day_pass' || rawPlanType === 'daily') {
      packageTypeLabel = daysCount > 0 ? `DAYPASS (${daysCount} DAYS)` : 'DAYPASS';
    } else if (rawPlanType === 'unlimited') {
      packageTypeLabel = daysCount > 0 ? `UNLIMITED (${daysCount} DAYS)` : 'UNLIMITED';
    } else if (rawPlanType === 'fixed' || rawPlanType === 'bundle') {
      packageTypeLabel = daysCount > 0 ? `${daysCount} DAYS FIXED BUNDLE` : 'FIXED BUNDLE';
    } else if (savedPackageLabel) {
      packageTypeLabel = savedPackageLabel;
    } else {
      packageTypeLabel = daysCount > 0 ? `${daysCount} DAYS FIXED BUNDLE` : 'FIXED BUNDLE';
    }

    return {
      id: toNumber(item?.id ?? item?.item_id ?? item?.cart_item_id, index + 1),
      variation_id: toNumber(item?.variation_id ?? item?.id, index + 1),
      name: rawName,
      price: toNumber(item?.price ?? item?.unit_price ?? item?.effective_price, 0),
      quantity: Math.max(1, toNumber(item?.quantity, 1)),
      days: daysCount,
      currency: String(item?.currency ?? payload?.currency ?? 'MMK'),
      packageTypeLabel,
    };
  });

  const subtotal = toNumber(
    payload?.subtotal ?? payload?.data?.subtotal ?? payload?.cart?.subtotal ?? payload?.total,
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  return { items, subtotal };
};

export default function CartPage({
  onBack,
  onGoProduct,
  onGoHome,
}: CartProps) {
  const [cart, setCart] = useState<CartData>({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<CheckoutResponse | null>(null);
  const [waitingOrderNumber, setWaitingOrderNumber] = useState<string | null>(null);
  
  const [qrStringData, setQrStringData] = useState<string | null>(null);
  const [copiedQr, setCopiedQr] = useState(false);

  const [currentApiStatusText, setCurrentApiStatusText] = useState<string>('WAITING FOR PAYMENT');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const isWaitingPayment = !!waitingOrderNumber;
  const hasFetchedRef = useRef(false);

  const initializeCheckoutData = async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setLoading(true);
    setLoadingMethods(true);
    setMethodsError(null);

    try {
      const cartResponse = await getCart();
      const normalizedCart = normalizeCart(cartResponse);
      setCart(normalizedCart);

      const methods = await fetchPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) setSelectedMethod(methods[0].code);

    } catch (error: any) {
      console.error('Initialization error:', error);
      setMethodsError(String(error?.message || 'Failed to sync parameters.'));
    } finally {
      setLoading(false);
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    initializeCheckoutData();
  }, []);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setBusy(true);
    try {
      await updateCartItem(itemId, quantity);
      const response = await getCart();
      setCart(normalizeCart(response));
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const handleExitCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setCart({ items: [], subtotal: 0 });
      setWaitingOrderNumber(null);
      setPaymentResult(null);
      setQrStringData(null);
      onGoHome();
    }
  };

  const handleCancelOrderFlow = async () => {
    if (!waitingOrderNumber) {
      await handleExitCart();
      return;
    }

    setCancellingOrder(true);
    try {
      await cancelOrder(waitingOrderNumber);
    } catch (error) {
      console.error('Failed to execute cancel flow:', error);
    } finally {
      await handleExitCart();
      setCancellingOrder(false);
    }
  };

  const handlePlaceOrderSubmit = async () => {
    if (!phone.trim()) {
      setCheckoutError('Please enter your phone number.');
      return;
    }
    setSubmitting(true);
    setCheckoutError(null);
    setQrStringData(null);

    try {
      const result = await submitCheckout({
        payment_method: selectedMethod,
        customer_phone: phone.trim(),
      });
      
      setPaymentResult(result);

      const rawQrData = result?.payment?.qr_data || (result as any)?.qr_data;
      if (rawQrData) {
        setQrStringData(rawQrData);
      }

      if (result?.order?.order_number) {
        setWaitingOrderNumber(result.order.order_number);
        if (result.order.status) {
          setCurrentApiStatusText(result.order.status.toUpperCase());
        }
      }

      if (result?.payment?.deeplink) {
        window.open(result.payment.deeplink, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      let rawMessage = err?.message || '';
      if (rawMessage.startsWith('Checkout failed:')) {
        rawMessage = rawMessage.replace('Checkout failed:', '').trim();
      }
      setCheckoutError(rawMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const copyQrDataToClipboard = () => {
    if (qrStringData) {
      navigator.clipboard.writeText(qrStringData);
      setCopiedQr(true);
      setTimeout(() => setCopiedQr(false), 2000);
    }
  };

  if (loading) {
    return <div className="text-slate-900 p-10 text-center font-bold">Loading Parameters...</div>;
  }

  return (
    <div className="mobile-typography-fix fixed inset-0 z-40 flex items-center justify-center bg-slate-100/60 backdrop-blur-sm p-3 sm:p-4 overflow-hidden selection:bg-blue-500/10 pt-12 pb-24 sm:py-6 font-['Poppins']">
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-[28px] sm:rounded-[32px] p-3.5 sm:p-6 border border-slate-200 shadow-2xl space-y-2.5 sm:space-y-4">
        
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h3 className="text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap text-slate-900 leading-none">
              Confirm Payment
            </h3>
          </div>
          
          <button onClick={() => { void handleExitCart(); }} className="p-1 hover:bg-slate-50 rounded-full border-none bg-transparent cursor-pointer text-slate-400 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Cart Item Row List */}
        {cart.items.length > 0 && (
          <div className="space-y-2">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-slate-50/60 p-2.5 sm:p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate">{item.name}</p>
                  
                  <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    {item.packageTypeLabel}
                  </p>
                  
                  <p className="text-blue-600 font-bold text-xs">{item.price.toLocaleString()} MMK</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={busy || item.quantity <= 1}
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white border border-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <div className="w-7 h-6 sm:w-8 sm:h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                    {item.quantity}
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white border border-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BILLING INFORMATION */}
        <div className="border-t border-dashed border-slate-200 pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap leading-none">
              Billing Information
            </h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide">Select Payment Method</label>
            {loadingMethods && <div className="text-slate-400 text-xs py-1">Loading payment …</div>}
            {methodsError && <div className="text-rose-500 text-xs p-2 bg-rose-50 border border-rose-100 rounded-xl">{methodsError}</div>}
            
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const active = selectedMethod === method.code;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.code)}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-50/50 border-blue-600 text-slate-900 shadow-sm'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {method.logo_url && <img src={method.logo_url} alt="" className="w-4 h-4 object-contain shrink-0" />}
                      <span className="font-bold text-[11px] sm:text-xs truncate">{method.name}</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${active ? 'border-blue-600 text-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                      {active && <div className="w-1 h-1 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-0.5">
                <Phone className="w-3 h-3 shrink-0" /> Enter Your Mobile Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 sm:py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          {checkoutError && (
            <div className="text-rose-600 text-[11px] px-3 py-2 bg-rose-50 rounded-xl border border-rose-100 font-extrabold shadow-inner leading-normal">
              Order Fail: Your {checkoutError}
            </div>
          )}

          <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-baseline">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Price</span>
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{cart.subtotal.toLocaleString()} MMK</span>
          </div>

          {!paymentResult && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                disabled={!selectedMethod || submitting}
                onClick={handlePlaceOrderSubmit}
                className="w-full py-2.5 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-blue-600 disabled:opacity-40 transition-opacity border-none cursor-pointer shadow-md hover:bg-blue-700"
              >
                {submitting ? 'Verifying…' : 'Place Order'}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={handleCancelOrderFlow}
                className="w-full py-2.5 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-rose-600 bg-rose-50 border-none cursor-pointer shadow-sm hover:bg-rose-100 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>

      </div>

      {/* MMQR CODE & PROCESSING POPUP MODEL LAYER */}
      {isWaitingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-5 border border-slate-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl py-2.5 px-3 space-y-0.5">
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">ORDER STATUS</p>
              <p className="text-xs text-amber-700 font-bold">Waiting For Your Payment</p>
              
              <div className="pt-1 border-t border-amber-200/50 mt-1">
                <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md tracking-wide inline-block">
                  {currentApiStatusText}
                </span>
              </div>
            </div>

            {qrStringData ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Scan MMQR To Pay</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG
                    value={qrStringData}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <button
                  type="button"
                  onClick={copyQrDataToClipboard}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedQr ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied QR Code!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy Raw MMQR Data</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Payment Processing
                </div>
                <p className="text-[11px] font-medium text-slate-400 px-2 leading-relaxed">
                  သင့်ရဲ့ ငွေပေးချေမှုကို စောင့်ဆိုင်းနေပါသည်။
                </p>
              </div>
            )}

            {/* Poller Network Event Connector */}
            <div className="border-t border-slate-100 pt-1">
              <PaymentStatusPoller
                orderNumber={waitingOrderNumber}
                onSuccess={() => {
                  setWaitingOrderNumber(null);
                  setPaymentResult(null);
                  setQrStringData(null);

                  showAlert('confirm-order-success', () => {
                    onGoProduct();
                  }, {
                    onCancel: () => {
                      onGoHome();
                    }
                  });
                }}
                
                onTimeout={() => { 
                  setWaitingOrderNumber(null); 
                  setPaymentResult(null); 
                  setQrStringData(null);
                  showAlert('timeout', () => {
                    onGoHome();
                  }); 
                }}
                onCancel={() => { void handleCancelOrderFlow(); }}
                onStatusChange={(status) => {
                  if (status) setCurrentApiStatusText(status.toUpperCase());
                }}
              />
            </div>

            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                disabled={cancellingOrder}
                onClick={handleCancelOrderFlow}
                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border-none cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {cancellingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling Profile...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}