import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Mail, Phone, ArrowLeft, Zap, Gift, Share2, Download } from 'lucide-react';
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
    if (cached) {
      setUserData(cached);
    }

    getProfile()
      .then(setUserData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  const displayData = {
    name: userData?.name || "Simless User",
    email: userData?.email || "user@gmail.com",
    phone: userData?.phone || "+1234567890",
    sparks: 550
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] pb-32 relative overflow-hidden">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-teal-400/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
            <ArrowLeft className="w-6 h-6 text-cyan-300" />
          </button>
          <h1 className="text-2xl font-black text-white text-center flex-1 pr-10 tracking-tight">
            Account Profile
          </h1>
        </div>

        <div className="p-5 space-y-6">
          {/* 1. Simless Sparks Card - Vibrant Colored Crystal Glass */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group border border-white/20"
          >
            {/* Crystal Glass Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/60 via-indigo-600/40 to-cyan-500/60 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-white/5" />
            
            {/* Glossy Reflection */}
            <div className="absolute -top-full -left-full w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-12 pointer-events-none" />

            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:scale-110 transition-transform duration-700">
                <Zap className="w-28 h-24 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
                  <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <span className="font-black tracking-[0.2em] text-[10px] text-white/80 uppercase">SIMLESS SPARKS</span>
              </div>
              <h3 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{displayData.sparks}</h3>
              <p className="text-cyan-100 font-bold text-sm">
                Equivalent to <span className="text-yellow-300 drop-shadow-sm">{((displayData.sparks / 100) * 3500).toLocaleString()} MMK</span> Discount
              </p>
              
              <div className="mt-6 py-2.5 px-5 bg-white/10 backdrop-blur-md rounded-2xl inline-block border border-white/20 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                100 Sparks = 3,500 MMK
              </div>
            </div>
          </motion.div>

          {/* 2. User Info Card - Euro Gray Frosted Glass with Texture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[40px] border border-white/10 shadow-2xl p-8"
          >
            {/* Euro Gray Base */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            
            {/* Raindrop & Wipe Texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 10% 20%, rgba(255,255,255,0.8) 0.5px, transparent 2px), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.8) 1px, transparent 3px)`,
                backgroundSize: '120px 120px',
                maskImage: 'radial-gradient(circle at center, transparent 30%, black 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, transparent 30%, black 80%)',
              }}
            />

            <div className="relative z-10 flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-300 border border-white/20 shadow-xl overflow-hidden relative group/avatar">
                    <User className="w-10 h-10 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{displayData.name}</h2>
                    <div className="mt-1 px-3 py-1 bg-cyan-500/20 rounded-full inline-block border border-cyan-400/30">
                      <p className="text-cyan-300 font-black text-[10px] uppercase tracking-widest">Premium Traveler</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 group/item hover:bg-white/10 transition-all">
                    <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-400/30">
                      <Mail className="w-5 h-5 text-cyan-300" />
                    </div>
                    <span className="text-white/80 font-bold text-sm tracking-tight">{displayData.email}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 group/item hover:bg-white/10 transition-all">
                    <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-400/30">
                      <Phone className="w-5 h-5 text-teal-300" />
                    </div>
                    <span className="text-white/80 font-bold text-sm tracking-tight">{displayData.phone}</span>
                </div>
            </div>
          </motion.div>

          {/* 3. Ways to Earn Section */}
          <div className="space-y-5">
            <h4 className="px-4 text-white font-black text-lg flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full" />
                Ways to Earn More
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden p-6 rounded-[32px] border border-white/10 shadow-xl group hover:scale-[1.02] transition-all">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 border border-cyan-400/30">
                        <Share2 className="w-6 h-6 text-cyan-300" />
                      </div>
                      <p className="text-[9px] font-black text-cyan-400/60 uppercase tracking-widest mb-1">Refer Friend</p>
                      <p className="text-white font-black text-sm tracking-tight">+500 Sparks</p>
                    </div>
                </div>
                <div className="relative overflow-hidden p-6 rounded-[32px] border border-white/10 shadow-xl group hover:scale-[1.02] transition-all">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4 border border-teal-400/30">
                        <Download className="w-6 h-6 text-teal-300" />
                      </div>
                      <p className="text-[9px] font-black text-teal-400/60 uppercase tracking-widest mb-1">App Download</p>
                      <p className="text-white font-black text-sm tracking-tight">+100 Sparks</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Logout Button - Frosted Crimson Glass */}
          <button
            onClick={onLogout}
            className="w-full relative overflow-hidden py-5 rounded-[30px] group active:scale-95 transition-all shadow-2xl mt-4 border border-rose-500/30"
          >
            <div className="absolute inset-0 bg-rose-500/5 backdrop-blur-xl group-hover:bg-rose-500/10 transition-all" />
            <div className="relative z-10 flex items-center justify-center gap-3 text-rose-500 font-black text-sm uppercase tracking-[0.3em]">
              <LogOut className="w-5 h-5" /> LOGOUT
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
