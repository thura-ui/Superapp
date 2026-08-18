import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Check, ChevronDown, Globe, Signal } from 'lucide-react'; 
import { fetchProductBySlug, type ProductVariation } from '../lib/productsApi';
import { addToCart, clearCart } from '../lib/cartApi'; 
import type { Country, GlobalPlan } from '../types';

interface PlanDetailsProps {
  country?: Country;
  globalPlan?: GlobalPlan;
  onBack: () => void;
  onHome?: () => void;
  onGoToCart: () => void; 
  onRequireLogin: () => void; 
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
  description: string;
}

const getStrongestNetworkBadge = (description?: string): string => {
  const text = (description || '').toUpperCase();
  if (/\b5G\b/.test(text)) return '5G SPEED';
  if (/\b4G\b/.test(text)) return '4G SPEED';
  if (/\b3G\b/.test(text)) return '3G SPEED';
  return 'SPEED';
};

const parseDataValueMB = (dataStr: string): number => {
  const str = (dataStr || '').trim().toUpperCase();
  if (str.includes('UNLIMITED')) return 999999; 
  
  const match = str.match(/([\d.]+)\s*(GB|MB|KB)?/i);
  if (!match) return 0;
  
  const val = parseFloat(match[1]);
  const unit = (match[2] || 'GB').toUpperCase();
  
  if (unit === 'MB') return val;
  if (unit === 'KB') return val / 1024;
  return val * 1024; 
};

const mapProductVariationsToPricing = (variations: ProductVariation[]): Pricing[] => {
  const mapped = variations.map((variation, index) => {
    let dataDisplay = variation.plan_type === 'unlimited' 
      ? 'Unlimited' 
      : (variation.data_plan || variation.data || variation.data_amount || variation.quota || '').toUpperCase();

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
      plan_type: (variation.plan_type || 'fixed').trim().toLowerCase(),
      currency: variation.currency || 'MMK',
      package_code: variation.package_code || variation.product_code || variation.sku,
      external_id: variation.external_id,
      description: (variation as any).description || '',
    };
  });

  return mapped.sort((a, b) => {
    const dataA = parseDataValueMB(a.data);
    const dataB = parseDataValueMB(b.data);

    if (dataA !== dataB) {
      return dataA - dataB; 
    }
    return a.days - b.days; 
  });
};

const activeDetailPromisesMap = new Map<string, Promise<any>>();

const cleanImageUrlSlashes = (url: string | undefined): string => {
  if (!url) return '';
  return url.replace(/\\/g, ''); 
};

// 🌟 Description Parsing Section
const formatDescription = (htmlString: string) => {
  if (!htmlString) return null;
  
  const normalized = htmlString
    .replace(/\uff0c/g, ', ') 
    .replace(/\uff1a/g, ': ') 
    .replace(/\uff1b/g, '')   
    .replace(/，/g, ', ')
    .replace(/：/g, ': ')
    .replace(/；/g, '')
    .replace(/;/g, '')
    .replace(/\n/g, '<br>');
    
  const parts = normalized.split(/<br\s*\/?>/i).filter(p => p.trim() !== '');

  if (parts.length === 1 && !parts[0].toLowerCase().includes('network') && !parts[0].toLowerCase().includes('apn')) {
    return <div className="text-[13px] font-semibold text-slate-700 p-2">{parts[0]}</div>;
  }

  return (
    <ul className="space-y-3">
      {parts.map((part, index) => {
        const cleanPart = part.replace(/^\*+/, '').trim();
        const lowerPart = cleanPart.toLowerCase();

        if (lowerPart.includes('coverage and operator')) {
          return null; 
        }
        
        if (lowerPart.includes('network') || lowerPart.includes('apn')) {
          const segments = cleanPart.split(',').map(s => s.trim());
          const countryAndOperator = segments[0] || '';
          const restSegments = segments.slice(1);

          return (
            <li key={index} className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-semibold text-slate-800 text-[13px] tracking-tight">{countryAndOperator}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-[12px] font-semibold text-slate-600">
                {restSegments.map((r, i) => {
                  if (!r) return null;
                  return (
                    <span key={i} className="bg-slate-50/80 px-2.5 py-1 rounded-md border border-slate-100">
                      {r}
                    </span>
                  );
                })}
              </div>
            </li>
          );
        }

        return (
          <li key={index} className="flex items-start gap-3 text-[12px] sm:text-[13px] font-semibold text-slate-700 leading-relaxed bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-slate-100">
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-sm" />
            <span dangerouslySetInnerHTML={{ __html: cleanPart }} />
          </li>
        );
      })}
    </ul>
  );
};

