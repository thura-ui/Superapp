import { useEffect, useState } from 'react';
import { ArrowLeft, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getTotalSparks } from '../lib/authApi';
import { useTranslation } from 'react-i18next'; // 🌟 i18next ကို import လုပ်ထားပါသည်

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
    <div className="py-8 px-4 sm:px-6 lg:px-4 max-w-6xl mx-auto selection:bg-amber-500/10 min-h-screen font-['Poppins'] text-slate-900">
      
      {/* 🌟 Header Container (Mobile တွင် တစ်ကြောင်းတည်းဆန့်စေရန် flex-row ပြောင်းပြီး အရွယ်အစား ညှိထားပါသည်) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-row items-center justify-between mb-6 sm:mb-8 gap-2 sm:gap-4 font-['Poppins']">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={onBack}
            className="p-1.5 sm:p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-sm cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 h-5 text-slate-700" />
          </button>
          <div className="min-w-0">
            {/* Title သည် နောက်တစ်ကြောင်း မဆင်းစေရန် whitespace-nowrap ထည့်ထားပါသည် */}
            <h1 className="text-[13px] sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-1 sm:gap-2 font-['Poppins'] whitespace-nowrap">
              <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-500 fill-amber-500 shrink-0" /> 
              <span className="truncate">{t('sparkHistoryTitle')}</span>
            </h1>
            <p className="text-slate-400 text-[9px] sm:text-xs mt-0.5 font-['Poppins'] truncate block">
              {t('sparkHistoryDesc')}
            </p>
          </div>
        </div>

        {/* Total Balance Badge */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md shrink-0 text-right sm:text-left font-['Poppins']">
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 block whitespace-nowrap">{t('totalBalance')}</span>
          <span className="text-[11px] sm:text-lg font-black whitespace-nowrap">{totalSparks.toLocaleString()} Sparks</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent" />
        </div>
      )}

      {!loading && sparkLogs.length === 0 && (
        <div className="text-center py-16 text-slate-400 font-bold text-xs uppercase tracking-wider border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 font-['Poppins']">
          {t('noSparksFound')}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && sparkLogs.length > 0 && (
        <div className="hidden md:block animate-in fade-in duration-300 font-['Poppins']">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {t('transactions')} ({sparkLogs.length})
          </p>

          <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-slate-50/70 px-5 py-3 border-b border-slate-100 grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="col-span-4">{t('description')}</span>
              <span className="col-span-2">{t('type')}</span>
              <span className="col-span-2 text-center">{t('points')}</span>
              <span className="col-span-2 text-center">{t('order')}</span>
              <span className="col-span-2 text-right">{t('date')}</span>
            </div>
            <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100">
              {sparkLogs.map((log) => {
                const isNegative = log.amount < 0;
                const style = getTypeStyle(log.type);

                return (
                  <div key={log.id} className="px-5 py-3.5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/40 transition-colors font-['Poppins']">
                    <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isNegative ? 'bg-rose-50 border border-rose-100/40' : 'bg-emerald-50 border border-emerald-100/40'}`}>
                        {isNegative 
                          ? <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" />
                          : <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        }
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">{log.description}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] border font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${style.box}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`font-black text-xs ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isNegative ? '' : '+'}{log.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="font-bold text-slate-600 text-[11px]">
                        {log.order_id ? `#${log.order_id}` : '—'}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-[11px] font-medium text-slate-400">{formatLogDate(log.created_at)}</span>
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
        <div className="md:hidden space-y-4 animate-in fade-in duration-300 font-['Poppins']">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {t('transactions')} ({sparkLogs.length})
          </p>

          <div className="grid grid-cols-1 gap-4">
            {sparkLogs.map((log) => {
              const isNegative = log.amount < 0;
              const style = getTypeStyle(log.type);

              return (
                <div
                  key={log.id}
                  className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative flex flex-col gap-3 overflow-hidden font-['Poppins']"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${style.accent}`} />

                  <div className="flex items-center justify-between gap-2 pl-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isNegative ? 'bg-rose-50 border border-rose-100/40' : 'bg-emerald-50 border border-emerald-100/40'}`}>
                        {isNegative 
                          ? <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                          : <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        }
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 text-sm truncate no-underline decoration-0">
                          {log.description}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400">
                          {formatLogDate(log.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] border font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${style.box}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl ml-2 font-['Poppins']">
                    <div className="text-center">
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-tight block">{t('points')}</span>
                      <span className={`font-black text-xs ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isNegative ? '' : '+'}{log.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center border-l border-slate-200">
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-tight block">{t('order')}</span>
                      <span className="font-bold text-slate-600 text-[11px]">
                        {log.order_id ? `#${log.order_id}` : '—'}
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