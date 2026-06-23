import { useState, useEffect } from 'react';
import { Smartphone, Globe, Activity, BarChart3, Play, Navigation, MessageCircle, Monitor } from 'lucide-react';

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

function GaugeChart({ used, total }: { used: number; total: number }) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const angle = -90 + (percentage / 100) * 180;

  return (
    <div className="relative w-64 h-36 mx-auto">
      {/* Gauge arc background */}
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(percentage / 100) * 251} 251`}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Needle */}
      <div
        className="absolute bottom-2 left-1/2 origin-bottom w-0.5 h-16 bg-white rounded-full transition-transform duration-1000"
        style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />

      {/* Labels */}
      <div className="absolute bottom-0 left-4 text-white/40 text-[10px] font-bold">0GB</div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold">{(total / 2).toFixed(0)}GB</div>
      <div className="absolute bottom-0 right-4 text-white/40 text-[10px] font-bold">{total}GB</div>
    </div>
  );
}

function BarChartSimple({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const days = ['Day 19', 'Day 20', 'Day 21', 'Day 22', 'Day 23', 'Day 24', 'Day 25', 'Day 26', 'Day 27', 'Day 28'];

  return (
    <div className="flex items-end gap-1.5 h-28 px-2">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-sm min-h-[4px] transition-all"
            style={{ height: `${(val / max) * 100}%` }}
          />
          <span className="text-[8px] text-white/30 whitespace-nowrap">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function MyData({ onHome }: MyDataProps) {
  const [profiles, setProfiles] = useState<EsimProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProfiles([]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const mockUsed = 10.3;
  const mockTotal = 20;
  const hasData = profiles.length > 0;

  const dailyUsage = [8, 5, 12, 9, 14, 7, 10, 6, 11, 3];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-white text-center mb-8">My Data Checked</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-400 border-t-transparent" />
          </div>
        ) : !hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main gauge card */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h2 className="text-xl font-black text-white text-center mb-6">Data Usage Status</h2>

              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <GaugeChart used={mockUsed} total={mockTotal} />
                  <p className="text-center text-2xl font-black text-white mt-2">{mockUsed}GB</p>
                  <p className="text-center text-white/40 text-xs">Used / Remaining: {(mockTotal - mockUsed).toFixed(1)}GB</p>
                </div>

                {/* Account Details side */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[200px]">
                  <h3 className="font-bold text-white text-sm mb-3">Account Details</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-teal-300" />
                    </div>
                    <span className="text-white font-bold text-sm">Simless User</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-white/50">Plan: <span className="text-white font-bold">Global Ultra 20GB</span></p>
                    <p className="text-white/50">Validity Remaining: <span className="text-white font-bold">12 days</span></p>
                    <p className="text-white/50">Renewal Date: <span className="text-white font-bold">[Future Date]</span></p>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-6 flex items-center gap-3 justify-center">
                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden max-w-xs">
                  <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: `${(mockUsed / mockTotal) * 100}%` }} />
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" /> Status: Verified & Live
                </span>
              </div>
            </div>

            {/* Data Breakdown */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-5">Data Breakdown</h3>
              <div className="space-y-4">
                {[
                  { icon: Play, label: 'Streaming', amount: '3.2GB', color: 'text-red-400' },
                  { icon: Navigation, label: 'Navigation', amount: '2.1GB', color: 'text-blue-400' },
                  { icon: MessageCircle, label: 'Social Media', amount: '4.0GB', color: 'text-teal-400' },
                  { icon: Monitor, label: 'Web Browsing', amount: '1.0GB', color: 'text-cyan-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{item.amount}</p>
                      <p className="text-white/40 text-xs">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Chart */}
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Daily Usage (Last 10 Days)</h3>
              <BarChartSimple data={dailyUsage} />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                      <Globe className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{profile.country_name}</h3>
                      <span className="text-xs text-teal-300 font-bold uppercase">{profile.status}</span>
                    </div>
                  </div>
                  <p className="text-white font-bold">{profile.remaining_data} / {profile.total_data}</p>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                    style={{ width: `${profile.usage_percentage || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pro Tip */}
        <div className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-400/20 rounded-lg border border-teal-400/30">
              <Activity className="w-4 h-4 text-teal-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-teal-300">Pro Tip</span>
          </div>
          <h4 className="text-lg font-black text-white mb-1">Enable Data Roaming</h4>
          <p className="text-white/50 text-sm">Ensure "Data Roaming" is switched ON in your device settings to use your eSIM data abroad.</p>
        </div>

        {!hasData && (
          <div className="mt-6 text-center">
            <button
              onClick={onHome}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              View Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
