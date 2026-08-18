import { HelpCircle, Settings, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 

interface HelpCenterProps {
  onBack: () => void;
  onTravelEsim: () => void;
  onEsimCheck: () => void;
  onApnSettings: () => void;
  onFaq: () => void;
}

export default function HelpCenter({ onBack, onTravelEsim, onEsimCheck, onApnSettings, onFaq }: HelpCenterProps) {
  
  const { t } = useTranslation();

  const helpItems = [
    {
      title: t('hcUserGuide'),
      mobileTitle: t('hcUserGuide'),
      icon: Cpu,
      cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
      action: 'travelEsim'
    },
    {
      title: t('hcApnSettings'),
      mobileTitle: t('hcApnSettings'),
      icon: Settings,
      cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
      action: 'apnSettings'
    },
    {
      title: t('hcFaq'),
      mobileTitle: t('hcFaq'),
      icon: HelpCircle,
      cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
      action: 'faq'
    },
    {
      title: t('hcEsimCheck'),
      mobileTitle: t('hcEsimCheckMobile'),
      icon: Cpu,
      cardClass: 'bg-[#fffbeb] border-[#fffbeb]',
      action: 'esimCheck'
    },
  ];

  return (
    <section className="relative w-full bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfb_100%)] overflow-hidden font-['Poppins']">
      
      {/* Background Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[12%] -left-[6%] w-[44%] h-[44%] bg-cyan-400/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-[8%] -right-[10%] w-[40%] h-[40%] bg-emerald-400/12 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-16">
        
        {/* Header Section */}
        <div className="mb-6 md:mb-10 text-left">
          {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
          <h1 className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tight font-['Poppins']">
            {t('helpCenterTitle')}
          </h1>
          {/* 🌟 Subtitle ကိုလည်း font-semibold ပြောင်းလဲထားပါသည် */}
          <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1 font-['Poppins']">
            {t('helpCenterDesc')}
          </p>
        </div>

        {/* Grid Items Content */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 font-['Poppins']">
          {helpItems.map((item, index) => {
            const Icon = item.icon;
            const handleClick = item.action === 'travelEsim'
              ? onTravelEsim
              : item.action === 'esimCheck'
              ? onEsimCheck
              : item.action === 'apnSettings'
              ? onApnSettings
              : item.action === 'faq'
              ? onFaq
              : undefined;
            
            const isFaq = item.action === 'faq';

            return (
              <button
                key={item.title}
                onClick={handleClick}
                className={`relative overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-[0_18px_50px_rgba(15,23,42,0.08)] group active:scale-[0.98] transition-all text-left border border-white/80 cursor-pointer font-['Poppins'] ${
                  isFaq ? 'min-h-[130px] sm:min-h-[170px]' : 'min-h-[150px] sm:min-h-[170px]'
                }`}
              >
                {/* Frosted Glass Background for Cards */}
                <div className="absolute inset-0 bg-white/65 backdrop-blur-xl group-hover:bg-white/80 transition-all" />
                
                {/* Decorative Background Pattern */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 15% 25%, rgba(255,255,255,0.8) 0.5px, transparent 2px), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.8) 1px, transparent 3px)`,
                    backgroundSize: '100px 100px',
                    maskImage: 'radial-gradient(circle at center, transparent 35%, black 85%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 85%)',
                  }}
                />

                <div className={`relative h-full p-4 sm:p-6 flex flex-col justify-between ${isFaq ? 'gap-2' : ''}`}>
                  {/* Icon Wrapper */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${
                    index === 0 ? 'from-teal-500 to-emerald-600' :
                    index === 1 ? 'from-cyan-500 to-blue-600' :
                    index === 2 ? 'from-sky-500 to-indigo-600' :
                    'from-indigo-500 to-violet-600'
                  } flex items-center justify-center ${isFaq ? 'mb-2 sm:mb-5' : 'mb-4 sm:mb-5'} shadow-lg group-hover:scale-110 transition-transform group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  {/* Title (Mobile & Desktop Dynamic Text) */}
                  <div>
                    {/* 🌟 Mobile View Title: font-semibold အဖြစ် ပြောင်းထားပါသည် */}
                    <div className="block sm:hidden text-xs sm:text-sm font-semibold text-slate-900 tracking-tight leading-snug whitespace-normal break-words font-['Poppins']">
                      {item.mobileTitle}
                    </div>

                    {/* 🌟 Desktop View Title: font-semibold အဖြစ် ပြောင်းထားပါသည် */}
                    <div className="hidden sm:block text-base font-semibold text-slate-900 tracking-tight leading-snug font-['Poppins']">
                      {item.title}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}