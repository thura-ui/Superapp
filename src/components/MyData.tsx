import { useState, useEffect } from 'react';
import { Globe, Binary, Calendar, HardDrive, RefreshCw, Cpu, Wifi, Radio, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🌟 i18next ကို import လုပ်ထားပါသည်

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
}

export default function MyData({ onHome }: MyDataProps) {
  // 🌟 Translation hook ကို ခေါ်ယူထားပါသည်
  const { t } = useTranslation();

  const [iccidNumber, setIccidNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<EsimStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userCards, setUserCards] = useState<UserOrderCard[]>([]);
  const [selectedCardIccid, setSelectedIccid] = useState<string>('');
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // 🌟 Status များကို ဘာသာပြန်နိုင်ရန် key အဖြစ် သတ်မှတ်ထားပါသည်
  const statuses = ['statusNotUsed', 'statusInUse', 'statusUsed', 'statusExpired'];
  const radius = 75; 
  const circumference = 2 * Math.PI * radius;
  const remainingPercent = fetchedData ? (fetchedData.remainingData / fetchedData.totalData) * 100 : 0;
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

  const checkStrictEsimStatus = (endTimeStr?: string, remainingGb: number = 0, defaultStatus: string = 'In Use', placedAtStr?: string): string => {
    const now = new Date();

    if (remainingGb <= 0) {
      return 'statusUsed';
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

    if (defaultStatus === 'Cancelled') return 'statusCancelled';
    
    // API မှ status များကို translation key အဖြစ် ပြောင်းလဲပေးသည်
    if (defaultStatus === 'In Use') return 'statusInUse';
    if (defaultStatus === 'Not Used') return 'statusNotUsed';
    if (defaultStatus === 'Expired') return 'statusExpired';
    if (defaultStatus === 'Used') return 'statusUsed';

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

  const parseEsimStatusData = (statusNode: any, placedAt?: string) => {
    if (!statusNode || !statusNode.success) return null;

    const plan = statusNode.data.plan;
    const usage = statusNode.data.usage_summary;
    const countryList = plan.countries || [];
    const coverageNames = countryList.length > 0
      ? countryList.map((c: any) => c.name).join(', ')
      : (plan.operator || "Global Zone");

    const remainingGb = Number(usage.remaining_gb) || 0;
    const rawStatusLabel = plan.status_label || "In Use";

    const finalStatusKey = checkStrictEsimStatus(plan.end_time, remainingGb, rawStatusLabel, placedAt);

    const computedExpiry = plan.end_time 
      ? plan.end_time.split(' ')[0] 
      : calculateOneMonthExpiry(placedAt);

    return {
      title: plan.sku_name?.trim() || "eSIM Data Plan",
      status: finalStatusKey, // status ကို translation key အဖြစ် သိမ်းထားသည်
      remainingData: remainingGb,
      usedData: Number(usage.total_used_gb) || 0,
      totalData: Number(plan.high_flow_size_gb) || 0,
      days: Number(plan.total_days) || 30,
      expiry: computedExpiry,
      coverage: coverageNames,
      apn: plan.apn || "cmhk",
      operator: plan.operator || "China Mobile",
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
        const response = await fetch(`${baseUrl}/esim/customer-check-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
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
              const labelParts = product.product_variation_label.split('·');
              const planType = labelParts[0]?.trim() || 'Fixed';
              const planData = labelParts[1]?.trim() || 'Data';
              const planDays = labelParts[2]?.trim() || 'Flexible';

              const currentStatus = resJson.status?.data?.plan?.channel_order_id === order.order_number ? resJson.status : null;
              const remData = currentStatus ? Number(currentStatus.data.usage_summary.remaining_gb) : parseFloat(planData) || 0;
              const usdData = currentStatus ? Number(currentStatus.data.usage_summary.total_used_gb) : 0;
              
              const calculatedExpDate = calculateOneMonthExpiry(order.placed_at);
              const expDate = currentStatus?.data?.plan?.end_time 
                ? currentStatus.data.plan.end_time.split(' ')[0] 
                : calculatedExpDate;

              const rawStatus = currentStatus ? currentStatus.data.plan.status_label : (resJson.status?.data?.plan?.status_label || "In Use");
              const endTimeStr = currentStatus?.data?.plan?.end_time;

              const finalCardStatusKey = checkStrictEsimStatus(endTimeStr, remData, rawStatus, order.placed_at);

              mappedCards.push({
                iccid: iccid,
                country: product.product_name || 'Global',
                plan: `${planType} (${planData})`,
                days: planDays,
                orderNumber: order.order_number,
                remainingData: remData,
                usedData: usdData,
                expiry: expDate,
                status: finalCardStatusKey
              });
            }
          });

          setUserCards(mappedCards);
        }
      } catch (err) {
        console.error(err);
        setError(t('errorFetchCards'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [t]); // 🌟 t ကို dependency array ထဲထည့်ပေးပါသည်

  const handleCardBoxSelect = async (iccid: string) => {
    if (!iccid) return;
    setSelectedIccid(iccid);
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${baseUrl}/esim/customer-check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ iccid: iccid })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.status) {
        const selectedCardObj = userCards.find(c => c.iccid === iccid);
        const parsed = parseEsimStatusData(resJson.status, selectedCardObj?.expiry);
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

      const response = await fetch(`${baseUrl}/esim/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto selection:bg-blue-500/10 font-['Poppins'] text-slate-900">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/60 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          {isLoggedInUser && viewMode === 'detail' && (
            <button 
              onClick={() => setViewMode('list')}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shadow-sm font-['Poppins']"
              title="Back to Cards List"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-['Poppins']">
              <Radio className="w-4 h-4 text-blue-600 animate-pulse" /> {t('checkDataUsage')}
            </h1>
            <p className="text-slate-500 text-[11px] sm:text-[13px] mt-0.5 font-semibold font-['Poppins']">
              {viewMode === 'list' && isLoggedInUser ? t('checkDataUsageDesc') : t('liveDataMatrix')}
            </p>
          </div>
        </div>
        
        {!isLoggedInUser && (
          <form onSubmit={handleIccidCheck} className="flex gap-2 w-full md:w-auto max-w-md">
            <div className="relative flex-1">
              <Binary className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('enterIccid')}
                value={iccidNumber}
                onChange={(e) => setIccidNumber(e.target.value)}
                className="w-full md:w-64 pl-9 pr-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-['Poppins']"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 font-['Poppins'] cursor-pointer border-none"
            >
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : t('searchBtn')}
            </button>
          </form>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-6 text-center text-sm font-semibold text-rose-600 font-['Poppins']">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {!loading && isLoggedInUser && viewMode === 'list' && (
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
                      <span className="font-semibold text-blue-600 text-sm font-['Poppins']">{card.remainingData.toFixed(2)} GB</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight block font-['Poppins']">{t('usedTotal')}</span>
                      <span className="font-semibold text-slate-800 text-sm font-['Poppins']">{card.usedData.toFixed(2)} GB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight block font-['Poppins']">{t('expiryDate')}</span>
                      <span className="font-semibold text-slate-800 text-[11px] block truncate font-['Poppins']">{card.expiry}</span>
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

      {!loading && viewMode === 'detail' && fetchedData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-300 font-['Poppins']">
          
          <div className="lg:col-span-5 bg-slate-950 text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center font-['Poppins']">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-6 font-['Poppins']">
              {t('quotaVisualization')}
            </span>

            <div className="relative w-56 h-56 mb-6 flex items-center justify-center bg-white/[0.02] rounded-full">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                <circle 
                  cx="100" 
                  cy="100" 
                  r={radius} 
                  className="text-blue-500 transition-all duration-1000 filter drop-shadow-[0_0_6px_rgba(59,130,246,0.3)]" 
                  strokeWidth="7" 
                  stroke="currentColor" 
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-3">
                <span className="text-4xl font-semibold text-white tracking-tight leading-none font-['Poppins']">
                  {fetchedData.remainingData.toFixed(2)}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 tracking-[0.12em] uppercase mt-2.5 block text-center font-['Poppins']">
                  {t('dataRemaining')}
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 border-t border-white/5 pt-4 mt-2 text-sm font-semibold text-slate-400 font-['Poppins']">
              <div className="text-center border-r border-white/5">
                <p className="text-[11px] uppercase text-slate-400 font-['Poppins']">{t('usedData')}</p>
                <p className="text-white font-semibold mt-0.5 font-['Poppins']">{fetchedData.usedData.toFixed(2)} GB</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] uppercase text-slate-400 font-['Poppins']">{t('totalData')}</p>
                <p className="text-white font-semibold mt-0.5 font-['Poppins']">{fetchedData.totalData} GB</p>
              </div>
            </div>

            <div className="w-full mt-8 bg-white/5 rounded-2xl p-4 border border-white/5 text-left font-['Poppins']">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 font-['Poppins']">{t('workflowStatus')}</p>
              <div className="space-y-3">
                {statuses.map((stKey) => {
                  const isActive = fetchedData.status === stKey;
                  return (
                    <div key={stKey} className="flex items-center gap-3 font-['Poppins']">
                      <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                        isActive ? 'bg-blue-500 ring-4 ring-blue-500/20 scale-110' : 'bg-white/10'
                      }`} />
                      <span className={`text-sm font-semibold ${isActive ? 'text-blue-400' : 'text-slate-400'} font-['Poppins']`}>
                        {t(stKey)} {isActive && `• ${t('primaryNode')}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 font-['Poppins']">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5 font-['Poppins']">{t('connectedHardwareId')}</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-['Poppins']">
                {fetchedData.title}
              </h2>
              <span className="text-[11px] font-mono text-slate-500 mt-1 block break-all whitespace-normal font-semibold">
                {t('iccidLabel')}: {selectedCardIccid || iccidNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins']">{t('timeDuration')}</p>
                  <p className="text-sm font-semibold text-slate-800 font-['Poppins']">{fetchedData.days} {t('daysAllotted')}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins']">{t('terminationExpiry')}</p>
                  <p className="text-sm font-semibold text-slate-800 font-['Poppins']">{fetchedData.expiry}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-2xl p-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-slate-700 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase font-['Poppins']">{t('apnTarget')}</p>
                  <p className="text-sm font-semibold text-slate-900 uppercase font-mono mt-0.5">{fetchedData.apn}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
                <Wifi className="w-4 h-4 text-slate-700 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase font-['Poppins']">{t('operatorMesh')}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate font-['Poppins']">{fetchedData.operator}</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm font-['Poppins']">
              <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 font-['Poppins']">{t('intervalHistoryLogs')}</h3>
                <span className="text-[10px] bg-slate-950 text-white font-semibold px-2 py-0.5 rounded font-['Poppins']">
                  {fetchedData.dailyHistory.length} {t('days')}
                </span>
              </div>
              
              <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
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

            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between text-sm font-semibold font-['Poppins']">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins']">{t('coverageGeoZone')}:</span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg text-slate-800 font-semibold max-w-[70%] truncate font-['Poppins']">
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {fetchedData.coverage}
              </span>
            </div>
          </div>
        </div>
      )}

      {!fetchedData && !loading && !isLoggedInUser && (
        <div className="text-center py-20 bg-slate-50/50 border border-dashed border-slate-200 rounded-[28px] font-['Poppins']">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-slate-500 tracking-wide font-['Poppins']">{t('guestPlaceholderDesc')}</p>
        </div>
      )}
    </div>
  );
}