export default function PlanDetails({ country, globalPlan, onBack, onHome, onGoToCart, onRequireLogin }: PlanDetailsProps) {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  
  const [heroImage, setHeroImage] = useState('');
  const [mobileHeroImage, setMobileHeroImage] = useState('');
  const [apiFlagImage, setApiFlagImage] = useState('');
  
  const [productDescription, setProductDescription] = useState<string>(''); 
  const [showCoverage, setShowCoverage] = useState(true); 
  
  const [activePlanTab, setActivePlanTab] = useState<'fixed' | 'unlimited'>('fixed');
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const lastFetchedIdRef = useRef<string>('');

  const isGlobalPlan = country?.type === 'global' || !!globalPlan;
  const displayName = isGlobalPlan ? 'Global eSIM' : (country?.name || '');
  const topFlagUrl = apiFlagImage;

  const isPopularItem = Boolean(country?.popular);
  const hasUnlimitedPlans = pricing.some(p => p.plan_type === 'unlimited');

  const handleBackClick = () => {
    if (isPopularItem && onHome) {
      onHome();
    } else {
      onBack();
    }
  };

  useEffect(() => {
    if (country && Array.isArray((country as any).countries)) {
      setCountries((country as any).countries);
    } else {
      setCountries([]);
    }
  }, [country]);

  useEffect(() => {
    if (!country?.id) return;

    if (lastFetchedIdRef.current === country.id) {
      return;
    }
    lastFetchedIdRef.current = country.id;

    async function fetchPricing() {
      setLoading(true);
      const targetSlug = country!.id;

      if (activeDetailPromisesMap.has(targetSlug)) {
        try {
          const product = await activeDetailPromisesMap.get(targetSlug);
          const raw = product && product.data ? product.data : product;
          
          setHeroImage(cleanImageUrlSlashes(raw.cover_image));
          setMobileHeroImage(cleanImageUrlSlashes(raw.mobile_cover_image));
          setApiFlagImage(cleanImageUrlSlashes(raw.flag_image));
          setProductDescription(raw.description || ''); 
          setPricing(mapProductVariationsToPricing(raw.variations || []));
          return;
        } catch (e) {
          lastFetchedIdRef.current = '';
        } finally {
          setLoading(false);
        }
        return;
      }

      const promiseFetch = fetchProductBySlug(targetSlug);
      activeDetailPromisesMap.set(targetSlug, promiseFetch);

      try {
        setHeroImage('');
        setMobileHeroImage('');
        setApiFlagImage('');
        setProductDescription(''); 
        
        const product = await promiseFetch;
        const raw = product && product.data ? product.data : product;

        if (raw) {
          setHeroImage(cleanImageUrlSlashes(raw.cover_image));
          setMobileHeroImage(cleanImageUrlSlashes(raw.mobile_cover_image));
          setApiFlagImage(cleanImageUrlSlashes(raw.flag_image));
          setProductDescription(raw.description || ''); 
          
          const apiPricing = mapProductVariationsToPricing(raw.variations || []);
          setPricing(apiPricing);
          
          const hasFixed = apiPricing.some(p => p.plan_type === 'fixed');
          if (!hasFixed && apiPricing.some(p => p.plan_type === 'unlimited')) {
            setActivePlanTab('unlimited');
          }
        }

      } catch (error) {
        console.error('Error detail:', error);
        setPricing([]);
        lastFetchedIdRef.current = '';
      } finally {
        setLoading(false);
        activeDetailPromisesMap.delete(targetSlug);
      }
    }

    fetchPricing();
  }, [country?.id]);

  const togglePlanSelection = (id: number) => {
    setSelectedPlanIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const isSelected = (id: number) => selectedPlanIds.has(id);
  const getSelectedPriceEntries = () => pricing.filter((p) => selectedPlanIds.has(p.pricing_id));
  const formatPriceValue = (amount: number, currency = 'MMK') => `${amount.toLocaleString('en-US')} ${currency}`;

  const handleBuyNowFlow = async () => {
    const selectedEntries = getSelectedPriceEntries();
    if (selectedEntries.length !== 1) {
      setOrderError('Please select exactly one plan to buy now.');
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      onRequireLogin(); 
      return;
    }

    setOrdering(true);
    setOrderError(null);

    try {
      const priceEntry = selectedEntries[0];
      await clearCart().catch(() => {});
      await addToCart(priceEntry.pricing_id, 1);
      onGoToCart();
    } catch (error) {
      console.error('Execution failure:', error);
      setOrderError('Failed to initialize secure data connection mapping.');
    } finally {
      setOrdering(false);
    }
  };

  const filteredPlans = pricing.filter(p => p.plan_type === activePlanTab);
  const selectedEntries = getSelectedPriceEntries();
  const selectedPlan = selectedEntries.length === 1 ? selectedEntries[0] : null;

  let activeDescription = productDescription;
  if (selectedPlan && selectedPlan.description) {
    activeDescription = selectedPlan.description;
  } else if (filteredPlans.length > 0 && filteredPlans[0].description) {
    activeDescription = filteredPlans[0].description;
  }

  return (
    <div className="w-full min-h-screen bg-white selection:bg-blue-500/10 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 pb-44 sm:pb-8 relative font-['Poppins'] text-slate-900">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Top Control Back Bar */}
        <div className="flex items-center justify-between pb-1 sm:pb-2">
          {/* 🌟 Letter spacing ညှိထားပါသည် (tracking-widest မှ tracking-wide) */}
          <button 
            onClick={handleBackClick} 
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[13px] sm:text-sm uppercase tracking-wide rounded-2xl flex items-center gap-2 transition-all cursor-pointer border-none outline-none font-['Poppins']"
          >
            <ChevronLeft className="w-4 h-4" /> 
            {isPopularItem ? 'Back' : 'Back to Plans'}
          </button>
          
          {topFlagUrl && (
            <div className="w-12 h-8 rounded-xl bg-white border border-slate-200 overflow-hidden p-1 flex items-center justify-center shadow-sm">
              <img src={topFlagUrl} alt="Flag" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* Web Split Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* LEFT SIDE (5 Columns) */}
          <div className="md:col-span-5 space-y-3 sm:space-y-4">
            <div className="w-full overflow-hidden rounded-[28px] sm:rounded-[32px] bg-transparent">
              
              {/* Mobile View */}
              <div className="block sm:hidden">
                {mobileHeroImage || heroImage ? (
                  <img 
                    src={mobileHeroImage || heroImage} 
                    alt={displayName} 
                    className="w-full h-auto max-h-[220px] object-contain block rounded-[28px]" 
                  />
                ) : (
                  <div className="w-full h-48 bg-slate-100 rounded-[28px] flex items-center justify-center text-slate-400 font-semibold text-[13px] uppercase tracking-wide font-['Poppins']">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Desktop / Tablet View */}
              <div className="hidden sm:block">
                {heroImage ? (
                  <img 
                    src={heroImage} 
                    alt={displayName} 
                    className="w-full h-auto object-contain block rounded-[32px]" 
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-400 font-semibold text-[13px] uppercase tracking-wide font-['Poppins']">
                    No Image Available
                  </div>
                )}
              </div>

            </div>

            <div className="px-2 text-left">
              <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide bg-blue-600/10 text-blue-600 px-2.5 py-1 rounded-md inline-block font-['Poppins']">
                Destination
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight mt-1 sm:mt-2 text-slate-900 font-['Poppins']">{displayName}</h1>
              {countries.length > 0 && (
                <p className="text-[12px] sm:text-[13px] font-semibold text-cyan-600 uppercase tracking-wide mt-1 font-['Poppins']">Multi-Regional Network Active</p>
              )}
            </div>

            {/* 🌟 COVERAGE AND OPERATOR BUTTON & CARD 🌟 */}
            {activeDescription && (
              <div className="px-2 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowCoverage(!showCoverage)}
                  className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:border-blue-400 transition-all cursor-pointer outline-none font-['Poppins']"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[13px] sm:text-sm font-semibold text-slate-900 tracking-tight">Coverage and Operator</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${showCoverage ? 'rotate-180' : ''}`} />
                </button>

                {/* 🌟 Glassmorphism Card Box Expandable Details with Custom Parser 🌟 */}
                {showCoverage && (
                  <div className="mt-2 p-3 sm:p-4 bg-white/30 backdrop-blur-md border border-slate-400/50 shadow-[0_4px_24px_rgba(0,0,0,0.05)] rounded-2xl font-['Poppins'] animate-in slide-in-from-top-2 fade-in duration-200">
                    {formatDescription(activeDescription)}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT SIDE (7 Columns) */}
          <div className="md:col-span-7 bg-slate-50/50 border border-slate-100 p-4 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[32px] space-y-4 sm:space-y-6">
            
            {hasUnlimitedPlans && (
              <div className="flex justify-center md:justify-start">
                <div className="flex flex-row flex-nowrap rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm w-full sm:w-auto">
                  <button
                    onClick={() => { setActivePlanTab('fixed'); setSelectedPlanIds(new Set()); }}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-[13px] sm:text-sm uppercase tracking-wide transition-all border-none cursor-pointer whitespace-nowrap font-['Poppins'] ${
                      activePlanTab === 'fixed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Fixed Bundles
                  </button>
                  <button
                    onClick={() => { setActivePlanTab('unlimited'); setSelectedPlanIds(new Set()); }}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-[13px] sm:text-sm uppercase tracking-wide transition-all border-none cursor-pointer whitespace-nowrap font-['Poppins'] ${
                      activePlanTab === 'unlimited' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Unlimited Data
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-3">
                <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
                <p className="text-[13px] sm:text-sm text-slate-400 font-semibold uppercase tracking-wide font-['Poppins']">Loading Tariffs Database...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-slate-400 font-semibold text-[13px] sm:text-sm uppercase tracking-wide border border-dashed border-slate-200 rounded-2xl bg-white font-['Poppins']">
                No active {activePlanTab} packages configured for this destination
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                
                {/* 🌟 Packages List with Glassmorphism 🌟 */}
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1 pb-15 sm:pb-0 scrollbar-thin">
                  {filteredPlans.map((option) => {
                    const planSelected = isSelected(option.pricing_id);
                    const hasActiveDiscount = option.discount_price !== null && option.discount_price > 0;
                    
                    return (
                      <div
                        key={option.pricing_id}
                        onClick={() => togglePlanSelection(option.pricing_id)}
                        // 🌟 Changed Here: Glassmorphism background and borders applied 🌟
                        className={`relative rounded-2xl p-3 sm:p-4 cursor-pointer transition-all duration-300 flex flex-row items-center justify-between backdrop-blur-md border ${
                          planSelected 
                            ? 'bg-white/60 border-blue-600 ring-2 ring-blue-600/20 shadow-[0_4px_16px_rgba(37,99,235,0.12)]' 
                            : 'bg-white/30 border-slate-400/50 hover:border-slate-400/70 hover:bg-white/50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
                        }`}
                      >
                        {/* Network Badge & Days */}
                        <div className="flex flex-col items-start gap-1 shrink-0 select-none">
                          <span className="text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded tracking-wide shrink-0 bg-blue-600/10 text-blue-600 font-['Poppins']">
                            {option.network_badge}
                          </span>
                          
                          <span className="text-[12px] sm:text-[13px] font-semibold tracking-wide pl-0.5 text-slate-500 font-['Poppins']">
                            {option.days > 0 ? `${option.days} Days` : 'Flexible'}
                          </span>
                        </div>

                        {/* Data Volume */}
                        <div className="flex-1 text-center min-w-0 px-2 flex flex-col items-center justify-center">
                          <span className="text-base sm:text-xl font-bold tracking-tight block truncate text-slate-900 font-['Poppins']">
                            {option.data}
                          </span>
                          {hasActiveDiscount && (
                            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-500 block mt-0.5 font-['Poppins']">
                              🔥 Promo Sale
                            </span>
                          )}
                        </div>
                        
                        {/* Price & Checkbox */}
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <span className="text-[13px] sm:text-base font-semibold whitespace-nowrap text-slate-900 font-['Poppins']">
                            {formatPriceValue(option.effective_price, option.currency)}
                          </span>
                          <div className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                            planSelected 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                              : 'border-slate-300 bg-white/60'
                          }`}>
                            {planSelected && <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {orderError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-[13px] sm:text-sm font-semibold text-rose-600 shadow-inner font-['Poppins']">
                    {orderError}
                  </div>
                )}

                {/* Desktop Buy Now Button */}
                <div className="hidden sm:block pt-2">
                  <button
                    type="button"
                    onClick={handleBuyNowFlow} 
                    disabled={ordering || selectedPlanIds.size !== 1}
                    className="w-full relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-40 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 font-semibold text-[13px] sm:text-sm uppercase tracking-wide text-white flex items-center justify-center cursor-pointer border-none font-['Poppins']"
                  >
                    {ordering ? 'Connecting to Payment...' : 'Buy Now 🚀'}
                  </button>
                </div>
                
              </div>
            )}
          </div>

        </div>
      </div>

      {/* GLASSMORPHISM MOBILE STICKY FLOATING BUY NOW BAR */}
      {selectedPlan && (
        <div className="sm:hidden fixed bottom-[88px] left-4 right-4 z-40 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[24px] p-3.5 shadow-[0_10px_30px_rgba(37,99,235,0.18)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300 font-['Poppins']">
          <div className="flex flex-col min-w-0 pl-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wide font-['Poppins']">Selected Plan</span>
            <span className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate font-['Poppins']">
              {selectedPlan.data} ({selectedPlan.days} Days)
            </span>
            <span className="text-[13px] sm:text-sm font-semibold text-blue-600 mt-0.5 font-['Poppins']">
              {formatPriceValue(selectedPlan.effective_price, selectedPlan.currency)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBuyNowFlow}
            disabled={ordering}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-[13px] sm:text-sm uppercase tracking-wide shadow-md shadow-blue-500/25 shrink-0 border-none cursor-pointer font-['Poppins']"
          >
            {ordering ? 'Processing...' : 'Buy Now 🚀'}
          </button>
        </div>
      )}
    </div>
  );
}