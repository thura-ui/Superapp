import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../lib/cartApi';

interface CartItem {
  id: number;
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
    id: toNumber(item?.id ?? item?.item_id ?? item?.cart_item_id ?? item?.variation_id, index + 1),
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

export default function CartPage({ onBack }: CartProps) {
  const [cart, setCart] = useState<CartData>({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());

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

  // Clear = remove one item from the cart.
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

  // Delete = remove all items from the cart.
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

  // Cancel = remove selected items.
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

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Cart is empty.');
      return;
    }
    alert('Checkout API will be connected in next step.');
  };

  if (loading) {
    return <div className="text-white p-10 text-center">Loading Cart...</div>;
  }

  return (
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
          <span>USD {checkoutAmount.toLocaleString()}</span>
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
  );
}
