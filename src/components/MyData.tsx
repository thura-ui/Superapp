import { useState, useEffect } from 'react';
import { Layout, Smartphone, Globe, Activity, ChevronRight, Clock3, BarChart3 } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

interface MyDataProps {
  onClose: () => void;
  onHome?: () => void;
  onOrder?: () => void;
  onHelp?: () => void;
}

interface EsimProfile {
  id: string;
  country_name: string;
  data_amount: string;
  validity_days: number;
  status: 'active' | 'inactive' | 'expired';
  remaining_data?: string;
  total_data?: string;
  usage_percentage?: number;
}

export default function MyData({ onHome, onOrder, onHelp }: MyDataProps) {
  const [profiles, setProfiles] = useState<EsimProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - in real app this would call Supabase and Edge Function
    const timer = setTimeout(() => {
      setProfiles([
        /* Example data if needed or keep empty to show "no data" */
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] pb-32 overflow-y-auto relative">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="px-6 pt-10 pb-4">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
              <BarChart3 className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">My Data</h1>
              <p className="text-cyan-200/60 font-black text-xs uppercase tracking-[0.2em]">Active eSIM Usage</p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-12 shadow-2xl border border-white/10 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mb-6 shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
              <p className="text-cyan-100 font-black text-sm uppercase tracking-widest">Scanning Usage...</p>
            </div>
          ) : profiles.length > 0 ? (
            <div className="space-y-5">
              {profiles.map((profile) => (
                <div key={profile.id} className="relative overflow-hidden rounded-[32px] p-6 shadow-2xl border border-white/10 group">
                  {/* Glass Base */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-lg group-hover:bg-white/10 transition-all" />
                  
                  {/* Raindrop & Wipe Texture */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0.5px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.8) 1px, transparent 3px)`,
                      backgroundSize: '80px 80px',
                      maskImage: 'radial-gradient(circle at center, transparent 40%, black 90%)',
                      WebkitMaskImage: 'radial-gradient(circle at center, transparent 40%, black 90%)',
                    }}
                  />

                  <div className="relative z-10 flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <Globe className="w-6 h-6 text-cyan-300" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg tracking-tight">{profile.country_name}</h3>
                        <div className="mt-1 px-2 py-0.5 bg-teal-500/20 rounded-md inline-block border border-teal-400/30">
                          <p className="text-[10px] text-teal-300 font-black uppercase tracking-wider">{profile.status}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white">{profile.remaining_data} / {profile.total_data}</p>
                      <p className="text-[10px] text-cyan-200/40 font-black uppercase tracking-widest mt-1">REMAINING</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar Glass */}
                  <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)] transition-all duration-1000"
                      style={{ width: `${profile.usage_percentage || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[40px] p-10 shadow-2xl border border-white/10 text-center group">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto rounded-[32px] bg-white/5 backdrop-blur-md flex items-center justify-center mb-8 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Smartphone className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No Active eSIMs</h3>
                <p className="text-cyan-100/60 font-bold mb-10 leading-relaxed max-w-[240px] mx-auto">Purchase an eSIM plan to start tracking your data usage.</p>
                
                {/* Crystal Blue Glass Button */}
                <button 
                  onClick={onHome}
                  className="w-full relative overflow-hidden rounded-[24px] py-5 group/btn transition-all active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-md" />
                  <span className="relative z-10 text-white font-black uppercase tracking-[0.15em] text-sm">View Plans</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Card - Darker Frosted Glass */}
        <div className="px-6 mb-12">
          <div className="relative overflow-hidden rounded-[32px] p-8 border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full -mr-24 -mt-24 blur-[60px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-400/20 rounded-lg border border-teal-400/30">
                  <Activity className="w-5 h-5 text-teal-300" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">Pro Tip</span>
              </div>
              <h4 className="text-xl font-black text-white mb-2 tracking-tight">Enable Data Roaming</h4>
              <p className="text-cyan-100/60 font-bold text-sm leading-relaxed">To use your eSIM data, ensure <span className="text-cyan-300">"Data Roaming"</span> is switched ON in your device settings for this line.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
