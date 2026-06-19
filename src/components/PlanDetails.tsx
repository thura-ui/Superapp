import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, CheckCircle, X, Download, Info, Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchProductBySlug, type ProductVariation } from '../lib/productsApi';
import { addToCart } from '../lib/cartApi';
import { createOrderEsim } from '../lib/externalApi';
import type { Country, GlobalPlan } from '../types';

interface PlanDetailsProps {
  country?: Country;
  globalPlan?: GlobalPlan;
  onBack: () => void;
  onGoToCart?: () => void;
}

interface Pricing {
  pricing_id: number;
  price: number;
  discount_price: number | null;
  discount_start_at: string | null;
  discount_end_at: string | null;
  effective_price: number;
  data: string;
  days: number;
  network_badge: string;
  plan_type: string;
  currency?: string;
  package_code?: string;
  external_id?: string;
}

const getStrongestNetworkBadge = (description?: string): string => {
  const text = (description || '').toUpperCase();
  if (/\b5G\b/.test(text)) {
    return '5G SPEED';
  }
  if (/\b4G\b/.test(text)) {
    return '4G SPEED';
  }
  if (/\b3G\b/.test(text)) {
    return '3G SPEED';
  }
  return 'SPEED';
};

const mapProductVariationsToPricing = (variations: ProductVariation[]): Pricing[] => {
  const mapped = variations.map((variation, index) => {
    let dataDisplay = '';
    if (variation.plan_type === 'unlimited') {
      dataDisplay = 'Unlimited';
    } else {
      dataDisplay = (variation.data_plan || variation.data || variation.data_amount || variation.quota || '').toUpperCase();
    }

    return {
      pricing_id: typeof variation.id === 'number' ? variation.id : index + 1,
      price: Number(variation.price ?? 0),
      discount_price: variation.discount_price ? Number(variation.discount_price) : null,
      discount_start_at: variation.discount_start_at || null,
      discount_end_at: variation.discount_end_at || null,
      effective_price: Number(variation.effective_price ?? variation.price_mmk ?? variation.price ?? 0),
      data: dataDisplay,
      days: variation.days ?? variation.validity_days ?? 0,
      network_badge: getStrongestNetworkBadge(variation.description),
      plan_type: variation.plan_type || 'fixed',
      currency: variation.currency || 'MMK',
      package_code: variation.package_code || variation.product_code || variation.sku,
      external_id: variation.external_id,
    };
  });

  return [...mapped].sort((a, b) => {
    if (a.plan_type === 'unlimited' && b.plan_type !== 'unlimited') return 1;
    if (a.plan_type !== 'unlimited' && b.plan_type === 'unlimited') return -1;
    return 0;
  });
};

