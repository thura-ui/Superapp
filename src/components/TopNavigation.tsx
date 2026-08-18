import { useState } from 'react';
import { User, Home, Map, Database, Handshake, BookOpen, Phone, Facebook, Send, PhoneCall, MessageCircle, Globe, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TopNavigationProps {
  activeTab: string;
  isLoggedIn: boolean;
  onHomeClick: () => void;
  onProductClick: () => void;
  onInstallClick: () => void;
  onDataClick: () => void;
  onPartnerClick: () => void;
  onHelpClick?: () => void;
  onAccountClick: () => void;
  onHistoryClick: () => void;
  onChatClick?: () => void;
}

export default function TopNavigation({
  activeTab,
  isLoggedIn,
  onHomeClick,
  onProductClick,
  onInstallClick,
  onDataClick,
  onPartnerClick,
  onAccountClick,
  onHistoryClick,
  onChatClick,
}: TopNavigationProps) {
  
  const { t, i18n } = useTranslation();
  const [showContact, setShowContact] = useState(false);

  const linkClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `relative py-2 sm:py-3 px-1.5 sm:px-2 font-semibold text-xs lg:text-[13px] tracking-wide transition-all duration-300 flex items-center gap-1 lg:gap-1.5 bg-transparent border-none outline-none select-none group cursor-pointer ${
      isActive ? 'text-blue-600' : 'text-slate-900'
    }`;
  };

  const gradientTextClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `transition-all duration-300 font-semibold text-xs lg:text-[13px] tracking-tight sm:tracking-wide whitespace-nowrap ${
      isActive 
        ? 'text-blue-600 drop-shadow-[0_0.5px_0.5px_rgba(37,99,235,0.2)]' 
        : 'text-slate-900 group-hover:bg-gradient-to-b group-hover:from-[#1d4ed8] group-hover:via-[#2563eb] group-hover:to-[#e0f2fe] group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-[0_1px_1px_rgba(15,23,42,0.15)]'
    }`;
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="sticky top-0 sm:top-4 z-50 w-full pointer-events-none transition-all duration-300">
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-[75px] sm:h-[85px]">
        
        {/* LOGO */}
        <button 
          onClick={onHomeClick} 
          className="pointer-events-auto flex items-center shrink-0 p-0 m-0 border-none bg-transparent cursor-pointer h-[80px] sm:h-[100px] lg:h-[100px] transition-transform hover:scale-105"
        >
          <img
            src="/top_navber_and_Footer_Navbar_logo.png"
            alt="SIMLESS Logo"
            className="h-full w-auto object-contain" 
          />
        </button>

        {/* RIGHT SIDE WRAPPER */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-0">

          {/* Desktop Nav Card */}
          <nav 
            className="hidden sm:flex items-center bg-white/85 backdrop-blur-xl border border-solid border-slate-200/50 shadow-[0_20px_50px_rgba(15,23,42,0.08)] rounded-[2rem] px-3 lg:px-4 h-[60px] transition-all duration-300"
          >
            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-1 lg:gap-3 mr-2 lg:mr-3 border-r border-slate-200/60 pr-2 lg:pr-3">
              
              <button onClick={onHomeClick} className={linkClass('home')}>
                <Home className={`w-3.5 h-3.5 transition-colors duration-300 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('home')}>{t('home', 'Home')}</span>
                {activeTab === 'home' && <span className="absolute bottom-1 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />}
              </button>

              <button onClick={onProductClick} className={linkClass('plan')}>
                <Map className={`w-3.5 h-3.5 transition-colors duration-300 ${activeTab === 'plan' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('plan')}>{t('planAndPrice', 'Plan & Price')}</span>
                {activeTab === 'plan' && <span className="absolute bottom-1 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />}
              </button>

              <button onClick={onInstallClick} className={linkClass('install')}>
                <BookOpen className={`w-3.5 h-3.5 transition-colors duration-300 ${activeTab === 'install' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('install')}>{t('userGuide', 'User Guide')}</span>
                {activeTab === 'install' && <span className="absolute bottom-1 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />}
              </button>

              <button onClick={onDataClick} className={linkClass('data')}>
                <Database className={`w-3.5 h-3.5 transition-colors duration-300 ${activeTab === 'data' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('data')}>{t('myData', 'My Data')}</span>
                {activeTab === 'data' && <span className="absolute bottom-1 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />}
              </button>

              <button onClick={onPartnerClick} className={linkClass('partner')}>
                <Handshake className={`w-3.5 h-3.5 transition-colors duration-300 ${activeTab === 'partner' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('partner')}>{t('partner', 'Partner')}</span>
                {activeTab === 'partner' && <span className="absolute bottom-1 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />}
              </button>
            </div>

            {/* Right side Actions - Desktop (inside nav card) */}
            <div className="flex items-center gap-2.5 lg:gap-3">
              
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <select 
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  className="bg-blue-50/80 border border-blue-200/60 text-blue-700 rounded-full px-2 sm:px-2.5 h-8 sm:h-[34px] font-semibold text-[11px] sm:text-xs tracking-wide outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/30 hover:bg-blue-100/80 transition-colors appearance-none text-center whitespace-nowrap"
                  style={{ textAlignLast: 'center' }}
                >
                  <option value="en">English (US)</option>
                  <option value="my">မြန်မာ</option>
                </select>
              </div>

              <div className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => setShowContact(!showContact)}
                  className={`flex items-center gap-1 px-2 h-[34px] rounded-full font-semibold text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap border ${
                    showContact
                      ? 'bg-blue-50/80 border-blue-500 text-blue-700'
                      : 'bg-blue-50/80 border-blue-200/60 text-blue-700 hover:bg-blue-100/80'
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  <span>{t('contact', 'Contact')}</span>
                </button>

                {showContact && (
                  <div className="absolute top-[calc(100%+12px)] right-0 z-50">
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white/70 border-t border-l border-blue-200/50 rotate-45 backdrop-blur-xl" />
                    <div className="relative flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-blue-200/50 shadow-[0_12px_40px_rgba(37,99,235,0.15)] px-4 py-3 rounded-full">
                      <button type="button" onClick={() => { setShowContact(false); window.open('https://viber.click/959943229667', '_blank', 'noopener,noreferrer'); }} title="Viber" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(168,85,247,0.15)] text-purple-500 cursor-pointer p-0">
                        <PhoneCall className="w-5 h-5" />
                      </button>
                      <button type="button" onClick={() => { setShowContact(false); window.open('https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr', '_blank', 'noopener,noreferrer'); }} title="Facebook" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(59,130,246,0.15)] text-blue-500 cursor-pointer p-0">
                        <Facebook className="w-5 h-5" />
                      </button>
                      <button type="button" onClick={() => { setShowContact(false); window.open('https://t.me/mattsbie', '_blank', 'noopener,noreferrer'); }} title="Telegram" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(14,165,233,0.15)] text-sky-500 cursor-pointer p-0">
                        <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
                      </button>
                      <button type="button" onClick={() => { setShowContact(false); window.open('https://wa.me/959943229667', '_blank', 'noopener,noreferrer'); }} title="WhatsApp" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(16,185,129,0.15)] text-emerald-500 cursor-pointer p-0">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Button */}
              {onChatClick && (
                <button
                  type="button"
                  onClick={onChatClick}
                  className="flex items-center justify-center w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-600 hover:bg-blue-100/80 transition-colors cursor-pointer p-0"
                  title="Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}

              {/* My Account Button */}
              <button
                onClick={onAccountClick}
                className="group hidden sm:flex items-center gap-1.5 lg:gap-2 px-2.5 sm:px-3 py-1.5 h-[34px] sm:h-[36px] bg-blue-500/10 backdrop-blur-md border border-solid border-blue-400/20 hover:bg-blue-500/20 hover:border-blue-400/40 text-blue-700 rounded-full transition-all shadow-[0_8px_20px_rgba(59,130,246,0.06)] font-semibold cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/50 group-hover:scale-105 transition-transform">
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 text-white" />
                </div>
                <span className="text-[11px] lg:text-xs tracking-wide whitespace-nowrap">
                  {isLoggedIn ? t('myAccount', 'My Account') : t('signIn', 'Sign In')}
                </span>
              </button>
            </div>

          </nav>

          {/* Mobile only: Language + Contact stacked vertically */}
          <div className="flex sm:hidden flex-col items-end gap-1.5 mt-2">
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select 
                value={i18n.language}
                onChange={handleLanguageChange}
                className="bg-transparent border border-blue-200/60 text-blue-700 rounded-full px-2 h-8 font-semibold text-xs tracking-wide outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/30 hover:bg-blue-50/50 transition-colors appearance-none text-center whitespace-nowrap"
                style={{ textAlignLast: 'center' }}
              >
                <option value="en">English (US)</option>
                <option value="my">မြန်မာ</option>
              </select>
            </div>

            <div className="relative">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setShowContact(!showContact)}
                  className={`flex items-center px-2.5 h-8 rounded-full font-semibold text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap border ${
                    showContact
                      ? 'bg-blue-50/80 border-blue-500 text-blue-700'
                      : 'bg-transparent border-blue-200/60 text-blue-700 hover:bg-blue-50/50'
                  }`}
                >
                  <span>{t('contact', 'Contact')}</span>
                </button>
              </div>

              {showContact && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-50">
                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => { setShowContact(false); window.open('https://viber.click/959943229667', '_blank', 'noopener,noreferrer'); }} title="Viber" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(168,85,247,0.15)] text-purple-500 cursor-pointer p-0">
                      <PhoneCall className="w-4.5 h-4.5" />
                    </button>
                    <button type="button" onClick={() => { setShowContact(false); window.open('https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr', '_blank', 'noopener,noreferrer'); }} title="Facebook" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(59,130,246,0.15)] text-blue-500 cursor-pointer p-0">
                      <Facebook className="w-4.5 h-4.5" />
                    </button>
                    <button type="button" onClick={() => { setShowContact(false); window.open('https://t.me/mattsbie', '_blank', 'noopener,noreferrer'); }} title="Telegram" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(14,165,233,0.15)] text-sky-500 cursor-pointer p-0">
                      <Send className="w-4.5 h-4.5 -ml-0.5 mt-0.5" />
                    </button>
                    <button type="button" onClick={() => { setShowContact(false); window.open('https://wa.me/959943229667', '_blank', 'noopener,noreferrer'); }} title="WhatsApp" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-blue-100 transition-all duration-300 hover:scale-110 shadow-[0_4px_15px_rgba(16,185,129,0.15)] text-emerald-500 cursor-pointer p-0">
                      <MessageCircle className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
