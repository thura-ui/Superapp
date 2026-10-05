import { useState, useEffect, useRef } from 'react';
import { Clock3, CheckCircle2, AlertCircle, CreditCard, Calendar, ArrowLeft, ShoppingBag } from 'lucide-react';
import OrderDetail from './OrderDetail'; 
import { useTranslation } from 'react-i18next';

interface ApiOrderItem {
  product_name: string;
  data_plan?: string | null;
  days?: number | null;
  plan_type?: string | null;
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
  items?: ApiOrderItem[];
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

interface PurchaseHistoryProps {
  onClose: () => void;
  onBackToAccount?: () => void;
  onHome?: () => void;
  onData?: () => void;
  onHelp?: () => void;
}

const PRODUCTS_API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;

export default function PurchaseHistory({ onClose, onBackToAccount, onHome, onHelp }: PurchaseHistoryProps) {
  const { t } = useTranslation();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  const lastFetchRef = useRef<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedOrderNumber]);

  const fetchOrderHistory = async (pageNumber: number) => {
    const cleanUrl = `${PRODUCTS_API_BASE}/orders?page=${pageNumber}`;
    if (lastFetchRef.current === cleanUrl) return;
    lastFetchRef.current = cleanUrl;

    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setLoading(false);
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

  const handleBackToAccount = () => {
    if (onBackToAccount) {
      onBackToAccount();
    } else if (onClose) {
      onClose();
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
    <div className="min-h-screen bg-slate-50/50 pt-20 sm:pt-28 pb-24 sm:pb-32 overflow-y-auto relative selection:bg-blue-500/10 font-['Poppins'] text-slate-900 mobile-typography-fix">
      
      {/* Background Soft Blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[35%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Container */}
      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex flex-col space-y-4 sm:space-y-6 font-['Poppins'] layout-container">
        
        {/* Header Section */}
        <div className="pt-2 sm:pt-4 pb-2">
          
          {/* Back to Account Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToAccount}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs cursor-pointer font-['Poppins'] active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              <span>{t('backToAccount', 'Back to Account')}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
            <img 
              src="/History-icon02.png" 
              alt="History Reload Icon" 
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
            />

            <div>
              <h1 className="text-base sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight font-['Poppins']">
                {t('myOrders')}
              </h1>
              <p className="text-blue-600 font-semibold text-xs sm:text-[13px] uppercase tracking-wider mt-0.5 font-['Poppins']">
                {t('purchaseHistory')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-[20px] sm:rounded-[32px] p-8 sm:p-20 border border-slate-100 shadow-xs flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-7 w-7 sm:h-10 sm:w-10 border-3 sm:border-4 border-blue-600 border-t-transparent mb-3 sm:mb-4"></div>
              <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest font-['Poppins']">{t('loadingOrders')}</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              
              {/* 🖥️ WEB VIEW */}
              <div className="hidden md:block bg-white border border-slate-100 rounded-[24px] shadow-[0_12px_30px_rgba(15,23,42,0.02)] overflow-hidden font-['Poppins'] relative">
                <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full min-w-[900px] border-collapse text-left font-['Poppins'] relative">
                    <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm shadow-xs border-b border-slate-100">
                      <tr>
                        <th className="p-4 text-xs font-extrabold text-slate-900 uppercase tracking-widest font-['Poppins']">{t('orderNumber')}</th>
                        <th className="p-4 text-xs font-extrabold text-slate-900 uppercase tracking-widest font-['Poppins']">{t('product', 'Product')}</th>
                        <th className="p-4 text-xs font-extrabold text-slate-900 uppercase tracking-widest font-['Poppins']">{t('paymentMethod')}</th>
                        <th className="p-4 text-xs font-extrabold text-slate-900 uppercase tracking-widest font-['Poppins']">{t('placedDate')}</th>
                        <th className="p-4 text-xs font-extrabold text-slate-900 uppercase tracking-widest font-['Poppins']">{t('status')}</th>
                        <th className="p-4 pr-6 text-right text-xs font-extrabold text-slate-900 uppercase tracking-widest font-['Poppins']">{t('totalValuation')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {orders.map((order) => (
                        <tr 
                          key={order.id} 
                          onClick={() => setSelectedOrderNumber(order.order_number)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                        >
                          <td className="p-4">
                            <span className="text-xs lg:text-[13px] font-semibold text-slate-800 group-hover:text-blue-600 font-mono tracking-wide transition-colors">
                              {order.order_number}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs lg:text-[13px] font-bold text-slate-900 line-clamp-1">
                              {order.items && order.items.length > 0 ? order.items.map(item => item.product_name).join(', ') : '-'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs lg:text-[13px] font-bold text-slate-900 uppercase tracking-wide font-['Poppins']">
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs lg:text-[13px] font-semibold text-slate-700 font-['Poppins']">{formatPlacedDate(order.placed_at)}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border font-['Poppins'] ${
                              order.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                              {order.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                              {order.status === 'cancelled' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <span className="text-xs lg:text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-['Poppins']">
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
              <div className="block md:hidden space-y-3 font-['Poppins'] max-h-[75vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrderNumber(order.order_number)}
                    className="bg-white border border-blue-200/60 hover:border-blue-400 active:scale-[0.99] rounded-[20px] p-3.5 shadow-xs space-y-2.5 transition-all cursor-pointer font-['Poppins'] mx-0.5"
                  >
                    <div className="flex items-start justify-between border-b border-blue-50 pb-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider font-['Poppins']">{t('orderNo')}</span>
                        <span className="text-xs font-bold text-blue-600 font-mono tracking-wide mt-0.5">{order.order_number}</span>
                        
                        {order.items && order.items.length > 0 && (
                          <span className="text-[12px] font-bold text-slate-800 mt-1.5 leading-tight">
                            {order.items.map(item => item.product_name).join(', ')}
                          </span>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border font-['Poppins'] mt-1 ${
                        order.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {order.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                        {order.status === 'cancelled' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider font-['Poppins']">{t('payment')}</span>
                          <span className="font-bold text-slate-900 uppercase truncate text-xs font-['Poppins']">{order.payment_method}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider font-['Poppins']">{t('date')}</span>
                          <span className="font-semibold text-slate-900 truncate text-xs font-['Poppins']">{formatPlacedDate(order.placed_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/40 rounded-xl p-2.5 flex items-center justify-between border border-blue-100/60 mt-1">
                      <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider font-['Poppins']">{t('totalAmount')}</span>
                      <span className="text-xs font-bold text-blue-600 font-['Poppins']">
                        {order.total > 0 ? `${order.total.toLocaleString()} MMK` : '0 MMK'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 sm:pt-4 font-['Poppins']">
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
                        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer font-['Poppins'] ${
                          isCurrent 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                        } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        {cleanLabel}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {meta && (
                <p className="text-center text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest pt-1 sm:pt-2 font-['Poppins']">
                  {t('showingRecords', { perPage: meta.per_page, total: meta.total })}
                </p>
              )}
            </div>
          ) : (
            /* Empty State Area */
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-8 sm:p-16 border border-slate-100 shadow-xs text-center max-w-md mx-auto font-['Poppins']">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center mb-4 sm:mb-6 p-3 shadow-xs">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 opacity-80" />
              </div>

              <h3 className="text-sm sm:text-lg font-bold text-slate-900 mb-1.5 sm:mb-2 tracking-tight font-['Poppins']">{t('noOrdersFound')}</h3>
              <p className="text-slate-500 text-xs font-semibold mb-5 sm:mb-6 leading-relaxed max-w-[240px] mx-auto font-['Poppins']">
                {t('noOrdersDesc')}
              </p>
              
              <button 
                onClick={onHome}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 sm:py-3 rounded-xl text-white font-bold uppercase tracking-wider text-xs transition-all shadow-xs cursor-pointer border-none font-['Poppins'] active:scale-95"
              >
                {t('goToShop')}
              </button>
            </div>
          )}
        </div>

        {/* Support Banner Footer Area */}
        {!loading && orders.length > 0 && (
          <div className="pt-2 sm:pt-4 pb-8 sm:pb-12 font-['Poppins']">
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-xs bg-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock3 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-900 font-['Poppins']">{t('needTechSupport')}</p>
                    {/* 🔴 [UPDATED]: Sub-text အား Top Nav စတိုင်လ် (text-[11px] font-semibold tracking-wide text-slate-500) အဖြစ် ညှိထားသည် 🔴 */}
                    <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mt-0.5 font-['Poppins']">{t('helpCenterDesc')}</p>
                  </div>
                </div>
                <button 
                  onClick={onHelp}
                  className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2 rounded-full border border-slate-200/80 hover:bg-slate-50 transition-all text-slate-900 text-xs font-semibold tracking-wide cursor-pointer bg-white text-center font-['Poppins'] active:scale-95 shadow-xs"
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