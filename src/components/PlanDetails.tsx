import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Check, ChevronDown, Globe, Sun, Package, Wifi, Infinity as InfinityIcon, Smartphone, Zap } from 'lucide-react'; 
import { fetchProductBySlug, type ProductVariation } from '../lib/productsApi';
import { addToCart, clearCart } from '../lib/cartApi'; 
import type { Country, GlobalPlan } from '../types';
import EsimCheck from './EsimCheck';

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

const FALLBACK_COVERAGE: Record<string, string> = {
  'China': 'Network Coverage, China-China Mobile, Network-5G;',
  'Indonesia': 'Network Coverage, Indonesia-XL, Network-5G, APN-Indosat 5G, Telkomsel 5G;',
  'Thailand': 'Network Coverage, Thailand-TrueMove H, Network-5G, APN-dtac 5G;',
  'Japan': 'Network Coverage, Japan-SoftBank, Network-5G;',
  'Vietnam': 'Network Coverage, Vietnam-Vinaphone, Network-5G;',
  'Singapore': 'Network Coverage, Singapore-SIMBA, Network-4G, APN-StarHub 4G;',
  'Malaysia': 'Network Coverage, Malaysia-Maxis, Network-5G, APN-Celcom 5G, DiGi 5G;',
  'S.Korea': 'Network Coverage, South Korea-SKT, Network-4G;',
  'South Korea': 'Network Coverage, South Korea-SKT, Network-4G;',
  'Korea': 'Network Coverage, South Korea-SKT, Network-4G;',
  'Taiwan': 'Network Coverage, Taiwan-Chunghwa Telecom, Network-5G;',
  'Turkey': 'Network Coverage, Turkey-Türk Telekom, Network-5G, APN-Vodafone 5G, Turkcell 5G;'
};

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

const normalizePlanType = (rawType: string | undefined): string => {
  const type = (rawType || '').trim().toLowerCase();
  if (type === 'daypass' || type === 'day_pass' || type === 'daily') {
    return 'daypass';
  }
  if (type === 'unlimited') {
    return 'unlimited';
  }
  return 'fixed';
};

