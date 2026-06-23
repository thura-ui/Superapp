import { useEffect, useState } from 'react';
import { User, LogOut, Zap, Shield, Smartphone, BarChart3, Headphones, Globe } from 'lucide-react';
import { getCachedProfile, getProfile, type AuthProfile } from '../lib/authApi';

interface AccountDetailsProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function AccountDetails({ onBack, onLogout }: AccountDetailsProps) {
  const [userData, setUserData] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedProfile();
    if (cached) setUserData(cached);

    getProfile()
      .then(setUserData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  const displayData = {
    name: userData?.name || 'Simless User',
    email: userData?.email || 'user@gmail.com',
    phone: userData?.phone || '+1234567890',
    points: 5800,
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl border-4 border-white/10">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">{displayData.name}</h1>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold mt-1">
            <Shield className="w-3 h-3" /> Verified
          </span>
        </div>

        {/* Loyalty Program Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-black text-white mb-4">Account Dashboard & Loyalty Program</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Points */}
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl font-black text-white mb-1">{displayData.points.toLocaleString()}</div>
              <p className="text-teal-300 font-bold text-sm">Loyalty Points</p>
              <p className="text-white/40 text-xs mt-1">Status: Gold Member</p>
              <div className="mt-3 w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full" style={{ width: '58%' }} />
              </div>
              <p className="text-white/40 text-[10px] mt-1">Points to Platinum: 4,200</p>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-teal-300" />
                <div>
                  <p className="text-white/40 text-xs">Point Balance</p>
                  <p className="text-white font-bold text-sm">{displayData.points.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-teal-300" />
                <div>
                  <p className="text-white/40 text-xs">Last Earned</p>
                  <p className="text-white font-bold text-sm">+150 from Plan Purchase</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-teal-300" />
                <div>
                  <p className="text-white/40 text-xs">Points Expiry</p>
                  <p className="text-white font-bold text-sm">12 months</p>
                </div>
              </div>
            </div>

            {/* Account Settings & Tier Benefits */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-white font-bold text-sm mb-2">Account Settings</h4>
                <ul className="text-white/50 text-xs space-y-1.5">
                  <li>Edit Profile</li>
                  <li>Change Password</li>
                  <li>Add Payment Method</li>
                  <li>Language: English</li>
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-white font-bold text-sm mb-2">Tier Benefits</h4>
                <p className="text-teal-300 font-bold text-xs">Gold Member</p>
                <ul className="text-white/50 text-xs space-y-1 mt-1">
                  <li>Priority Support</li>
                  <li>Exclusive Plan Discounts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Globe, title: 'Plan Management', subtitle: 'Current Plan:', value: 'Global Ultra 20GB', action: 'Change Plan', actionSub: 'Top-up Data' },
            { icon: BarChart3, title: 'Data Status', subtitle: '', value: 'Used: 10.3GB / 20GB', action: '', actionSub: '' },
            { icon: Smartphone, title: 'Device Compatibility', subtitle: '', value: 'iPhone 13, Galaxy S21', action: 'Check Another', actionSub: '' },
            { icon: Headphones, title: 'Support Tickets', subtitle: 'Recent Tickets:', value: '[No active tickets]', action: 'New Support Request', actionSub: '' },
            { icon: Shield, title: 'Partner Program', subtitle: 'Status:', value: 'Registered Affiliate', action: 'Partner Dashboard', actionSub: '' },
          ].map(card => (
            <div key={card.title} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-teal-400/20">
                <card.icon className="w-5 h-5 text-teal-300" />
              </div>
              <h4 className="text-white font-bold text-xs mb-1">{card.title}</h4>
              {card.subtitle && <p className="text-white/40 text-[10px]">{card.subtitle}</p>}
              <p className="text-white/70 text-[11px] font-medium mt-1">{card.value}</p>
              {card.action && (
                <button className="mt-2 px-3 py-1.5 bg-teal-500/20 text-teal-300 font-bold text-[10px] rounded-lg border border-teal-400/30">
                  {card.action}
                </button>
              )}
              {card.actionSub && (
                <p className="text-white/40 text-[10px] mt-1 cursor-pointer hover:text-white/60">{card.actionSub}</p>
              )}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="text-center">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-8 py-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
