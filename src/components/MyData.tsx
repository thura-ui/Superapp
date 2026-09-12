import { useState, useEffect } from 'react';
import { Globe, Calendar, HardDrive, RefreshCw, Cpu, Wifi, ArrowLeft, ArrowRight, Layers, Search, Lightbulb, SearchCode, Infinity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MyDataProps {
  onClose: () => void;
  onHome?: () => void;
}

interface EsimStatusData {
  title: string;
  status: string;
  remainingData: number;
  usedData: number;
  totalData: number;
  isUnlimited: boolean;
  isDayPass: boolean; // 💡 Daypass အတွက် Flag
  dailyLimitStr: string; // 💡 Daypass ၏ Daily Limit (ဥပမာ "1GB/Day")
  days: number;
  expiry: string;
  coverage: string;
  apn: string;
  operator: string;
  dailyHistory: Array<{ date: string; usage: string }>;
}

interface UserOrderCard {
  iccid: string;
  country: string;
  plan: string;
  days: string;
  orderNumber: string;
  remainingData: number;
  usedData: number;
  expiry: string;
  status: string;
  variationLabel: string;
}

// 🔴 Anti-Cache Helper Functions
const appendAntiCacheParam = (url: string): string => {
  const timestamp = new Date().getTime();
  return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
};

const getAntiCacheHeaders = (existingHeaders?: HeadersInit): Headers => {
  const headers = new Headers(existingHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return headers;
};

export default function MyData({ onHome }: MyDataProps) {
  const { t, i18n } = useTranslation();

  const [iccidNumber, setIccidNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<EsimStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userCards, setUserCards] = useState<UserOrderCard[]>([]);
  const [selectedCardIccid, setSelectedIccid] = useState<string>('');
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const statuses = ['statusNotUsed', 'statusInUse', 'statusUsed', 'statusExpired'];
  
  const calculateDynamicRadius = () => {
    let baseRadius = screenWidth < 640 ? 88 : 94;

    if (fetchedData) {
      const formattedDataStr = (Math.abs(fetchedData.remainingData) % 1 === 0 
        ? Math.abs(fetchedData.remainingData) 
        : Math.abs(fetchedData.remainingData).toFixed(2)).toString();

      if (formattedDataStr.length > 5) {
        baseRadius += 4;
      } else if (formattedDataStr.length > 4) {
        baseRadius += 2;
      }
    }

    return baseRadius;
  };

  const radius = calculateDynamicRadius();
  const circumference = 2 * Math.PI * radius;

  const remainingPercent = fetchedData 
    ? (fetchedData.isUnlimited ? 100 : (fetchedData.totalData > 0 ? (fetchedData.remainingData / fetchedData.totalData) * 100 : 0))
    : 0;
  const strokeDashoffset = circumference - (remainingPercent / 100) * circumference;

  const calculateOneMonthExpiry = (placedAtStr?: string): string => {
    if (!placedAtStr) return 'N/A';
    try {
      const placedDate = new Date(placedAtStr);
      if (isNaN(placedDate.getTime())) return 'N/A';
      
      placedDate.setMonth(placedDate.getMonth() + 1);
      
      const year = placedDate.getFullYear();
      const month = String(placedDate.getMonth() + 1).padStart(2, '0');
      const day = String(placedDate.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch {
      return 'N/A';
    }
  };

  const checkStrictEsimStatus = (
    endTimeStr?: string, 
    remainingGb: number = 0, 
    defaultStatus: string = '', 
    placedAtStr?: string
  ): string => {
    const now = new Date();
    const normalizedStatus = (defaultStatus || '').trim().toLowerCase();

    if (normalizedStatus === 'expired') {
      return 'statusExpired';
    }
    if (normalizedStatus === 'cancelled') {
      return 'statusCancelled';
    }

    if (endTimeStr) {
      const endTime = new Date(endTimeStr.replace(' ', 'T'));
      if (!isNaN(endTime.getTime()) && now > endTime) {
        return 'statusExpired';
      }
    }

    if (placedAtStr) {
      const placedDate = new Date(placedAtStr);
      if (!isNaN(placedDate.getTime())) {
        placedDate.setMonth(placedDate.getMonth() + 1);
        if (now > placedDate) {
          return 'statusExpired';
        }
      }
    }

    if (normalizedStatus === 'not used' || normalizedStatus === 'notused') {
      return 'statusNotUsed';
    }
    if (normalizedStatus === 'in use' || normalizedStatus === 'inuse') {
      return 'statusInUse';
    }
    if (normalizedStatus === 'used') {
      return 'statusUsed';
    }

    if (remainingGb <= 0 && normalizedStatus !== 'not used') {
      return 'statusUsed';
    }

    return 'statusInUse';
  };

  const getStatusBadgeStyle = (statusKey: string) => {
    switch (statusKey) {
      case 'statusInUse':
        return {
          box: 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10',
          dot: 'bg-emerald-500 animate-pulse'
        };
      case 'statusNotUsed':
        return {
          box: 'bg-amber-500/5 text-amber-600 border-amber-500/10',
          dot: 'bg-amber-500'
        };
      case 'statusUsed':
        return {
          box: 'bg-slate-500/5 text-slate-600 border-slate-500/10',
          dot: 'bg-slate-400'
        };
      case 'statusExpired':
      case 'statusCancelled':
        return {
          box: 'bg-rose-500/5 text-rose-600 border-rose-500/10',
          dot: 'bg-rose-500'
        };
      default:
        return {
          box: 'bg-slate-50 text-slate-600 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  const parseEsimStatusData = (statusNode: any, placedAt?: string, fallbackDays?: string, variationLabelStr: string = '') => {
    if (!statusNode || !statusNode.success) return null;

    const plan = statusNode.data.plan;
    const usage = statusNode.data.usage_summary;
    const countryList = plan.countries || [];
    const coverageNames = countryList.length > 0
      ? countryList.map((c: any) => c.name).join(', ')
      : (plan.operator || "Global Zone");

    const remainingGb = Number(usage?.remaining_gb) || 0;
    const rawStatusLabel = plan.status_label || "Not Used";

    const finalStatusKey = checkStrictEsimStatus(plan.end_time, remainingGb, rawStatusLabel, placedAt);

    const computedExpiry = plan.end_time 
      ? plan.end_time.split(' ')[0] 
      : calculateOneMonthExpiry(placedAt);

    const displayDays = Number(plan.total_days) || (fallbackDays ? parseInt(fallbackDays) : 30);

    const label = variationLabelStr.toLowerCase();
    const sku = (plan.sku_name || '').toLowerCase();
    const planTypeLabel = (plan.plan_type_label || '').toLowerCase();

    // 💡 Day Pass ဟုတ်မဟုတ် စစ်ဆေးခြင်း ("plan_type_label": "Daily Data" ပါ စစ်ဆေးပါသည်)
    const isDayPass = (planTypeLabel === "daily data" || plan.plan_type_code === "1") && (
      label.includes('day pass') || 
      label.includes('daypass') || 
      sku.includes('day pass') || 
      sku.includes('daypass')
    );

    // 💡 Unlimited Plan စစ်ဆေးခြင်း
    const isUnlimitedPlan = !isDayPass && (
      label.includes('unlimited') || 
      sku.includes('unlimited') ||
      ((planTypeLabel === "daily data" || plan.plan_type_code === "1") && Number(plan.high_flow_size_gb) <= 0)
    );

    // 💡 Daypass အတွက် GB/Day စာသား ထုတ်ယူခြင်း (ဥပမာ 1GB/Day)
    let dailyLimitStr = "1GB/Day";
    if (isDayPass) {
      const match = variationLabelStr.match(/(\d+GB\/Day|\d+MB\/Day)/i) || (plan.sku_name || '').match(/(\d+GB\/day|\d+MB\/day)/i);
      if (match) {
        dailyLimitStr = match[0];
      }
    }

    const rawHighFlowGb = Number(plan.high_flow_size_gb) || 0;
    const totalGb = isUnlimitedPlan 
      ? -1 
      : (rawHighFlowGb > 0 ? rawHighFlowGb : (remainingGb + (Number(usage?.total_used_gb) || 0)));

    return {
      title: plan.sku_name?.trim() || "eSIM Data Plan",
      status: finalStatusKey,
      remainingData: remainingGb,
      usedData: Number(usage?.total_used_gb) || 0,
      totalData: totalGb,
      isUnlimited: isUnlimitedPlan,
      isDayPass: isDayPass, // 💡 Day Pass ဖြစ်ကြောင်း Flag
      dailyLimitStr: dailyLimitStr, // 💡 Day Pass ပြသရန် စာသား
      days: displayDays,
      expiry: computedExpiry,
      coverage: coverageNames,
      apn: plan.apn || "mobile.three.com.hk",
      operator: plan.operator || "LG U+",
      dailyHistory: (statusNode.data.usage_history || []).map((h: any) => ({
        date: h.date,
        usage: `${h.usage_gb} GB`
      }))
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchUserOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
        
        const fetchUrl = appendAntiCacheParam(`${baseUrl}/esim/customer-check-status`);
        const headers = getAntiCacheHeaders({
          'Authorization': `Bearer ${token}`
        });

        const response = await fetch(fetchUrl, {
          method: 'POST',
          headers,
        });

        const resJson = await response.json();

        if (resJson.success && resJson.orders) {
          setIsLoggedInUser(true);
          setViewMode('list');

          const mappedCards: UserOrderCard[] = [];
          
          resJson.orders.forEach((order: any) => {
            const product = order.products?.[0];
            const iccid = order.iccids?.[0];
            
            if (iccid && product) {
              const rawVariationLabel = product.product_variation_label || '';
              const labelParts = rawVariationLabel.split(/·|\u00b7/);
              
              const planType = labelParts[0]?.trim() || 'Fixed';
              const planData = labelParts[1]?.trim() || 'Data';
              const planDays = labelParts[2]?.trim() || 'Days';

              const currentStatusNode = resJson.status?.data?.plan?.channel_order_id === order.order_number 
                ? resJson.status 
                : (resJson.status?.data?.order_id === order.id ? resJson.status : null);

              const rawStatus = currentStatusNode?.data?.plan?.status_label || resJson.status?.data?.plan?.status_label || "In Use";

              const remData = currentStatusNode ? Number(currentStatusNode.data.usage_summary.remaining_gb) : parseFloat(planData) || 0;
              const usdData = currentStatusNode ? Number(currentStatusNode.data.usage_summary.total_used_gb) : 0;
              
              const calculatedExpDate = calculateOneMonthExpiry(order.placed_at);
              const expDate = currentStatusNode?.data?.plan?.end_time 
                ? currentStatusNode.data.plan.end_time.split(' ')[0] 
                : calculatedExpDate;

              const endTimeStr = currentStatusNode?.data?.plan?.end_time;

              const finalCardStatusKey = checkStrictEsimStatus(endTimeStr, remData, rawStatus, order.placed_at);

              mappedCards.push({
                iccid: iccid,
                country: product.product_name || 'Global',
                plan: `${planType} · ${planData}`,
                days: planDays,
                orderNumber: order.order_number,
                remainingData: remData,
                usedData: usdData,
                expiry: expDate,
                status: finalCardStatusKey,
                variationLabel: rawVariationLabel
              });
            }
          });

          setUserCards(mappedCards);
        }
      } catch (err) {
        console.error(err);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [t]);

  const handleCardBoxSelect = async (iccid: string) => {
    if (!iccid) return;
    setSelectedIccid(iccid);
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
      const token = localStorage.getItem('authToken');

      const fetchUrl = appendAntiCacheParam(`${baseUrl}/esim/customer-check-status`);
      const headers = getAntiCacheHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ iccid: iccid })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.status) {
        const selectedCardObj = userCards.find(c => c.iccid === iccid);
        const parsed = parseEsimStatusData(
          resJson.status, 
          selectedCardObj?.expiry, 
          selectedCardObj?.days, 
          selectedCardObj?.variationLabel || ''
        );
        setFetchedData(parsed);
        setViewMode('detail');
      } else {
        setError(t('errorSyncData'));
      }
    } catch (err) {
      console.error(err);
      setError(t('errorMatrixSync'));
    } finally {
      setLoading(false);
    }
  };

  const handleIccidCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iccidNumber.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
      const token = localStorage.getItem('authToken');

      const fetchUrl = appendAntiCacheParam(`${baseUrl}/esim/check-status`);
      const headers = getAntiCacheHeaders(
        token ? { 'Authorization': `Bearer ${token}` } : {}
      );

      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ iccid: iccidNumber.trim() }),
      });

      const resJson = await response.json();

      if (resJson.success && resJson.data) {
        const parsed = parseEsimStatusData({ success: true, data: resJson.data });
        setFetchedData(parsed);
        setViewMode('detail');
      } else {
        setError(resJson.message || t('errorCheckIccid'));
      }
    } catch (err) {
      console.error(err);
      setError(t('errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-data-container pt-20 sm:pt-28 pb-8 sm:pb-12 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto selection:bg-blue-500/10 font-['Poppins'] text-slate-900">
      
      {/* Search & Banner Section */}
      {(!isLoggedInUser || (isLoggedInUser && viewMode === 'list' && userCards.length === 0)) && !fetchedData && (
        <div className="w-full max-w-5xl mx-auto space-y-6 font-['Poppins']">
          
          {isLoggedInUser && userCards.length === 0 && !loading && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-center text-xs sm:text-sm font-semibold shadow-xs">
              {i18n.language === 'my' 
                ? 'မည်သည့် Data မျှ ဝယ်ယူထားခြင်း မရှိသေးပါ။' 
                : 'You have not purchased any data plans yet.'}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-4 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4 sm:space-y-6">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-1">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full text-[11px] font-semibold">
                  <SearchCode className="w-3.5 h-3.5 text-blue-600" />
                  FIND YOUR ICCID
                </div>
              </div>
            </div>

            <form onSubmit={handleIccidCheck} className="w-full">
              <div className="flex flex-row items-center bg-white border-2 border-slate-200 focus-within:border-blue-600 rounded-2xl p-1 sm:p-1.5 shadow-xs transition-all w-full overflow-hidden">
                
                <div className="flex items-center flex-1 min-w-0">
                  <div className="pl-2 pr-1 sm:pl-3 sm:pr-2 text-slate-400 shrink-0">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <input 
                    type="text" 
                    placeholder="Enter ICCID number (89...)" 
                    value={iccidNumber}
                    onChange={(e) => setIccidNumber(e.target.value)}
                    className="hidden sm:block w-full px-1 py-2 sm:py-2.5 bg-transparent font-semibold text-slate-800 focus:outline-none text-sm placeholder:text-slate-400"
                    required
                  />

                  <input 
                    type="text" 
                    placeholder="Enter ICCID number (89...)" 
                    value={iccidNumber}
                    onChange={(e) => setIccidNumber(e.target.value)}
                    className="block sm:hidden w-full px-1 py-2 bg-transparent font-semibold text-slate-800 focus:outline-none text-[11px] placeholder:text-slate-400"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="px-3 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shrink-0 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border-none disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white" /> : (
                    <span className="text-white">{t('searchBtn', 'Check Status')}</span>
                  )}
                </button>
                
              </div>
            </form>

          </div>

          <div className="w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_12px_35px_rgba(0,0,0,0.04)] bg-[#f4f3f0]">
            <img 
              src="/ICCIDcheck-banner.jpg" 
              alt="ICCID Check Banner" 
              className="w-full h-auto object-cover block"
            />
          </div>

          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{i18n.language === 'my' ? 'ICCID ကို ဘယ်မှာ ရှာရမလဲ။' : 'Where can I find my ICCID?'}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                  {i18n.language === 'my' ? 'ဝယ်ယူမှု အတည်ပြု အီးမေးလ် သို့မဟုတ် သင့်ဖုန်း၏ Settings > Cellular တွင် သွားရောက် ကြည့်ရှုနိုင်ပါသည်။' : 'Check your purchase confirmation email or go to Settings > Cellular on your device.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Logged in Details or Detail Mode Header */}
      {isLoggedInUser && viewMode === 'detail' && (
        <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4 mb-6">
          <button 
            onClick={() => {
              setViewMode('list');
              setFetchedData(null);
              setSelectedIccid('');
            }}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shadow-sm cursor-pointer font-['Poppins']"
            title="Back to Cards List"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-['Poppins']">
              {t('checkDataUsage')}
            </h1>
            <p className="text-slate-500 text-[11px] sm:text-[13px] mt-0.5 font-semibold font-['Poppins']">
              {t('liveDataMatrix')}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 my-6 text-center text-xs sm:text-sm font-semibold text-rose-600 font-['Poppins']">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {/* Logged-In Customer's Purchased Profiles List */}
      {!loading && isLoggedInUser && viewMode === 'list' && userCards.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider px-1 flex items-center gap-1.5 font-['Poppins']">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> {t('yourActivatedProfiles')} ({userCards.length})
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {userCards.map((card, i) => {
              const currentStyle = getStatusBadgeStyle(card.status);
              
              return (
                <div
                  key={i}
                  onClick={() => handleCardBoxSelect(card.iccid)}
                  className="group bg-white border border-slate-100 hover:border-blue-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-slate-100 group-hover:bg-blue-600 transition-colors" />
                  
                  <div className="flex-1 space-y-3 pl-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-blue-600 shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm tracking-tight truncate font-['Poppins']">{card.country}</h3>
                          <p className="text-[10px] font-mono text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                            {card.orderNumber}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] border font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider font-['Poppins'] ${currentStyle.box}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`} />
                          {t('status')} : {t(card.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div>
                        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block font-['Poppins']">{t('planConfig')}</span>
                        <span className="font-semibold text-slate-800 block truncate font-['Poppins']">{card.plan}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block font-['Poppins']">{t('iccidNumber')}</span>
                        <span className="font-mono text-slate-700 text-[11px] font-semibold block break-all whitespace-normal">
                          {card.iccid}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 md:w-80 text-center shrink-0 font-['Poppins']">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight block font-['Poppins']">{t('remaining')}</span>
                      <span className="font-semibold text-blue-600 text-sm font-['Poppins']">{Math.abs(card.remainingData).toFixed(2)} GB</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight block font-['Poppins']">{t('usedTotal')}</span>
                      <span className="font-semibold text-slate-800 text-sm font-['Poppins']">{Math.abs(card.usedData).toFixed(2)} GB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight block font-['Poppins']">{t('timeDuration')}</span>
                      <span className="font-semibold text-slate-800 text-[11px] block truncate font-['Poppins']">{card.days}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all pr-1">
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Card Status Matrix Detail View */}
      {!loading && viewMode === 'detail' && fetchedData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-300 font-['Poppins']">
          
          <div className="lg:col-span-5 bg-slate-950 text-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center font-['Poppins']">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-4 sm:mb-6 font-['Poppins']">
              {t('quotaVisualization')}
            </span>

            <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-4 sm:mb-6 flex items-center justify-center bg-white/[0.02] rounded-full">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                <circle 
                  cx="100" 
                  cy="100" 
                  r={radius} 
                  className="text-blue-500 transition-all duration-700 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
                  strokeWidth="8" 
                  stroke="currentColor" 
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="flex items-center justify-center leading-none">
                  {fetchedData.isUnlimited ? (
                    <Infinity className="w-12 h-12 sm:w-16 sm:h-16 text-white stroke-[2.5]" />
                  ) : (
                    <>
                      <span 
                        className="font-black text-white tracking-tight leading-none font-['Poppins']"
                        style={{ fontSize: 'clamp(28px, 6.5vw, 42px)' }}
                      >
                        {Math.abs(fetchedData.remainingData) % 1 === 0 
                          ? Math.abs(fetchedData.remainingData) 
                          : Math.abs(fetchedData.remainingData).toFixed(2)}
                      </span>
                      <span 
                        className="text-blue-400 font-bold ml-1 leading-none" 
                        style={{ fontSize: 'clamp(18px, 4.5vw, 26px)' }}
                      >
                        GB
                      </span>
                    </>
                  )}
                </div>

                <span 
                  className="font-semibold text-slate-400 tracking-wider uppercase mt-2 block text-center font-['Poppins'] leading-none"
                  style={{ fontSize: '10px' }}
                >
                  {t('dataRemaining')}
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 border-t border-white/5 pt-3 sm:pt-4 text-xs sm:text-sm font-semibold text-slate-400 font-['Poppins']">
              <div className="text-center border-r border-white/5">
                <p className="text-[10px] sm:text-[11px] uppercase text-slate-400 font-['Poppins']">{t('usedData')}</p>
                <p className="text-white font-semibold mt-0.5 font-['Poppins']">
                  {Math.abs(fetchedData.usedData) % 1 === 0 
                    ? Math.abs(fetchedData.usedData) 
                    : Math.abs(fetchedData.usedData).toFixed(2)} GB
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-[11px] uppercase text-slate-400 font-['Poppins']">{t('totalData')}</p>
                {/* 💡 Total Data ပြသမှု - Unlimited / Daypass (1GB/Day) / Fixed (10 GB) */}
                <p className="text-white font-semibold mt-0.5 font-['Poppins']">
                  {fetchedData.isUnlimited 
                    ? "Unlimited" 
                    : fetchedData.isDayPass 
                      ? fetchedData.dailyLimitStr 
                      : `${fetchedData.totalData % 1 === 0 ? fetchedData.totalData : fetchedData.totalData.toFixed(2)} GB`
                  }
                </p>
              </div>
            </div>

            {/* Workflow Status Steps List */}
            <div className="w-full mt-6 sm:mt-8 bg-white/5 rounded-2xl p-4 border border-white/5 text-left font-['Poppins']">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 font-['Poppins']">{t('workflowStatus')}</p>
              <div className="space-y-3">
                {statuses.map((stKey) => {
                  const isActive = fetchedData.status === stKey;

                  return (
                    <div key={stKey} className="flex items-center gap-3 font-['Poppins']">
                      <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                        isActive ? 'bg-blue-500 ring-4 ring-blue-500/20 scale-110' : 'bg-white/10'
                      }`} />
                      <span className={`text-sm font-semibold ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400'} font-['Poppins']`}>
                        {t(stKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 font-['Poppins']">
            {/* Data Plan Name */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5 font-['Poppins']">
                Data Plan Name
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-['Poppins']">
                {fetchedData.title 
                  ? fetchedData.title.split(/-eSIM|-throttled|,throttled/i)[0].trim() 
                  : 'eSIM Data Plan'}
              </h2>
              <span className="text-[11px] font-mono text-slate-500 mt-1 block break-all whitespace-normal font-semibold">
                {t('iccidLabel')}: {selectedCardIccid || iccidNumber}
              </span>
            </div>

            {/* Time Duration & Expiry Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 p-3 sm:p-4 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 shadow-sm min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis font-['Poppins']">
                    {t('timeDuration')}
                  </p>
                  <p className="text-[11px] sm:text-sm font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis font-['Poppins'] mt-0.5">
                    {fetchedData.days} Days
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-3 sm:p-4 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 shadow-sm min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis font-['Poppins']">
                    Expiry Date
                  </p>
                  <p className="text-[11px] sm:text-sm font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis font-['Poppins'] mt-0.5">
                    {fetchedData.expiry}
                  </p>
                </div>
              </div>
            </div>

            {/* APN Target & Operator Mesh */}
            <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-2xl p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Cpu className="w-4 h-4 text-slate-700 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis font-['Poppins']">
                    {t('apnTarget')}
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase font-mono mt-0.5 break-all whitespace-normal">
                    {fetchedData.apn}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5 sm:pl-4 min-w-0">
                <Wifi className="w-4 h-4 text-slate-700 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis font-['Poppins']">
                    {t('operatorMesh')}
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-900 mt-0.5 break-all whitespace-normal font-['Poppins']">
                    {fetchedData.operator}
                  </p>
                </div>
              </div>
            </div>

            {/* Interval History Logs */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm font-['Poppins']">
              <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 font-['Poppins']">{t('intervalHistoryLogs')}</h3>
                <span className="text-[10px] bg-slate-950 text-white font-semibold px-2 py-0.5 rounded font-['Poppins']">
                  {fetchedData.dailyHistory.length} {t('days')}
                </span>
              </div>
              
              <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {fetchedData.dailyHistory.map((row, index) => {
                  const totalRows = fetchedData.dailyHistory.length;
                  const rowStyle = totalRows > 15 ? 'px-4 py-1.5' : totalRows > 7 ? 'px-4 py-2.5' : 'px-4 py-3.5';
                  const textStyle = totalRows > 15 ? 'text-[11px]' : totalRows > 7 ? 'text-[12px]' : 'text-sm';

                  return (
                    <div key={index} className={`flex justify-between items-center hover:bg-slate-50/30 transition-colors ${rowStyle}`}>
                      <span className={`font-semibold text-slate-700 ${textStyle} font-['Poppins']`}>{row.date}</span>
                      <span className={`font-semibold text-slate-900 tracking-tight ${textStyle} font-['Poppins']`}>{row.usage}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coverage Geo Zone */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-sm font-semibold font-['Poppins'] shadow-sm">
              <div className="flex items-center gap-1.5 shrink-0">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins']">
                  {t('coverageGeoZone')}:
                </span>
              </div>
              
              <span className="inline-flex items-center bg-slate-50 border border-slate-100 sm:px-5 px-3 py-1.5 rounded-lg text-slate-800 font-semibold break-words whitespace-normal text-xs sm:text-sm">
                <span>{fetchedData.coverage}</span>
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}