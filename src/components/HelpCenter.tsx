import { useState } from 'react';
import { ChevronLeft, HelpCircle, Settings, MessageCircle, Wifi, Cpu } from 'lucide-react';
import Chatbot from './Chatbot';

interface HelpCenterProps {
  onBack: () => void;
  onTravelEsim: () => void;
  onEsimCheck: () => void;
  onEsimStatus: () => void;
  onApnSettings: () => void;
  onFaq: () => void;
}

const helpItems = [
  {
    title: 'Travel eSIM User Guide',
    description: 'Installation, activation and troubleshooting',
    icon: Cpu,
    cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
    action: 'travelEsim'
  },
  {
    title: 'Travel eSIM Card Status',
    description: 'Check status and service availability',
    icon: Wifi,
    cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
    action: 'esimStatus'
  },
  {
    title: 'APN Settings',
    description: 'Configure network settings for data',
    icon: Settings,
    cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
    action: 'apnSettings'
  },
  {
    title: 'FAQ',
    description: 'Answers to common questions',
    icon: HelpCircle,
    cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
    action: 'faq'
  },
];

export default function HelpCenter({ onBack, onTravelEsim, onEsimCheck, onEsimStatus, onApnSettings, onFaq }: HelpCenterProps) {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] overflow-hidden">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] -right-[15%] w-[50%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative max-w-md mx-auto h-full flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 pt-10 pb-6 flex items-center bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl z-20">
          <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group shadow-lg">
            <ChevronLeft className="w-7 h-7 text-cyan-300 group-hover:text-white transition-colors" />
          </button>
          <h1 className="text-2xl font-black text-white flex-1 text-center pr-10 tracking-tight">🆘 Help Center</h1>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto pb-40 px-6 pt-8 scrollbar-none">
          {/* Chatbot Action - Premium Glass */}
          <button
            onClick={() => setShowChatbot(true)}
            className="w-full relative overflow-hidden rounded-[32px] mb-10 shadow-2xl group active:scale-[0.98] transition-all border border-white/20"
          >
            {/* Glass Backdrop */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl group-hover:bg-white/15 transition-all" />
            
            <div className="relative p-7 flex items-center gap-5">
              <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform duration-500">
                <MessageCircle className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white tracking-tight">How can we help?</div>
                <div className="text-cyan-100/60 font-bold text-xs uppercase tracking-widest mt-1">Browse topics or chat now</div>
              </div>
            </div>
          </button>

          {/* Help Menu Grid */}
          <div className="grid grid-cols-2 gap-5">
            {helpItems.map((item, index) => {
              const Icon = item.icon;
              const handleClick = item.action === 'travelEsim'
                ? onTravelEsim
                : item.action === 'esimCheck'
                ? onEsimCheck
                : item.action === 'esimStatus'
                ? onEsimStatus
                : item.action === 'apnSettings'
                ? onApnSettings
                : item.action === 'faq'
                ? onFaq
                : undefined;
              return (
                <button
                  key={item.title}
                  onClick={handleClick}
                  className="relative overflow-hidden rounded-[32px] shadow-2xl group active:scale-[0.96] transition-all text-left border border-white/10 h-[190px]"
                >
                  {/* Wet Glass Base */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-md group-hover:bg-white/10 transition-all" />
                  
                  {/* Raindrop & Wipe Texture Overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 15% 25%, rgba(255,255,255,0.8) 0.5px, transparent 2px), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.8) 1px, transparent 3px)`,
                      backgroundSize: '100px 100px',
                      maskImage: 'radial-gradient(circle at center, transparent 35%, black 85%)',
                      WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 85%)',
                    }}
                  />

                  <div className="relative h-full p-6 flex flex-col">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                      index === 0 ? 'from-teal-500 to-emerald-600' :
                      index === 1 ? 'from-cyan-500 to-blue-600' :
                      index === 2 ? 'from-sky-500 to-indigo-600' :
                      'from-indigo-500 to-violet-600'
                    } flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-black text-white tracking-tight leading-snug">{item.title}</div>
                    <div className="text-[10px] text-cyan-100/40 mt-3 font-bold uppercase tracking-wider line-clamp-2">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Business Cooperation & Support Footprint Info - Fixed Accessibility */}
          <div className="mt-12 mb-8 px-4 text-center">
            <div className="inline-block py-2 px-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-4">
              <p className="text-[10px] font-black text-cyan-300 uppercase tracking-[0.2em]">Support Line</p>
            </div>
            <p className="text-[11px] font-bold text-cyan-100/50 tracking-wide leading-relaxed">
              Business Cooperation: <span className="text-white">+959943229667</span>, <span className="text-white">+959251167248</span>,
            </p>
            <p className="text-[10px] text-cyan-300/40 mt-2 font-black uppercase tracking-widest">(Mon.-Fri. 9:00 - 5:00)</p>
          </div>
        </div>
      </div>

      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
