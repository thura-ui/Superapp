import { useState } from 'react';
import { Facebook, Send, PhoneCall, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  activeScreen?: string;
  onHomeClick?: () => void;
  onHelpCenterClick?: () => void;
  onFaqClick?: () => void;
  onTravelEsimClick?: () => void;
  onApnSettingsClick?: () => void;
  onEsimCheckClick?: () => void;
}

export default function Footer({ 
  activeScreen,
  onHomeClick,
  onHelpCenterClick, 
  onFaqClick, 
  onApnSettingsClick, 
  onEsimCheckClick 
}: FooterProps) {
  
  const { t } = useTranslation();

  const [showContact, setShowContact] = useState(false);

  const handleNav = (action?: () => void) => {
    setShowContact(false);
    if (action) action();
  };

  const handleOpenLink = (url: string) => {
    setShowContact(false);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const phone = '959943229667';

  // 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည်
  const getLinkClass = (screenName: string) => {
    const isActive = activeScreen === screenName;
    return `h-9 sm:h-10 px-3.5 sm:px-4 rounded-full font-semibold text-xs lg:text-[13px] tracking-wide flex items-center justify-center transition-all duration-300 border border-solid cursor-pointer whitespace-nowrap backdrop-blur-md active:scale-95 ${
      isActive
        ? "bg-blue-600/80 backdrop-blur-xl border-blue-400/60 text-white shadow-[0_8px_25px_rgba(37,99,235,0.35)] scale-[1.02]"
        : "bg-blue-500/10 backdrop-blur-md border-blue-400/20 text-slate-900 hover:bg-blue-600/20 hover:border-blue-400/40 hover:text-blue-700 shadow-[0_4px_15px_rgba(37,99,235,0.08)]"
    }`;
  };

  return (
    <footer className="w-full bg-transparent py-8 block relative z-40 m-0 select-none font-['Poppins']">
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center justify-center shrink-0">
            <img
              src="/top_navber_and_Footer_Navbar_logo.png"
              alt="SIMLESS Logo"
              className="nav-logo !h-[80px] sm:!h-[90px] w-auto object-contain ml-3 md:ml-5"
            />
          </div>

          {/* Links Section */}
          <nav className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-2.5 max-w-full">
            
            <button 
              onClick={() => handleNav(onHomeClick)}
              className={getLinkClass('home')}
            >
              {t('navHome', 'Home')}
            </button>
            
            <button 
              onClick={() => handleNav(onHelpCenterClick)}
              className={getLinkClass('help-center')}
            >
              {t('footerHelpCenter', 'Help Center')}
            </button>
            
            <button 
              onClick={() => handleNav(onApnSettingsClick)}
              className={getLinkClass('apn-settings')}
            >
              {t('footerApnSettings', 'APN Settings')}
            </button>
            
            <button 
              onClick={() => handleNav(onFaqClick)}
              className={getLinkClass('faq')}
            >
              {t('footerFaq', 'FAQ')}
            </button>

            <button 
              onClick={() => handleNav(onEsimCheckClick)}
              className={getLinkClass('esim-check')}
            >
              {t('footerEsimCheck', 'eSIM Check')}
            </button>

            {/* Contact Us Section */}
            <div className="relative flex items-center">
              <button 
                onClick={() => setShowContact(!showContact)}
                className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-full font-semibold text-xs lg:text-[13px] tracking-wide flex items-center justify-center transition-all duration-300 border border-solid cursor-pointer whitespace-nowrap backdrop-blur-md active:scale-95 ${
                  showContact 
                    ? "bg-blue-600/80 backdrop-blur-xl border-blue-400/60 text-white shadow-[0_8px_25px_rgba(37,99,235,0.35)] scale-[1.02]" 
                    : "bg-blue-500/10 backdrop-blur-md border-blue-400/20 text-slate-900 hover:bg-blue-600/20 hover:border-blue-400/40 hover:text-blue-700 shadow-[0_4px_15px_rgba(37,99,235,0.08)]"
                }`}
              >
                {t('footerContact', 'Contact')}
              </button>

              {/* Contact Popup Dropdown */}
              {showContact && (
                <div className="absolute bottom-[calc(100%+16px)] right-0 sm:right-1/2 sm:translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className="absolute -bottom-2 right-6 sm:right-1/2 sm:translate-x-1/2 w-4 h-4 bg-white/70 border-b border-r border-blue-200/50 rotate-45 backdrop-blur-xl shadow-[4px_4px_10px_rgba(0,0,0,0.05)]" />
                  
                  <div className="relative flex items-center gap-3 sm:gap-4 bg-white/70 backdrop-blur-xl border border-blue-200/50 shadow-[0_12px_40px_rgba(37,99,235,0.15)] px-4 py-3 rounded-full">
                    
                    <button 
                      type="button"
                      onClick={() => handleOpenLink(`https://viber.click/${phone}`)}
                      title="Viber" 
                      className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-[0_4px_15px_rgba(168,85,247,0.15)] hover:shadow-[0_8px_20px_rgba(168,85,247,0.3)] text-purple-500 cursor-pointer p-0"
                    >
                      <PhoneCall className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                    </button>

                    {/* 🌟 Facebook Icon ခလုတ်တွင် သက်ဆိုင်ရာ Link အသစ်အား ချိတ်ဆက်ပေးထားပါသည် */}
                    <button 
                      type="button"
                      onClick={() => handleOpenLink('https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr')}
                      title="Facebook" 
                      className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-[0_4px_15px_rgba(59,130,246,0.15)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] text-blue-500 cursor-pointer p-0"
                    >
                      <Facebook className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleOpenLink('https://t.me/mattsbie')}
                      title="Telegram" 
                      className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-[0_4px_15px_rgba(14,165,233,0.15)] hover:shadow-[0_8px_20px_rgba(14,165,233,0.3)] text-sky-500 cursor-pointer p-0"
                    >
                      <Send className="w-5 h-5 sm:w-[22px] sm:h-[22px] -ml-0.5 mt-0.5" />
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleOpenLink(`https://wa.me/${phone}`)}
                      title="WhatsApp" 
                      className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-[0_4px_15px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)] text-emerald-500 cursor-pointer p-0"
                    >
                      <MessageCircle className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                    </button>

                  </div>
                </div>
              )}
            </div>

          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-blue-200/20 text-center">
          <p className="text-slate-400 text-xs font-semibold">
            &copy; {new Date().getFullYear()} {t('footerCopyright', 'by SIMLESS Development')}, simless-mm.com
          </p>
        </div>

      </div>
    </footer>
  );
}