export default function PlanDetails({ country, globalPlan, onBack, onGoToCart }: PlanDetailsProps) {
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<number>>(new Set());
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [apiFlagImageUrl, setApiFlagImageUrl] = useState('');
  const [apiCountryFlagUrl, setApiCountryFlagUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<{
    summary: { date: string; data: string; country: string; price: string; iccid?: string | null };
    qr: string | null;
  } | null>(null);
  
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [purchaseSummary, setPurchaseSummary] = useState<{
    date: string;
    data: string;
    country: string;
    price: string;
    iccid?: string | null;
    validityDate?: string | null;
  } | null>(null);
  const downloadFormRef = useRef<HTMLDivElement | null>(null);

  const LOCAL_HISTORY_KEY = 'esimOrderHistory';
  const isGlobalPlan = country?.type === 'global' || !!globalPlan;
  const displayName = isGlobalPlan ? 'Global eSIM' : (country?.name || '');
  const topFlagUrl = apiCountryFlagUrl;
  const heroImage = apiFlagImageUrl;

  useEffect(() => {
    if (country && Array.isArray((country as any).countries)) {
      setCountries((country as any).countries);
    } else {
      setCountries([]);
    }
  }, [country]);

  useEffect(() => {
    async function fetchPricing() {
      if (country) {
        try {
          setApiFlagImageUrl('');
          setApiCountryFlagUrl('');
          const product = await fetchProductBySlug(country.id);
          setApiFlagImageUrl(product.flag_image_url || '');
          setApiCountryFlagUrl(product.country_flag_url || '');
          const apiPricing = mapProductVariationsToPricing(product.variations);
          setPricing(apiPricing);
        } catch (error) {
          console.error('Error fetching product detail:', error);
          setApiFlagImageUrl('');
          setApiCountryFlagUrl('');
          setPricing([]);
        } finally {
          setLoading(false);
        }
      }
    }
    setLoading(true);
    fetchPricing();
  }, [country?.id]);

  const togglePlanSelection = (id: number) => {
    setSelectedPlanIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isSelected = (id: number) => selectedPlanIds.has(id);
  
  const getSelectedPriceEntries = () => {
    return pricing.filter((p) => selectedPlanIds.has(p.pricing_id));
  };

  const getCurrentPrice = () => {
    if (loading) return 0;
    const entries = getSelectedPriceEntries();
    return entries.reduce((sum, p) => sum + p.effective_price, 0);
  };

  const formatPriceValue = (amount: number, currency = 'MMK') => {
    return `${amount.toLocaleString('en-US')} ${currency}`;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('en-US')} MMK`;
  };

  const isValidPin = (value: string) => /^\d{4,6}$/.test(value);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleBuyNow = async (userEmail: string) => {
    const selectedEntries = getSelectedPriceEntries();
    if (selectedEntries.length !== 1) {
      setOrderError('Please select exactly one plan to buy now.');
      return;
    }
    setOrdering(true);
    setOrderError(null);

    try {
      const priceEntry = selectedEntries[0];
      if (!priceEntry || !priceEntry.package_code) {
        throw new Error('Selected package profile is incomplete or unavailable.');
      }

      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const finalPrice = priceEntry.effective_price;
      const periodNum = priceEntry.days;

      const result = await createOrderEsim({
        package_code: priceEntry.package_code,
        quantity: 1,
        transaction_id: transactionId,
        price: finalPrice,
        period_num: periodNum,
        email: userEmail,
      });

      if (!result.success || !result.esim_data?.esimList?.[0]) {
        throw new Error(result.message || 'Failed to process order from upstream server.');
      }

      const qrCodeUrl = result.esim_data.esimList[0].qrCode;
      const iccidList = result.esim_data.esimList.map((e: any) => e.iccid).filter(Boolean);

      const purchaseDate = new Date();

      setPendingPurchase({
        summary: {
          date: purchaseDate.toLocaleDateString(),
          data: priceEntry?.data || '',
          country: displayName || 'Global eSIM',
          price: formatPriceValue(finalPrice, priceEntry.currency),
          iccid: iccidList.length > 0 ? iccidList.join(', ') : null,
        },
        qr: qrCodeUrl,
      });
      setCountdown(7);
    } catch (error) {
      console.error('Order error:', error);
      setOrderError(error instanceof Error ? error.message : 'Failed to process order');
    } finally {
      setOrdering(false);
    }
  };

  const handlePinContinue = () => {
    const trimmedPin = pin.trim();
    if (!isValidPin(trimmedPin)) {
      setPinError('Please enter a 4-6 digit PIN.');
      return;
    }

    setPinError(null);
    setShowPinPrompt(false);
    setOrderError(null);
    
    const selectedEntries = getSelectedPriceEntries();
    const priceEntry = selectedEntries[0];
    const purchaseDate = new Date();
    const targetPrice = priceEntry ? priceEntry.effective_price : getCurrentPrice();
    
    const purchaseData = {
      id: `local-${purchaseDate.getTime()}`,
      package_code: `${displayName || 'Global eSIM'} ${priceEntry?.data || ''}`.trim(),
      quantity: 1,
      order_no: `LOCAL-${purchaseDate.getTime()}`,
      esim_count: 1,
      status: 'active',
      purchase_date: purchaseDate.toISOString(),
      days: priceEntry?.days || 30,
      data_amount: priceEntry?.data || '',
      country_name: displayName || 'Global eSIM',
      flagUrl: topFlagUrl || null,
      country_code: country?.code || null,
      price: formatPriceValue(targetPrice, priceEntry?.currency),
      qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=Simless%20eSIM'
    };

    try {
      const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify([purchaseData, ...parsed]));
    } catch (error) {
      console.error('Failed to save history:', error);
    }

    setPendingPurchase({
      summary: {
        date: purchaseDate.toLocaleDateString(),
        data: priceEntry?.data || '',
        country: displayName || 'Global eSIM',
        price: formatPriceValue(targetPrice, priceEntry?.currency),
        iccid: null,
      },
      qr: 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=Simless%20eSIM',
    });
    setCountdown(7);
  };

  const handleDownloadForm = async () => {
    if (!downloadFormRef.current) return;
    try {
      const canvas = await html2canvas(downloadFormRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imageData, 'PNG', 0, 0, 210, 297);
      pdf.save(`esim-qr-form-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Failed to download form:', error);
    }
  };

  const handleAddToCart = async () => {
    if (selectedPlanIds.size === 0) return;
    try {
      for (const planId of selectedPlanIds) {
        await addToCart(planId, 1);
      }
      alert(`Successfully added ${selectedPlanIds.size} plans to cart!`);
      setSelectedPlanIds(new Set());
      onGoToCart?.();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add some plans to cart.');
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (pendingPurchase) {
        setPurchaseSummary(pendingPurchase.summary);
        setQrCode(pendingPurchase.qr);
        setPendingPurchase(null);
      }
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown, pendingPurchase]);

  const fixedPlans = pricing.filter(p => p.plan_type !== 'unlimited');
  const unlimitedPlans = pricing.filter(p => p.plan_type === 'unlimited');

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] z-10">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-teal-400/10 rounded-full blur-[100px]" />
      </div>

      {showPinPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button onClick={() => setShowPinPrompt(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-black text-gray-900">Confirm payment</h2>
              <p className="text-sm text-gray-500 font-medium">Enter payment credentials to authorize your travel eSIM profile.</p>
              <div className="inline-flex bg-blue-50 text-blue-800 px-4 py-2 rounded-xl font-black text-sm">
                Total: {formatPrice(getCurrentPrice())}
              </div>
            </div>
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">PIN Code</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setPinError(null); }}
                  placeholder="Enter secure numeric PIN"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-bold text-gray-800 text-center tracking-widest focus:outline-none focus:border-blue-500"
                />
                {pinError && <p className="mt-1.5 text-xs text-red-500 font-bold">{pinError}</p>}
              </div>
              <button onClick={handlePinContinue} disabled={ordering} className="w-full py-3.5 bg-blue-600 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-colors uppercase tracking-wider text-sm">
                Authorize Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {countdown !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-white/95 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Provisioning Your Remote Network Profile</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center font-black text-2xl text-gray-800">
                00
              </div>
              <span className="font-bold text-gray-400">:</span>
              <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center font-black text-2xl text-gray-800">
                00
              </div>
              <span className="font-bold text-gray-400">:</span>
              <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center font-black text-2xl text-blue-600">
                {countdown.toString().padStart(2, '0')}
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Communicating with global carrier network...</p>
          </div>
        </div>
      )}

      {qrCode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setQrCode(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none">Order Securely Placed</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">Profile is ready for wireless download</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-left text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Country</span>
                  <span className="font-black text-gray-800">{purchaseSummary?.country}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Data Profile</span>
                  <span className="font-black text-gray-800">{purchaseSummary?.data} (30 Days)</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-200/60">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">ICCID Identifier</span>
                  <span className="font-mono font-bold text-gray-700 break-all">89852342022379407991</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-white shadow-inner">
                <img src={qrCode} alt="eSIM Cellular QR code matrix" className="w-44 h-44 mx-auto" />
                <p className="text-xs font-black text-gray-700 mt-3">Scan matrix from another device to install instantly</p>
              </div>

              <button onClick={handleDownloadForm} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-black text-white text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl">
                <Download className="w-4 h-4" /> Download PDF Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto min-h-screen pb-40 relative z-10">
        <div className="relative h-64 overflow-hidden bg-slate-900">
          {/* Background CSS Image Binding with dynamic payload update */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-65 transition-all duration-300" 
            style={{ backgroundImage: `url(${heroImage})` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#042f2e]/90" />

          <div className="relative h-full flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <button onClick={onBack} className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {topFlagUrl && (
                <div className="w-12 h-8 rounded-lg bg-white/10 border border-white/20 overflow-hidden p-1 flex items-center justify-center">
                  <img src={topFlagUrl} alt="Target country entity flag" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
              <h1 className="text-2xl font-black text-white tracking-tight">{displayName}</h1>
              {countries.length > 0 && (
                <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mt-1">Multi-Regional Coverage Active</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {loading ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent" />
              <p className="mt-3 text-xs text-cyan-200/60 font-bold uppercase tracking-widest">Fetching Dynamic Tariffs Profile...</p>
            </div>
          ) : pricing.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center">
              <p className="text-lg font-black text-white">No Active Plans Configured</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Dynamic connection profiles are currently migrating under this code.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* FIXED DATA PLANS SECTION */}
              {fixedPlans.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-black text-cyan-200/60 uppercase tracking-widest px-1">Fixed Volume Bundles</p>
                  {fixedPlans.map((option) => {
                    const planSelected = isSelected(option.pricing_id);
                    const hasActiveDiscount = option.discount_price !== null && option.discount_price > 0;
                    
                    return (
                      <div
                        key={option.pricing_id}
                        onClick={() => togglePlanSelection(option.pricing_id)}
                        className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer border transition-all flex items-center justify-between backdrop-blur-md ${
                          planSelected
                            ? 'bg-slate-400/30 border-blue-500 shadow-lg shadow-blue-500/10' 
                            : 'bg-slate-300/10 border-white/10 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-2.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider ${
                              planSelected ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
                            }`}>
                              {option.network_badge}
                            </span>
                            <span className="text-lg font-black text-white tracking-tight">
                              {option.data}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <button type="button" className={`text-[10px] font-black px-3 py-1 rounded-full border tracking-wide uppercase ${
                              planSelected ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white/5 text-gray-300 border-white/10'
                            }`} onClick={(e) => e.stopPropagation()}>
                              Plan Details
                            </button>
                            {hasActiveDiscount && (
                              <span className="text-[10px] text-amber-300 font-bold mt-1.5 block">
                                🔥 Promo Sale: {formatDate(option.discount_start_at)} - {formatDate(option.discount_end_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-2.5 shrink-0 ml-4">
                          <span className="text-xs font-black text-gray-400 tracking-wider">
                            {option.days > 0 ? `${option.days} Days` : 'Flexible'}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              {hasActiveDiscount ? (
                                <>
                                  <span className="text-xs text-gray-400 line-through font-bold">
                                    {formatPriceValue(option.price, option.currency)}
                                  </span>
                                  <span className="text-lg font-black text-amber-400 drop-shadow-sm">
                                    {formatPriceValue(option.discount_price!, option.currency)}
                                  </span>
                                </>
                              ) : (
                                <span className={`text-lg font-black ${planSelected ? 'text-blue-400' : 'text-white'}`}>
                                  {formatPriceValue(option.price, option.currency)}
                                </span>
                              )}
                            </div>
                            {planSelected ? (
                              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-500 border border-blue-500 text-white transition-all shadow-sm">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-md border border-gray-500 bg-white/5 transition-all" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* UNLIMITED DATA PLANS SECTION */}
              {unlimitedPlans.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-black text-teal-300 uppercase tracking-widest px-1">Unlimited Connections</p>
                  {unlimitedPlans.map((option) => {
                    const planSelected = isSelected(option.pricing_id);
                    const hasActiveDiscount = option.discount_price !== null && option.discount_price > 0;
                    
                    return (
                      <div
                        key={option.pricing_id}
                        onClick={() => togglePlanSelection(option.pricing_id)}
                        className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer border transition-all flex items-center justify-between backdrop-blur-md ${
                          planSelected
                            ? 'bg-slate-400/30 border-blue-500 shadow-lg shadow-blue-500/10' 
                            : 'bg-slate-300/10 border-white/10 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-2.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider ${
                              planSelected ? 'bg-blue-600 text-white' : 'bg-teal-500/20 text-teal-300'
                            }`}>
                              {option.network_badge}
                            </span>
                            <span className="text-lg font-black text-white tracking-tight">
                              {option.data}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <button type="button" className={`text-[10px] font-black px-3 py-1 rounded-full border tracking-wide uppercase ${
                              planSelected ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white/5 text-gray-300 border-white/10'
                            }`} onClick={(e) => e.stopPropagation()}>
                              Plan Details
                            </button>
                            {hasActiveDiscount && (
                              <span className="text-[10px] text-amber-300 font-bold mt-1.5 block">
                                🔥 Promo Sale: {formatDate(option.discount_start_at)} - {formatDate(option.discount_end_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-2.5 shrink-0 ml-4">
                          <span className="text-xs font-black text-gray-400 tracking-wider">
                            {option.days > 0 ? `${option.days} Days` : 'Flexible'}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              {hasActiveDiscount ? (
                                <>
                                  <span className="text-xs text-gray-400 line-through font-bold">
                                    {formatPriceValue(option.price, option.currency)}
                                  </span>
                                  <span className="text-lg font-black text-amber-400 drop-shadow-sm">
                                    {formatPriceValue(option.discount_price!, option.currency)}
                                  </span>
                                </>
                              ) : (
                                <span className={`text-lg font-black ${planSelected ? 'text-blue-400' : 'text-white'}`}>
                                  {formatPriceValue(option.price, option.currency)}
                                </span>
                              )}
                            </div>
                            {planSelected ? (
                              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-500 border border-blue-500 text-white transition-all shadow-sm">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-md border border-gray-500 bg-white/5 transition-all" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {orderError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                  <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Transaction Fault</p>
                  <p className="text-xs font-bold text-rose-200/70 mt-1">{orderError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-4">
                <button
                  type="button"
                  disabled={ordering || selectedPlanIds.size === 0}
                  onClick={handleAddToCart}
                  className="py-3.5 rounded-full border-2 border-blue-500/30 bg-white/5 backdrop-blur-md font-black text-xs uppercase tracking-widest text-blue-400 disabled:opacity-20 transition-all hover:bg-white/10"
                >
                  Add to Cart ({selectedPlanIds.size})
                </button>

                <button
                  type="button"
                  onClick={() => { setShowPinPrompt(true); setPinError(null); }}
                  disabled={ordering || selectedPlanIds.size !== 1}
                  className="relative overflow-hidden rounded-full shadow-xl transition-all group disabled:opacity-30"
                >
                  <div className={`absolute inset-0 ${selectedPlanIds.size === 1 ? 'bg-blue-600' : 'bg-white/10'}`} />
                  <div className="relative py-3.5 font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-1.5">
                    {ordering ? <span>Verifying...</span> : <span>Buy Now 🚀</span>}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
