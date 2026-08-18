import { useState, useEffect, useRef } from 'react';
import { Clock3, CheckCircle2, AlertCircle, CreditCard, Calendar } from 'lucide-react';
import OrderDetail from './OrderDetail'; 
import { useTranslation } from 'react-i18next'; // 🌟 i18next ကို import လုပ်ထားပါသည်

interface PurchaseHistoryProps {
  onClose: () => void;
  onHome?: () => void;
  onData?: () => void;
  onHelp?: () => void;
}

interface ApiOrder {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  placed_at: string;
  sparks_used: number;
}

interface ApiMetaLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface ApiMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: ApiMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

const PRODUCTS_API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;

export default function PurchaseHistory({ onHome, onHelp }: PurchaseHistoryProps) {
  // 🌟 Translation hook ကို ခေါ်ယူထားပါသည်
  const { t } = useTranslation();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  const lastFetchRef = useRef<string>('');

  const fetchOrderHistory = async (pageNumber: number) => {
    const cleanUrl = `${PRODUCTS_API_BASE}/orders?page=${pageNumber}`;
    if (lastFetchRef.current === cleanUrl) return;
    lastFetchRef.current = cleanUrl;

    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(cleanUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const jsonPayload = await response.json();
      setOrders(Array.isArray(jsonPayload?.data) ? jsonPayload.data : []);
      if (jsonPayload?.meta) {
        setMeta(jsonPayload.meta);
        setCurrentPage(jsonPayload.meta.current_page);
      }
    } catch (error) {
      console.error('Failed to sync purchase profiles:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      lastFetchRef.current = '';
    }
  };

  useEffect(() => {
    fetchOrderHistory(currentPage);
  }, [currentPage]);

  const normalizePaginationLabel = (label: string) => {
    return label
      .replace(/&laquo;/g, '«')
      .replace(/&raquo;/g, '»')
      .trim();
  };

  const formatPlacedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (selectedOrderNumber) {
    return (
      <OrderDetail
        orderNumber={selectedOrderNumber}
        onBack={() => setSelectedOrderNumber(null)} 
        onHelp={onHelp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32 overflow-y-auto relative selection:bg-blue-500/10 font-['Poppins'] text-slate-900">
      
      {/* Background Soft Blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[35%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Container */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 h-full flex flex-col space-y-6 font-['Poppins']">
        
        {/* Header Section */}
        <div className="pt-6 sm:pt-8 pb-2">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.04)] rounded-2xl flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
              <img 
                src="/History-icon01.webp" 
                alt="History Reload Icon" 
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight font-['Poppins']">
                {t('myOrders')}
              </h1>
              <p className="text-slate-500 font-normal text-[10px] sm:text-xs uppercase tracking-wider mt-0.5 font-['Poppins']">
                {t('purchaseHistory')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-[32px] p-12 sm:p-20 border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-slate-400 font-normal text-[11px] sm:text-xs uppercase tracking-widest font-['Poppins']">{t('loadingOrders')}</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              
              {/* 🖥️ WEB VIEW */}
              <div className="hidden md:block bg-white border border-slate-100 rounded-[24px] shadow-[0_12px_30px_rgba(15,23,42,0.02)] overflow-hidden font-['Poppins']">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left font-['Poppins']">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100">
                        <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-['Poppins']">{t('orderNumber')}</th>
                        <th className="p-4 pl-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-['Poppins']">{t('paymentMethod')}</th>
                        <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-['Poppins']">{t('placedDate')}</th>
                        <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-['Poppins']">{t('status')}</th>
                        <th className="p-4 pr-6 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest font-['Poppins']">{t('totalValuation')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.map((order) => (
                        <tr 
                          key={order.id} 
                          onClick={() => setSelectedOrderNumber(order.order_number)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                        >
                          <td className="p-4">
                            <span className="text-xs font-normal text-slate-600 group-hover:text-blue-600 font-mono tracking-wide transition-colors">
                              {order.order_number}
                            </span>
                          </td>
                          <td className="p-4 pl-6">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide font-['Poppins']">
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-normal text-slate-500 font-['Poppins']">{formatPlacedDate(order.placed_at)}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border font-['Poppins'] ${
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                              {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                              {order.status === 'cancelled' && <AlertCircle className="w-3 h-3" />}
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <span className="text-sm font-normal text-slate-900 group-hover:text-blue-600 transition-colors font-['Poppins']">
                              {order.total > 0 ? `${order.total.toLocaleString()} MMK` : '0 MMK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 📱 MOBILE VIEW */}
              <div className="block md:hidden space-y-3.5 font-['Poppins']">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrderNumber(order.order_number)}
                    className="bg-white border border-blue-200/60 hover:border-blue-400 active:scale-[0.99] rounded-[22px] p-4 shadow-[0_8px_20px_rgba(37,99,235,0.04)] space-y-3 transition-all cursor-pointer font-['Poppins']"
                  >
                    <div className="flex items-center justify-between border-b border-blue-50 pb-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider font-['Poppins']">{t('orderNo')}</span>
                        <span className="text-xs font-bold text-blue-600 font-mono tracking-wide mt-0.5">{order.order_number}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border font-['Poppins'] ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {order.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {order.status === 'cancelled' && <AlertCircle className="w-2.5 h-2.5" />}
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-normal text-slate-400 uppercase font-['Poppins']">{t('payment')}</span>
                          <span className="font-normal text-slate-700 uppercase truncate text-[11px] font-['Poppins']">{order.payment_method}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-normal text-slate-400 uppercase font-['Poppins']">{t('date')}</span>
                          <span className="font-normal text-slate-700 truncate text-[11px] font-['Poppins']">{formatPlacedDate(order.placed_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/40 rounded-xl p-2.5 flex items-center justify-between border border-blue-100/60 mt-1">
                      <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider font-['Poppins']">{t('totalAmount')}</span>
                      <span className="text-xs sm:text-sm font-normal text-blue-600 font-['Poppins']">
                        {order.total > 0 ? `${order.total.toLocaleString()} MMK` : '0 MMK'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 font-['Poppins']">
                  {meta.links.map((link, index) => {
                    const pageVal = link.page;
                    const isCurrent = link.active;
                    const isDisabled = pageVal === null;
                    const cleanLabel = normalizePaginationLabel(link.label);
                    
                    return (
                      <button
                        key={`${cleanLabel}-${index}`}
                        disabled={isDisabled || isCurrent}
                        onClick={() => pageVal && setCurrentPage(pageVal)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-normal transition-all border cursor-pointer font-['Poppins'] ${
                          isCurrent 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                        } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        {cleanLabel}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {meta && (
                <p className="text-center text-[10px] font-normal text-slate-400 uppercase tracking-widest pt-2 font-['Poppins']">
                  {t('showingRecords', { perPage: meta.per_page, total: meta.total })}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-12 sm:p-16 border border-slate-100 shadow-sm text-center max-w-md mx-auto font-['Poppins']">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 p-3">
                <img 
                  src="/History-icon01.webp" 
                  alt="No Orders Icon" 
                  className="w-full h-full object-contain opacity-60"
                />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 tracking-tight font-['Poppins']">{t('noOrdersFound')}</h3>
              <p className="text-slate-500 text-xs font-normal mb-6 leading-relaxed max-w-[240px] mx-auto font-['Poppins']">
                {t('noOrdersDesc')}
              </p>
              
              <button 
                onClick={onHome}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-normal uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer border-none font-['Poppins']"
              >
                {t('goToShop')}
              </button>
            </div>
          )}
        </div>

        {/* Support Banner Footer Area */}
        {!loading && orders.length > 0 && (
          <div className="pt-4 pb-12 font-['Poppins']">
            <div className="relative overflow-hidden rounded-[24px] p-5 border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.02)] bg-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight font-['Poppins']">{t('needTechSupport')}</p>
                    <p className="text-[10px] text-slate-500 font-normal uppercase tracking-wider mt-0.5 font-['Poppins']">{t('helpCenterDesc')}</p>
                  </div>
                </div>
                <button 
                  onClick={onHelp}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-700 text-[10px] font-normal uppercase tracking-wider cursor-pointer bg-white text-center font-['Poppins']"
                >
                  {t('contactSupportAgent')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}