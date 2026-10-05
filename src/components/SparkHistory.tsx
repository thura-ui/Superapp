import { useEffect, useState } from 'react';
import { ArrowLeft, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getTotalSparks } from '../lib/authApi';
import { useTranslation } from 'react-i18next';

interface SparkLog {
  id: number;
  customer_id: number;
  amount: number;
  type: string;
  description: string;
  order_id: number | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SparkHistoryProps {
  onBack: () => void;
}

const API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;

export default function SparkHistory({ onBack }: SparkHistoryProps) {
  const { t } = useTranslation();

  const [sparkLogs, setSparkLogs] = useState<SparkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSparks, setTotalSparks] = useState<number>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    getTotalSparks()
      .then((res) => setTotalSparks(res.total_sparks))
      .catch(console.error);

    const fetchSparkHistory = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/sparks/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken || ''}`
          }
        });

        if (response.ok) {
          const jsonPayload = await response.json();
          setSparkLogs(Array.isArray(jsonPayload?.data) ? jsonPayload.data : []);
        }
      } catch (error) {
        console.error('Failed to sync spark history entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSparkHistory();
  }, []);

  const formatLogDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'used':
        return { box: 'bg-rose-500/5 text-rose-600 border-rose-500/10', dot: 'bg-rose-500', accent: 'bg-rose-500' };
      case 'gift':
        return { box: 'bg-amber-500/5 text-amber-600 border-amber-500/10', dot: 'bg-amber-500', accent: 'bg-amber-500' };
      default:
        return { box: 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10', dot: 'bg-emerald-500', accent: 'bg-emerald-500' };
    }
  };

  return (
    <div className="pt-20 sm:pt-28 pb-8 px-3 sm:px-6 lg:px-4 max-w-6xl mx-auto selection:bg-amber-500/10 min-h-screen font-['Poppins'] text-slate-900 mobile-typography-fix layout-container">
      
      {/* Header Container */}
      <div className="bg-white rounded-[20px] sm:rounded-2xl p-3.5 sm:p-6 shadow-xs border border-slate-100 flex flex-row items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-4 font-['Poppins']">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
          <button 
            onClick={onBack}
            className="p-1.5 sm:p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs cursor-pointer shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </button>
          <div className="min-w-0 flex-1 pr-2 flex flex-col justify-center">
            <h1 className="text-[15px] sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2 font-['Poppins'] whitespace-nowrap">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500 shrink-0" /> 
              <span className="truncate">{t('sparkHistoryTitle')}</span>
            </h1>
            <p className="hidden sm:block text-slate-500 text-[9.5px] sm:text-xs mt-1 font-['Poppins'] leading-snug whitespace-normal break-words">
              {t('sparkHistoryDesc')}
            </p>
          </div>
        </div>

        {/* Total Balance Badge (Glassmorphism & Centered Layout) */}
        <div className="bg-blue-600/80 backdrop-blur-md border border-blue-400/40 text-white px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[0_4px_12px_rgba(37,99,235,0.25)] shrink-0 flex flex-col justify-center text-center sm:text-left font-['Poppins'] min-w-[70px] sm:min-w-auto">
          <span className="text-[7.5px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-100 block whitespace-nowrap mb-0.5">{t('totalBalance')}</span>
          <span className="text-[11px] sm:text-lg font-bold whitespace-nowrap text-white">{totalSparks.toLocaleString()} Sparks</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-3 sm:border-4 border-amber-500 border-t-transparent" />
        </div>
      )}

      {!loading && sparkLogs.length === 0 && (
        <div className="text-center py-16 text-slate-400 font-semibold text-[11px] sm:text-xs uppercase tracking-wider border border-dashed border-slate-200 rounded-[20px] sm:rounded-2xl bg-slate-50/50 font-['Poppins']">
          {t('noSparksFound')}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && sparkLogs.length > 0 && (
        <div className="hidden md:block animate-in fade-in duration-300 font-['Poppins']">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {t('transactions')} ({sparkLogs.length})
          </p>

          <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-50/70 px-5 py-3 border-b border-slate-100 grid grid-cols-12 gap-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <span className="col-span-2">Order ID</span>
              <span className="col-span-2">{t('type')}</span>
              <span className="col-span-2 text-center">{t('points')}</span>
              <span className="col-span-2 text-center">{t('date')}</span>
              <span className="col-span-4 text-center">{t('description')}</span>
            </div>
            
            <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {sparkLogs.map((log) => {
                const isNegative = log.amount < 0;
                const style = getTypeStyle(log.type);

                return (
                  <div key={log.id} className="px-5 py-3.5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/40 transition-colors font-['Poppins']">
                    
                    <div className="col-span-2 flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isNegative ? 'bg-rose-50 border border-rose-100/40' : 'bg-emerald-50 border border-emerald-100/40'}`}>
                        {isNegative 
                          ? <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" />
                          : <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        }
                      </div>
                      <span className="font-semibold text-slate-800 text-[11px] lg:text-xs truncate">
                        {log.order_id ? `#${log.order_id}` : '—'}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] border font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${style.box}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className={`font-bold text-xs lg:text-[13px] ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isNegative ? '' : '+'}{log.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="text-[11px] lg:text-xs font-medium text-slate-500">{formatLogDate(log.created_at)}</span>
                    </div>

                    <div className="col-span-4 text-center min-w-0">
                      <span className="text-xs lg:text-[13px] font-semibold text-slate-700 truncate block">{log.description || '—'}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && sparkLogs.length > 0 && (
        <div className="md:hidden space-y-3 animate-in fade-in duration-300 font-['Poppins']">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" /> {t('transactions')} ({sparkLogs.length})
          </p>

          <div className="grid grid-cols-1 gap-3">
            {sparkLogs.map((log) => {
              const isNegative = log.amount < 0;
              const style = getTypeStyle(log.type);

              return (
                <div
                  key={log.id}
                  className="group bg-white border border-blue-200/60 rounded-[20px] p-4 shadow-xs relative flex flex-col gap-2.5 overflow-hidden font-['Poppins']"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${style.accent}`} />

                  <div className="flex items-center justify-between gap-2 pl-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isNegative ? 'bg-rose-50 border border-rose-100/40' : 'bg-emerald-50 border border-emerald-100/40'}`}>
                        {isNegative 
                          ? <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" />
                          : <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        }
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-[11px] sm:text-xs truncate">
                          Order ID: {log.order_id ? `#${log.order_id}` : '—'}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-0.5">
                          {formatLogDate(log.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] border font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${style.box}`}>
                        <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* 🔴 အထဲက Inner Card Box ကိုပါ အပြာနုရောင် border (border-blue-200/50) ထည့်သွင်းပေးထားပါသည် 🔴 */}
                  <div className="grid grid-cols-12 gap-2 bg-slate-50/80 p-3 rounded-xl ml-2 font-['Poppins'] items-start border border-blue-200/50 mt-1">
                    <div className="col-span-4 text-center border-r border-blue-200/50 pt-0.5 pr-1">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{t('points')}</span>
                      <span className={`font-bold text-[11.5px] sm:text-xs ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isNegative ? '' : '+'}{log.amount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="col-span-8 text-left pl-2">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{t('description')}</span>
                      <span className="font-semibold text-slate-700 text-[10.5px] sm:text-xs block whitespace-normal break-words leading-relaxed">
                        {log.description || '—'}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}