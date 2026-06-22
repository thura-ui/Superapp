import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Minus, Plus, X, ExternalLink } from 'lucide-react';
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  fetchPaymentMethods,
  submitCheckout,
  type PaymentMethod,
  type CheckoutResponse,
} from '../lib/cartApi';

interface CartItem {
  id: number;
  variation_id?: number;
  name: string;
  price: number;
  quantity: number;
  days: number;
  currency: string;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
}

interface CartProps {
  onBack: () => void;
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

  const items: CartItem[] = rawItems.map((item: any, index: number) => ({
    id: toNumber(item?.id ?? item?.item_id ?? item?.cart_item_id, index + 1),
    variation_id: toNumber(item?.variation_id ?? item?.id, index + 1),
    name: String(item?.name ?? item?.product_name ?? item?.title ?? item?.variation_name ?? 'eSIM Plan'),
    price: toNumber(item?.price ?? item?.unit_price ?? item?.effective_price, 0),
    quantity: Math.max(1, toNumber(item?.quantity, 1)),
    days: toNumber(item?.days ?? item?.validity_days ?? item?.duration_days, 0),
    currency: String(item?.currency ?? payload?.currency ?? 'USD'),
  }));

  const subtotal = toNumber(
    payload?.subtotal ?? payload?.data?.subtotal ?? payload?.cart?.subtotal ?? payload?.total,
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  return { items, subtotal };
};

// ─── Checkout Modal ────────────────────────────────────────────────────────────

interface CheckoutModalProps {
  cartItems: CartItem[];
  selectedItemIds: Set<number>;
  totalAmount: number;
  currency: string;
  onClose: () => void;
}

function CheckoutModal({ cartItems, selectedItemIds, totalAmount, currency, onClose }: CheckoutModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [methodsError, setMethodsError] = useState<string | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<CheckoutResponse | null>(null);

  useEffect(() => {
    setLoadingMethods(true);
    fetchPaymentMethods()
      .then(setPaymentMethods)
      .catch((err) => setMethodsError(String(err?.message ?? 'Failed to load payment methods')))
      .finally(() => setLoadingMethods(false));
  }, []);

  const itemsToCheckout = useMemo(() => {
    const source = selectedItemIds.size > 0
      ? cartItems.filter((item) => selectedItemIds.has(item.id))
      : cartItems;
    return source.map((item) => ({
      variation_id: item.variation_id ?? item.id,
      quantity: item.quantity,
    }));
  }, [cartItems, selectedItemIds]);

  const handleSubmit = async () => {
    if (!selectedMethod) return;
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const result = await submitCheckout({
        items: itemsToCheckout,
        payment_method: selectedMethod,
        customer_phone: phone,
        order_note: note || undefined,
      });
      setPaymentResult(result);

      const deeplink = result?.payment?.deeplink;
      if (deeplink) {
        window.location.href = deeplink;
      }
    } catch (err: any) {
      setCheckoutError(String(err?.message ?? 'Checkout failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const deeplink = paymentResult?.payment?.deeplink;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#042f2e] rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">Checkout</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Order summary */}
        <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/10">
          <p className="text-cyan-100/60 text-xs font-bold uppercase tracking-wider mb-2">Order Summary</p>
          {itemsToCheckout.length === 0 && (
            <p className="text-white/50 text-sm">No items selected.</p>
          )}
          {cartItems
            .filter((item) => selectedItemIds.size === 0 || selectedItemIds.has(item.id))
            .map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-white py-1">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="whitespace-nowrap font-bold">{item.currency} {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-black text-white">
            <span>Total</span>
            <span>{currency} {totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mb-5">
          <p className="text-cyan-100/60 text-xs font-bold uppercase tracking-wider mb-3">Payment Method</p>

          {loadingMethods && (
            <div className="text-white/50 text-sm py-4 text-center">Loading payment methods…</div>
          )}

          {methodsError && (
            <div className="text-rose-300 text-sm py-3 px-4 bg-rose-500/10 rounded-xl border border-rose-300/20">
              {methodsError}
            </div>
          )}

          {!loadingMethods && !methodsError && paymentMethods.length === 0 && (
            <div className="text-white/50 text-sm py-3 text-center">No payment methods available.</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const active = selectedMethod === method.code;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.code)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                    active
                      ? 'bg-cyan-500/20 border-cyan-400/60 text-white'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {method.logo_url && (
                    <img src={method.logo_url} alt={method.name} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
                  )}
                  <span className="font-bold text-sm truncate">{method.name}</span>
                  {active && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone */}
        <div className="mb-5">
          <label className="text-cyan-100/60 text-xs font-bold uppercase tracking-wider block mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxxx"
            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60"
          />
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="text-cyan-100/60 text-xs font-bold uppercase tracking-wider block mb-2">
            Order Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Please activate as soon as possible"
            rows={2}
            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 resize-none"
          />
        </div>

        {/* Error */}
        {checkoutError && (
          <div className="mb-4 text-rose-300 text-sm px-4 py-3 bg-rose-500/10 rounded-xl border border-rose-300/20">
            {checkoutError}
          </div>
        )}

        {/* Payment deeplink fallback button */}
        {deeplink && (
          <a
            href={deeplink}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black bg-emerald-600 text-white mb-4 hover:bg-emerald-500 transition-colors"
          >
            <ExternalLink size={18} />
            Open Payment App
          </a>
        )}

        {/* Submit */}
        {!paymentResult && (
          <button
            disabled={!selectedMethod || submitting || itemsToCheckout.length === 0}
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl font-black text-white bg-blue-600 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              'Place Order'
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Cart Page ─────────────────────────────────────────────────────────────────

export default function CartPage({ onBack }: CartProps) {
  const [cart, setCart] = useState<CartData>({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const [showCheckout, setShowCheckout] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      const normalized = normalizeCart(response);
      setCart(normalized);
      setSelectedItemIds((prev) => {
        const next = new Set<number>();
        normalized.items.forEach((item) => {
          if (prev.has(item.id)) next.add(item.id);
        });
        return next;
      });
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart({ items: [], subtotal: 0 });
      setSelectedItemIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setBusy(true);
    try {
      await updateCartItem(itemId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Failed to update item quantity:', error);
    } finally {
      setBusy(false);
    }
  };

  const handleClearItem = async (itemId: number) => {
    setBusy(true);
    try {
      await removeCartItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Failed to clear cart item:', error);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAll = async () => {
    setBusy(true);
    try {
      await clearCart();
      setCart({ items: [], subtotal: 0 });
      setSelectedItemIds(new Set());
    } catch (error) {
      console.error('Failed to delete all cart items:', error);
    } finally {
      setBusy(false);
    }
  };

  const toggleSelectItem = (itemId: number) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleCancelSelected = async () => {
    if (selectedItemIds.size === 0) {
      alert('Please select at least one item to cancel.');
      return;
    }

    setBusy(true);
    try {
      for (const itemId of selectedItemIds) {
        await removeCartItem(itemId);
      }
      await loadCart();
    } catch (error) {
      console.error('Failed to cancel selected items:', error);
    } finally {
      setBusy(false);
    }
  };

  const selectedSubtotal = useMemo(() => {
    if (selectedItemIds.size === 0) return 0;
    return cart.items
      .filter((item) => selectedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart.items, selectedItemIds]);

  const checkoutAmount = selectedItemIds.size > 0 ? selectedSubtotal : cart.subtotal;
  const checkoutCurrency = cart.items[0]?.currency ?? 'USD';

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Cart is empty.');
      return;
    }
    setShowCheckout(true);
  };

  if (loading) {
    return <div className="text-white p-10 text-center">Loading Cart...</div>;
  }

  return (
    <>
      <div className="fixed inset-0 bg-[#042f2e] text-white p-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} aria-label="Back to previous screen">
            <ChevronLeft />
          </button>
          <h1 className="text-2xl font-black">Cart ({cart.items.length})</h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-cyan-100/80 font-bold">
            Cart is empty
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.has(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="mt-1 w-5 h-5"
                    />
                    <div>
                      <p className="font-bold text-lg">{item.name}</p>
                      <p className="text-cyan-100/70 text-sm">{item.days > 0 ? `${item.days} Days` : 'Flexible validity'}</p>
                      <p className="text-cyan-200 font-bold mt-1">{item.currency} {item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={busy || item.quantity <= 1}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 disabled:opacity-40 flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-12 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black">
                      {item.quantity}
                    </div>
                    <button
                      disabled={busy}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 disabled:opacity-40 flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    disabled={busy}
                    onClick={() => handleClearItem(item.id)}
                    className="px-4 py-2 rounded-xl text-sm font-black bg-rose-500/20 text-rose-200 border border-rose-300/20 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-white/20 pt-6 space-y-4">
          <div className="flex justify-between text-xl font-black">
            <span>Total</span>
            <span>{checkoutCurrency} {checkoutAmount.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              disabled={busy || cart.items.length === 0}
              onClick={handleDeleteAll}
              className="py-3 rounded-2xl font-black bg-rose-700/70 disabled:opacity-40"
            >
              Clear
            </button>
            <button
              disabled={busy || cart.items.length === 0}
              onClick={handleCheckout}
              className="py-3 rounded-2xl font-black bg-blue-600 disabled:opacity-40"
            >
              Check out
            </button>
            <button
              disabled={busy || selectedItemIds.size === 0}
              onClick={handleCancelSelected}
              className="py-3 rounded-2xl font-black bg-white/10 border border-white/15 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          cartItems={cart.items}
          selectedItemIds={selectedItemIds}
          totalAmount={checkoutAmount}
          currency={checkoutCurrency}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