const mapProductVariationsToPricing = (variations: ProductVariation[]): Pricing[] => {
  const mapped = variations.map((variation, index) => {
    const rawPlanType = normalizePlanType(variation.plan_type);
    
    let rawDataStr = (variation.data_plan || variation.data || variation.data_amount || variation.quota || '').toUpperCase();
    rawDataStr = rawDataStr
      .replace(/\/DAY PASS/g, '')
      .replace(/\/DAY/g, '')
      .replace(/\/DAILY/g, '')
      .trim();

    let dataDisplay = rawPlanType === 'unlimited' ? 'Unlimited' : rawDataStr;

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
      plan_type: rawPlanType,
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

export default function PlanDetails({ country, globalPlan, onBack, onHome, onGoToCart, onRequireLogin }: PlanDetailsProps) {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  
  const [heroImage, setHeroImage] = useState('');
  const [mobileHeroImage, setMobileHeroImage] = useState('');
  const [apiFlagImage, setApiFlagImage] = useState('');
  
  const [productDescription, setProductDescription] = useState<string>(''); 
  const [showCoverage, setShowCoverage] = useState(false); 
  
  const [showEsimCheckDrawer, setShowEsimCheckDrawer] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showActivateGuide, setShowActivateGuide] = useState(false);

  const [activeDeviceTab, setActiveDeviceTab] = useState<'ios' | 'samsung' | 'android'>('ios');
  const [activeActivateDeviceTab, setActiveActivateDeviceTab] = useState<'ios' | 'samsung'>('ios');

  const [activePlanTab, setActivePlanTab] = useState<'daypass' | 'fixed' | 'unlimited'>('daypass');
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const lastFetchedIdRef = useRef<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [country?.id, globalPlan]);

  const isRegionOrGlobal = country?.type === 'global' || country?.type === 'regional' || !!globalPlan;
  const displayName = isRegionOrGlobal && country?.type === 'global' ? 'Global eSIM' : (country?.name || '');
  const topFlagUrl = apiFlagImage;

  const isPopularItem = Boolean(country?.popular);

  const hasFixedPlans = pricing.some(p => p.plan_type === 'fixed');
  const hasDayPassPlans = pricing.some(p => p.plan_type === 'daypass');
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
          
          const mappedPricing = mapProductVariationsToPricing(raw.variations || []);
          setPricing(mappedPricing);

          if (mappedPricing.some(p => p.plan_type === 'daypass')) {
            setActivePlanTab('daypass');
          } else if (mappedPricing.some(p => p.plan_type === 'fixed')) {
            setActivePlanTab('fixed');
          } else if (mappedPricing.some(p => p.plan_type === 'unlimited')) {
            setActivePlanTab('unlimited');
          }
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
          
          const hasDayPass = apiPricing.some(p => p.plan_type === 'daypass');
          const hasFixed = apiPricing.some(p => p.plan_type === 'fixed');
          const hasUnlimited = apiPricing.some(p => p.plan_type === 'unlimited');

          if (hasDayPass) {
            setActivePlanTab('daypass');
          } else if (hasFixed) {
            setActivePlanTab('fixed');
          } else if (hasUnlimited) {
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
  const formatPriceValue = (amount: number, currency = 'MMK') => {
    const formattedAmount = amount.toLocaleString('en-US');
    return `${formattedAmount}\u00A0${currency}`;
  };

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

  let activeDescription = '';
  if (selectedPlan && selectedPlan.description && selectedPlan.description.trim() !== '') {
    activeDescription = selectedPlan.description;
  } else if (filteredPlans.length > 0 && filteredPlans[0].description && filteredPlans[0].description.trim() !== '') {
    activeDescription = filteredPlans[0].description;
  } else {
    activeDescription = productDescription;
  }

  const matchedKey = Object.keys(FALLBACK_COVERAGE).find(key => 
    displayName.toLowerCase() === key.toLowerCase() || 
    displayName.toLowerCase().includes(key.toLowerCase())
  );

  const isUselessDescription = !activeDescription || 
                               activeDescription.trim() === '' || 
                               !activeDescription.toLowerCase().includes('coverage');

  if (isUselessDescription && matchedKey) {
    activeDescription = FALLBACK_COVERAGE[matchedKey];
  }

  const formatDescription = (rawDesc: string) => {
    if (!rawDesc) return null;

    const cleanStr = rawDesc
      .replace(/\\uff0c/gi, ', ')
      .replace(/\uff0c/g, ', ')
      .replace(/\\uff1a/gi, ': ')
      .replace(/\uff1a/g, ': ')
      .replace(/\\uff1b/gi, '')
      .replace(/\uff1b/g, '')
      .replace(/，/g, ', ')
      .replace(/：/g, ': ')
      .replace(/；/g, '')
      .replace(/;/g, '');

    const lines = cleanStr.split(/<br\s*\/?>/i).map(l => l.trim()).filter(Boolean);

    let speedInfo = '';
    let hotspotInfo = '';
    const coverageList: { country: string; operator: string; network: string }[] = [];

    lines.forEach(line => {
      const lower = line.toLowerCase();

      if (lower.includes('high speed data') || lower.includes('throttled')) {
        speedInfo = line.replace(/^\*+/, '').trim();
      } 
      else if (lower.includes('hotspot')) {
        hotspotInfo = line.replace(/^\*+/, '').trim();
      } 
      else if (!lower.includes('coverage and operator')) {
        const segments = line.replace(/^\*+/, '').split(',').map(s => s.trim());
        
        let cName = '';
        let opName = '';
        let netBadge = '';

        segments.forEach(seg => {
          if (seg.includes('-') && !seg.toLowerCase().includes('network-') && !seg.toLowerCase().includes('apn-')) {
            const [c, op] = seg.split('-').map(x => x.trim());
            if (c) cName = c;
            if (op) opName = op;
          } else if (seg.toLowerCase().includes('network-')) {
            netBadge = seg.replace(/network-/i, '').trim();
          }
        });

        if (cName || opName) {
          coverageList.push({
            country: cName || displayName,
            operator: opName || cName,
            network: netBadge || '4G/5G'
          });
        }
      }
    });

    return (
      <div className="space-y-3 font-['Poppins'] text-left">
        {coverageList.length > 0 && (
          <div className="bg-white/90 rounded-2xl p-3.5 sm:p-4 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2.5">
            {coverageList.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between gap-4 ${
                  index !== coverageList.length - 1 ? 'pb-2 border-b border-slate-100' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-bold text-slate-800 text-[13px] sm:text-[14px] tracking-tight">
                    {item.country}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[12px] font-semibold text-slate-700">
                    {item.operator}
                  </span>
                  {item.network && (
                    <span className="px-1.5 py-0.5 rounded border border-slate-300 text-[10px] font-bold text-slate-600 bg-white leading-none shadow-2xs">
                      {item.network}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {speedInfo && (
          <div className="bg-white/90 rounded-2xl p-3.5 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <p className="text-[12px] sm:text-[13px] font-medium text-slate-700 leading-relaxed">
              {speedInfo}
            </p>
          </div>
        )}

        {hotspotInfo && (
          <div className="bg-white/90 rounded-2xl p-3 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-[12px] font-semibold text-slate-700 capitalize">
              {hotspotInfo}
            </span>
          </div>
        )}
      </div>
    );
  };

  const availableCategoriesCount = [hasFixedPlans, hasDayPassPlans, hasUnlimitedPlans].filter(Boolean).length;

  const InstallGuideAccordion = () => (
    <div className="w-full pt-1">
      <button
        type="button"
        onClick={() => setShowInstallGuide(!showInstallGuide)}
        className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-200/80 rounded-2xl transition-all cursor-pointer outline-none font-['Poppins'] text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[12px] sm:text-[13px] font-bold text-slate-900">How to install eSIM?</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Stable Wi-Fi / Mobile Data required</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${showInstallGuide ? 'rotate-180' : ''}`} />
      </button>

      {showInstallGuide && (
        <div className="mt-2.5 p-3.5 sm:p-4 bg-white border border-blue-200 rounded-2xl space-y-3 sm:space-y-3.5 animate-in slide-in-from-top-2 fade-in duration-200 font-['Poppins']">
          <div className="p-2.5 sm:p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[10.5px] sm:text-xs text-amber-900 font-medium leading-relaxed">
            <strong className="font-bold">Note:</strong> Install your eSIM 1 or 2 days before your trip. A stable connection is necessary, preferably using WiFi or Mobile Data.
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-xl bg-blue-50/60 border border-blue-200 p-1 shadow-none w-full font-['Poppins']">
            <button
              type="button"
              onClick={() => setActiveDeviceTab('ios')}
              className={`w-full py-1.5 sm:py-2 px-1 rounded-lg font-bold text-[10px] sm:text-[12px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center font-['Poppins'] ${
                activeDeviceTab === 'ios' 
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                  : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
              }`}
            >
              <h4 className="whitespace-nowrap text-[10px] sm:text-[13px]">iOS</h4>
            </button>
            <button
              type="button"
              onClick={() => setActiveDeviceTab('samsung')}
              className={`w-full py-1.5 sm:py-2 px-1 rounded-lg font-bold text-[10px] sm:text-[12px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center font-['Poppins'] ${
                activeDeviceTab === 'samsung' 
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                  : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
              }`}
            >
              <h4 className="whitespace-nowrap font-bold text-[10px] sm:text-[13px]">Samsung</h4>
            </button>
            <button
              type="button"
              onClick={() => setActiveDeviceTab('android')}
              className={`w-full py-1.5 sm:py-2 px-1 rounded-lg font-bold text-[10px] sm:text-[12px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center font-['Poppins'] ${
                activeDeviceTab === 'android' 
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                  : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
              }`}
            >
              <h4 className="whitespace-nowrap text-[10px] sm:text-[13px]">Other Phones</h4>
            </button>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-medium pt-1">
            {activeDeviceTab === 'ios' && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="font-bold text-slate-900">Go to Settings &gt; Cellular / Mobile Data &gt; Add eSIM</p>
                <ol className="list-decimal pl-4 space-y-1 sm:space-y-1.5">
                  <li>Choose <strong>Use QR code</strong>, then scan the QR code from another device.</li>
                  <li>Tap <strong>Activate eSIM</strong>, then tap <strong>Continue</strong> and complete installation steps.</li>
                  <li>eSIM will not be <strong>activated</strong> in Myanmar. You can only install it first.</li>
                </ol>
              </div>
            )}

            {activeDeviceTab === 'samsung' && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="font-bold text-slate-900">Go to Settings &gt; Connections &gt; SIM manager &gt; Add eSIM</p>
                <ol className="list-decimal pl-4 space-y-1 sm:space-y-1.5">
                  <li>Choose <strong>Scan QR code</strong> from another device and complete installation.</li>
                  <li>Turn on <strong>ONLY Simless travel eSIM</strong> and turn off your primary line.</li>
                  <li>eSIM will not be <strong>activated</strong> in Myanmar. You can only install it first.</li>
                </ol>
              </div>
            )}

            {activeDeviceTab === 'android' && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="font-bold text-slate-900">Go to Settings &gt; Mobile Network &gt; Manage eSIM &gt; Add eSIM</p>
                <ol className="list-decimal pl-4 space-y-1 sm:space-y-1.5">
                  <li>Choose <strong>Scan QR code</strong> from another device and complete installation.</li>
                  <li>eSIM will not be <strong>activated</strong> in Myanmar. You can only install it first.</li>
                  <li>Turn on <strong>ONLY Simless travel eSIM</strong> and turn off your primary line.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const EsimActivateAccordion = () => (
    <div className="w-full pt-1 border-t border-blue-100 font-['Poppins']">
      <button
        type="button"
        onClick={() => setShowActivateGuide(!showActivateGuide)}
        className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-200/80 rounded-2xl transition-all cursor-pointer outline-none font-['Poppins'] text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[12px] sm:text-[13px] font-bold text-slate-900">How to activate eSIM?</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Steps to turn on travel eSIM on arrival</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${showActivateGuide ? 'rotate-180' : ''}`} />
      </button>

      {showActivateGuide && (
        <div className="mt-2.5 p-3.5 sm:p-4 bg-white border border-blue-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2 fade-in duration-200 font-['Poppins']">
          
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-blue-50/60 border border-blue-200 p-1 w-full font-['Poppins']">
            <button
              type="button"
              onClick={() => setActiveActivateDeviceTab('ios')}
              className={`w-full py-1.5 sm:py-2 px-1 rounded-lg font-bold text-[10px] sm:text-[12px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center font-['Poppins'] ${
                activeActivateDeviceTab === 'ios' 
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                  : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
              }`}
            >
              iPhone
            </button>
            <button
              type="button"
              onClick={() => setActiveActivateDeviceTab('samsung')}
              className={`w-full py-1.5 sm:py-2 px-1 rounded-lg font-bold text-[10px] sm:text-[12px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center font-['Poppins'] ${
                activeActivateDeviceTab === 'samsung' 
                  ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                  : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
              }`}
            >
              Samsung
            </button>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-medium pt-1">
            {activeActivateDeviceTab === 'ios' && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="font-bold text-slate-900">
                  Go to Settings &gt; Cellular or Mobile Service &gt; Under SIMs
                </p>
                <ul className="list-disc pl-4 space-y-1 sm:space-y-1.5">
                  <li>Off all Myanmar lines.</li>
                  <li>Only on <strong>travel eSIM line</strong> and <strong>On Data Roaming</strong>.</li>
                </ul>
              </div>
            )}

            {activeActivateDeviceTab === 'samsung' && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="font-bold text-slate-900">
                  Go to Settings &gt; Connections &gt; SIM Manager
                </p>
                <ul className="list-disc pl-4 space-y-1 sm:space-y-1.5">
                  <li>Off Myanmar SIMs and eSIMs.</li>
                  <li>Only on <strong>travel eSIM line</strong> and <strong>On Data Roaming</strong>.</li>
                </ul>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );

  return (
    /* 🌟 Top Navigation အောက် မဝင်သွားစေရန် pt-20 (Mobile) နှင့် pt-28 (Desktop) သို့ ပြောင်းထားပါသည် 🌟 */
    <div className="mobile-typography-fix w-full min-h-screen bg-white selection:bg-blue-100 pt-20 sm:pt-28 pb-10 sm:pb-8 px-3 sm:px-6 lg:px-8 relative font-['Poppins'] text-slate-900">
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6">
        
        {/* Web Split Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
          
          {/* LEFT SIDE */}
          <div className="md:col-span-5 space-y-3 sm:space-y-4 w-full">
            
            {/* 1. BACK BUTTON SECTION */}
            <div className={`w-full flex items-center transition-all duration-300 pb-1 ${
              isRegionOrGlobal 
                ? 'justify-start pl-0 sm:pl-6' 
                : 'justify-start pl-0'
            }`}>
              <button 
                onClick={handleBackClick} 
                className="group px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-md border border-blue-200 hover:border-blue-400 text-slate-700 hover:text-slate-900 hover:bg-white font-semibold text-[12px] sm:text-sm uppercase tracking-wide rounded-lg flex items-center justify-center gap-0 transition-all duration-300 shadow-xs active:scale-95 cursor-pointer outline-none font-['Poppins']"
              >
                <ChevronLeft className="w-4 h-4 text-blue-500 group-hover:text-blue-600 stroke-[2.5] transition-colors duration-300 shrink-0" /> 
                <span className="leading-none">{isPopularItem ? 'Back' : 'Back'}</span>
              </button>
            </div>

            {/* Image Container */}
            <div className="w-full overflow-hidden rounded-[20px] sm:rounded-[32px] bg-transparent">
              <div className="block sm:hidden w-full">
                {mobileHeroImage || heroImage ? (
                  <img 
                    src={mobileHeroImage || heroImage} 
                    alt={displayName} 
                    className="w-full h-auto max-h-[190px] sm:max-h-[220px] object-cover block rounded-[20px]" 
                  />
                ) : (
                  <div className="w-full h-44 bg-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 font-semibold text-[12px] uppercase tracking-wide font-['Poppins']">
                    No Image Available
                  </div>
                )}
              </div>

              <div className="hidden sm:block w-full">
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

            {/* 2. DESTINATION SECTION */}
            <div className={`w-full px-0 text-left space-y-1.5 transition-all duration-300 ${
              isRegionOrGlobal ? 'pl-0 sm:pl-5' : 'pl-0'
            }`}>
              <span className="text-[10px] sm:text-[12px] font-semibold uppercase tracking-wide bg-blue-50/80 border border-blue-200 text-blue-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md inline-block font-['Poppins']">
                Destination
              </span>
              
              <div className="flex items-start gap-3 pt-1 w-full">
                {topFlagUrl && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-xs shrink-0 mt-0.5">
                    <img 
                      src={topFlagUrl} 
                      alt={`${displayName} Flag`} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                )}

                <div className="flex flex-col min-w-0 flex-1 space-y-1">
                  <h1 className="text-base sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-['Poppins'] leading-snug break-words">
                    {displayName.includes('+') 
                      ? displayName.split('+').join(' + ') 
                      : displayName.replace(/\s*\(\d+\s*countri.*?\)/gi, '')}
                  </h1>

                  {displayName.match(/\(\d+\s*countri.*?\)/i) && (
                    <div className="pt-0.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 font-['Poppins']">
                        {displayName.match(/\(\d+\s*countri.*?\)/i)?.[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {countries.length > 0 && (
                <p className="text-[11px] sm:text-[13px] font-semibold text-blue-600 uppercase tracking-wide pt-1 font-['Poppins']">
                  Multi-Regional Network Active
                </p>
              )}
            </div>

            {/* 3. COVERAGE AND NETWORK SECTION */}
            {activeDescription && (
              <div className={`md:col-span-5 space-y-3 sm:space-y-4 w-full transition-all duration-300 ${
                isRegionOrGlobal 
                ? 'pl-0 sm:pl-5' 
                : 'pl-0 sm:pl-0 sm:mr-6'
              }`}>
                <button
                  onClick={() => setShowCoverage(!showCoverage)}
                  className="w-full flex items-center justify-between p-3 bg-white border border-blue-200 rounded-xl shadow-[0_2px_10px_rgba(59,130,246,0.05)] hover:border-blue-300 transition-all cursor-pointer outline-none font-['Poppins']"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-[12px] sm:text-sm font-semibold text-slate-900 tracking-tight">Coverage and Network</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform duration-300 ${showCoverage ? 'rotate-180' : ''}`} />
                </button>

                {showCoverage && (
                  <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    {formatDescription(activeDescription)}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="w-full md:col-span-7 bg-white border border-blue-200 p-2.5 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[32px] space-y-3 shadow-sm">
            
            {availableCategoriesCount > 0 && (
              <div className="w-full">
                <div className={`grid gap-1 rounded-xl bg-blue-50/60 border border-blue-200 p-1 shadow-none w-full ${
                  availableCategoriesCount === 3 
                    ? 'grid-cols-[1fr_1.3fr_1fr] sm:grid-cols-3' 
                    : availableCategoriesCount === 2 
                      ? 'grid-cols-2' 
                      : 'grid-cols-1'
                }`}>
                  {hasDayPassPlans && (
                    <button
                      type="button"
                      onClick={() => { setActivePlanTab('daypass'); setSelectedPlanIds(new Set()); }}
                      className={`w-full py-1.5 sm:py-2.5 px-1.5 sm:px-2 rounded-lg font-bold text-[8.5px] xs:text-[9.5px] sm:text-[13px] uppercase tracking-tighter transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 font-['Poppins'] ${
                        activePlanTab === 'daypass' 
                        ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                        : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
                      }`}
                    >
                      <Sun className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                        activePlanTab === 'daypass' ? 'text-blue-600' : 'text-blue-400'
                      }`} />
                      <span className="whitespace-nowrap">DAYPASS</span>
                    </button>
                  )}
                  {hasFixedPlans && (
                    <button
                      type="button"
                      onClick={() => { setActivePlanTab('fixed'); setSelectedPlanIds(new Set()); }}
                      className={`w-full py-1.5 sm:py-2.5 px-1.5 sm:px-2 rounded-lg font-bold text-[8.5px] xs:text-[9.5px] sm:text-[13px] uppercase tracking-tighter transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 font-['Poppins'] ${
                        activePlanTab === 'fixed' 
                        ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                        : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
                      }`}
                    >
                      <Package className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                        activePlanTab === 'fixed' ? 'text-blue-600' : 'text-blue-400'
                      }`} />
                      <span className="whitespace-nowrap">FIXED BUNDLES</span>
                    </button>
                  )}
                  {hasUnlimitedPlans && (
                    <button
                      type="button"
                      onClick={() => { setActivePlanTab('unlimited'); setSelectedPlanIds(new Set()); }}
                      className={`w-full py-1.5 sm:py-2.5 px-1.5 sm:px-2 rounded-lg font-bold text-[8.5px] xs:text-[9.5px] sm:text-[13px] uppercase tracking-tighter transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 font-['Poppins'] ${
                        activePlanTab === 'unlimited' 
                        ? 'bg-blue-100 border border-blue-300 text-blue-700 shadow-none' 
                        : 'border border-transparent text-slate-600 hover:bg-blue-100/50 hover:text-blue-600'
                      }`}
                    >
                      <InfinityIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5] ${
                        activePlanTab === 'unlimited' ? 'text-blue-600' : 'text-blue-500'
                      }`} />
                      <span className="whitespace-nowrap">UNLIMITED</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Options List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-blue-400 border-r-transparent" />
                <p className="text-[12px] text-blue-500 font-semibold uppercase tracking-wide font-['Poppins']">Please wait...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium text-[12px] uppercase tracking-wide border border-dashed border-blue-200 rounded-xl bg-blue-50/20 font-['Poppins']">
                No active {activePlanTab === 'daypass' ? 'Day Pass' : activePlanTab} packages configured
              </div>
            ) : (
              <div className="w-full space-y-2.5">
                <div className="grid grid-cols-1 gap-2 max-h-[300px] sm:max-h-[420px] overflow-y-auto scrollbar-hide pb-10 sm:pb-0">
                  {filteredPlans.map((option) => {
                    const planSelected = isSelected(option.pricing_id);
                    const rawData = (option.data || '').trim();
                    const isUnlimited = rawData.toUpperCase() === 'UNLIMITED';
                    const match = rawData.match(/^([\d.]+)\s*(GB|MB|KB)?$/i);
                    const numPart = match ? match[1] : rawData;
                    
                    let unitPart = match && match[2] ? match[2].toUpperCase() : '';
                    if (option.plan_type === 'daypass' && unitPart) {
                      unitPart += '/Day';
                    }

                    return (
                      <div
                        key={option.pricing_id}
                        onClick={() => togglePlanSelection(option.pricing_id)}
                        className={`w-full rounded-xl p-2.5 sm:p-4 cursor-pointer transition-all duration-300 flex items-center justify-between backdrop-blur-md border ${
                          planSelected 
                            ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-300 shadow-none' 
                            : 'bg-white border-blue-100 hover:border-blue-300 shadow-none'
                        }`}
                      >
                        {/* Column 1 */}
                        <div className="w-[30%] sm:w-1/3 flex items-center justify-start sm:justify-center pl-6 sm:pl-8 select-none">
                          <span className="text-[12px] sm:text-[14px] font-medium text-slate-800 font-['Poppins'] leading-tight whitespace-nowrap">
                            {option.days > 0 ? `${option.days} Days` : 'Flexible'}
                          </span>
                        </div>

                        {/* Column 2 */}
                        <div className="w-[30%] sm:w-1/3 flex flex-col items-center justify-center pl-10 sm:pl-4 select-none text-center">
                          <div className="flex items-center justify-center w-full">
                            {isUnlimited ? (
                              <span className="text-[12px] sm:text-[14px] font-medium text-slate-800 font-['Poppins'] leading-tight whitespace-nowrap">
                                Unlimited
                              </span>
                            ) : (
                              <span className="text-[12px] sm:text-[14px] font-medium text-slate-800 font-['Poppins'] leading-tight whitespace-nowrap">
                                {match ? `${numPart}${unitPart}` : rawData}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Column 3 */}
                        <div className="w-[40%] sm:w-1/3 flex items-center justify-end sm:justify-center pl-2 sm:pl-16 sm:pr-0 select-none gap-2 sm:gap-4">
                          <span className="text-[12px] sm:text-[14px] font-medium whitespace-nowrap text-slate-800 font-['Poppins'] leading-tight whitespace-numeric">
                            {formatPriceValue(option.effective_price, option.currency)}
                          </span>
                          
                          <div className={`hidden sm:flex w-4 h-4 sm:w-5 sm:h-5 rounded-md items-center justify-center border shrink-0 transition-all ${
                            planSelected 
                              ? 'bg-blue-500 border-blue-500 text-white shadow-none' 
                              : 'border-blue-200 bg-white text-transparent'
                          }`}>
                            {planSelected && <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Buy Button, Check Compatibility, Install & Activate Guides */}
                <div className="hidden sm:flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBuyNowFlow} 
                    disabled={ordering || selectedPlanIds.size !== 1}
                    className="w-full relative overflow-hidden rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all disabled:opacity-40 py-3.5 sm:py-4 bg-blue-500 hover:bg-blue-600 font-bold text-[13px] sm:text-sm uppercase tracking-wider text-white flex items-center justify-center cursor-pointer border-none font-['Poppins']"
                  >
                    {ordering ? 'Connecting to Payment...' : 'Buy Now 🚀'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEsimCheckDrawer(true)}
                    className="text-xs sm:text-[13px] font-semibold text-slate-600 hover:text-blue-600 underline underline-offset-4 tracking-wide transition-colors cursor-pointer bg-transparent border-none outline-none font-['Poppins'] py-1"
                  >
                    Check eSIM Compatibility
                  </button>

                  {/* Desktop Installation Guide Accordion */}
                  <InstallGuideAccordion />

                  {/* Desktop Activation Guide Accordion */}
                  <EsimActivateAccordion />
                </div>

                {/* Mobile View Guides */}
                <div className="block sm:hidden pt-3 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowEsimCheckDrawer(true)}
                    className="w-full text-center text-xs font-semibold text-slate-600 hover:text-blue-600 underline underline-offset-4 tracking-wide transition-colors cursor-pointer bg-transparent border-none outline-none font-['Poppins'] py-1"
                  >
                    Check eSIM Compatibility
                  </button>

                  <InstallGuideAccordion />

                  {/* Mobile Activation Guide Accordion */}
                  <EsimActivateAccordion />
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Mobile Buy Button */}
      {selectedPlan && (
        <div className="sm:hidden fixed bottom-[85px] left-3 right-3 z-30 bg-white/95 backdrop-blur-2xl border border-blue-200 rounded-[18px] p-2.5 shadow-[0_0_25px_rgba(59,130,246,0.2)] flex items-center justify-between gap-2 animate-in slide-in-from-bottom duration-300 font-['Poppins']">
          <div className="flex flex-col min-w-0 pl-1">
            <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wide">Selected Plan</span>
            <div className="flex items-center gap-1">
              <span className="text-[11.5px] font-medium text-slate-900 truncate">
                {selectedPlan.data} ({selectedPlan.days} Day)
              </span>
            </div>
            <span className="text-[11.5px] font-medium text-slate-900 mt-0.5">
              {formatPriceValue(selectedPlan.effective_price, selectedPlan.currency)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBuyNowFlow}
            disabled={ordering}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold text-[11.5px] uppercase tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.4)] shrink-0 border-none cursor-pointer"
          >
            {ordering ? 'Processing...' : 'Buy Now 🚀'}
          </button>
        </div>
      )}

      {/* ESIM CHECK SLIDE-OVER DRAWER POPUP */}
      {showEsimCheckDrawer && (
        <EsimCheck onBack={() => setShowEsimCheckDrawer(false)} />
      )}
    </div>
  );
}