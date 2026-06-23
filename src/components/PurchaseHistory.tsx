import { useState, useEffect } from 'react';
import { Clock3, History, Globe, ChevronRight, CheckCircle2, AlertCircle, Signal } from 'lucide-react';

interface PurchaseHistoryProps {
  onClose: () => void;
  onHome?: () => void;
  onData?: () => void;
  onHelp?: () => void;
}

interface Order {
  id: string;
  order_no: string;
  country_name: string;
  package_name: string;
  data_amount: string;
  validity: string;
  purchase_date: string;
  status: 'completed' | 'pending' | 'failed';
  price: string;
}

export default function PurchaseHistory({ onHome, onData, onHelp }: PurchaseHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - in real app this would call Supabase
    const timer = setTimeout(() => {
      setOrders([
        {
          id: '1',
          order_no: 'ORD-2026-001',
          country_name: 'Thailand',
          package_name: 'Thailand Travel eSIM',
          data_amount: '5GB',
          validity: '7 Days',
          purchase_date: 'June 08, 2026',
          status: 'completed',
          price: '$9.99'
        },
        {
          id: '2',
          order_no: 'ORD-2026-002',
          country_name: 'Singapore',
          package_name: 'Singapore Premium Plan',
          data_amount: '10GB',
          validity: '30 Days',
          purchase_date: 'June 05, 2026',
          status: 'completed',
          price: '$19.99'
        }
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] pb-32 overflow-y-auto relative">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="px-6 pt-10 pb-4">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
              <History className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">My Orders</h1>
              <p className="text-cyan-200/60 font-black text-xs uppercase tracking-[0.2em]">Purchase History</p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-12 shadow-2xl border border-white/10 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent mb-6 shadow-[0_0_15px_rgba(129,140,248,0.3)]"></div>
              <p className="text-indigo-100 font-black text-sm uppercase tracking-widest">Loading Orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-5 pr-1 custom-scrollbar">
              {orders.map((order) => (
                <div key={order.id} className="relative overflow-hidden rounded-[32px] p-6 shadow-2xl border border-white/10 group active:scale-[0.99] transition-all">
                  {/* Glass Base */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-lg" />
                  
                  {/* Raindrop & Wipe Texture */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.8) 0.5px, transparent 2px), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.8) 1px, transparent 3px)`,
                      backgroundSize: '100px 100px',
                      maskImage: 'radial-gradient(circle at center, transparent 45%, black 95%)',
                      WebkitMaskImage: 'radial-gradient(circle at center, transparent 45%, black 95%)',
                    }}
                  />

                  <div className="relative z-10 flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <Globe className="w-6 h-6 text-cyan-300" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg leading-tight tracking-tight">{order.country_name}</h3>
                        <p className="text-[10px] text-cyan-200/40 font-black uppercase tracking-widest mt-1">{order.order_no}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]' :
                        order.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]' :
                        'bg-rose-500/20 text-rose-300 border-rose-400/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                      }`}>
                        {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {order.status === 'pending' && <Clock3 className="w-3 h-3" />}
                        {order.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        {order.status}
                      </span>
                      <p className="mt-3 text-white font-black text-xl tracking-tight">{order.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
                    <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-3 border border-white/10">
                      <p className="text-[9px] text-cyan-200/40 font-black uppercase tracking-widest mb-1">Package</p>
                      <p className="text-sm font-black text-white">{order.data_amount} / {order.validity}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-3 border border-white/10">
                      <p className="text-[9px] text-cyan-200/40 font-black uppercase tracking-widest mb-1">Purchased</p>
                      <p className="text-sm font-black text-white">{order.purchase_date}</p>
                    </div>
                  </div>

                  {/* Crystal Action Button */}
                  <button className="w-full relative overflow-hidden py-4 rounded-[20px] group/btn transition-all active:scale-95 shadow-lg border border-white/10">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-md group-hover/btn:bg-white/15 transition-all" />
                    <div className="relative z-10 flex items-center justify-center gap-2 text-cyan-300 font-black text-xs uppercase tracking-[0.2em]">
                      <Signal className="w-4 h-4" />
                      Signal Info & Details
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[40px] p-10 shadow-2xl border border-white/10 text-center group">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto rounded-[32px] bg-white/5 backdrop-blur-md flex items-center justify-center mb-8 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <History className="w-12 h-12 text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No Orders Found</h3>
                <p className="text-indigo-100/60 font-bold mb-10 leading-relaxed max-w-[240px] mx-auto">You haven't purchased any eSIM plans yet.</p>
                
                <button 
                  onClick={onHome}
                  className="w-full relative overflow-hidden rounded-[24px] py-5 group/btn transition-all active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.2)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-md" />
                  <span className="relative z-10 text-white font-black uppercase tracking-[0.15em] text-sm">Go to Shop</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support Section - Frosted Glass Bar */}
        {!loading && orders.length > 0 && (
          <div className="px-6 mb-12">
            <div className="relative overflow-hidden rounded-[28px] p-5 border border-white/10 shadow-2xl group">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                    <Clock3 className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white tracking-tight">Need Help?</p>
                    <p className="text-[10px] text-cyan-200/40 font-black uppercase tracking-widest">24/7 Support</p>
                  </div>
                </div>
                <button 
                  onClick={onHelp}
                  className="relative overflow-hidden px-5 py-2.5 rounded-xl transition-all active:scale-95 border border-white/20 group/contact"
                >
                  <div className="absolute inset-0 bg-cyan-500/20 group-hover/contact:bg-cyan-500/30 transition-all" />
                  <span className="relative z-10 text-cyan-100 text-[10px] font-black uppercase tracking-widest">Contact Us</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
