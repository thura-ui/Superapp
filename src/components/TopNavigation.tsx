import { useState, useEffect, useRef } from 'react';
import { User, Home, Map, Database, Handshake, BookOpen, Phone, Facebook, Send, PhoneCall, MessageCircle, Globe, ChevronDown, Check } from 'lucide-react';
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
}: TopNavigationProps) {
  
  const { t, i18n } = useTranslation();
  const [showContact, setShowContact] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 🌟 Current Language State
  const [activeLang, setActiveLang] = useState<string>(i18n.language || 'en');
  
  // 🌟 Desktop & Mobile Dropdown များအတွက် Container Ref
  const navContainerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English (US)' },
    { code: 'my', label: 'မြန်မာ' }
  ];

  // 🌟 i18n Event မှတစ်ဆင့် Language ပြောင်းလဲမှုကို တိုက်ရိုက် စောင့်ကြည့်ခြင်း
  useEffect(() => {
    const onLangChanged = (lng: string) => {
      setActiveLang(lng);
    };

    i18n.on('languageChanged', onLangChanged);
    return () => {
      i18n.off('languageChanged', onLangChanged);
    };
  }, [i18n]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🌟 Dropdown ပြင်ပသို့ နှိပ်မိပါက ပိတ်သွားစေရန် ပြင်ပ Click Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
        setShowContact(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkClass = (tab: string) => {
    const isActive = activeTab === tab;

    return `relative py-2 sm:py-3 px-1.5 sm:px-2.5 text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1 lg:gap-1.5 bg-transparent border-none outline-none select-none group cursor-pointer ${
      isActive ? 'text-blue-600' : 'text-slate-900'
    }`;
  };

  const gradientTextClass = (tab: string) => {
    const isActive = activeTab === tab;

    return `transition-all duration-300 text-xs font-semibold tracking-tight sm:tracking-wide whitespace-nowrap ${
      isActive 
        ? 'text-blue-600 drop-shadow-[0_0.5px_0.5px_rgba(37,99,235,0.2)]' 
        : 'text-slate-900 group-hover:bg-gradient-to-b group-hover:from-[#1d4ed8] group-hover:via-[#2563eb] group-hover:to-[#e0f2fe] group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-[0_1px_1px_rgba(15,23,42,0.15)]'
    }`;
  };

  // 🌟 Language Control Handler (Desktop & Mobile နှစ်ခုလုံးအတွက်)
  const handleLanguageSelect = async (newLang: string) => {
    try {
      const targetLang = newLang.startsWith('my') ? 'my' : 'en';
      await i18n.changeLanguage(targetLang);
      
      document.documentElement.setAttribute('lang', targetLang);
      document.documentElement.lang = targetLang;
      localStorage.setItem('language', targetLang);
      localStorage.setItem('i18nextLng', targetLang);
      
      setActiveLang(targetLang);
      setShowLangDropdown(false);

      // App Level သို့ပါ Signal ပို့ခြင်း
      window.dispatchEvent(new Event('language-changed'));
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const isBurmese = activeLang.startsWith('my');
  const currentLangLabel = isBurmese ? 'မြန်မာ' : 'English (US)';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md bg-white/70 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)]' 
          : 'bg-transparent border-b border-transparent shadow-none'
      }`}
    >
      <div className="w-full max-w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3 h-[75px] sm:h-[85px]" ref={navContainerRef}>    
        
        {/* LOGO */}
        <button 
          id="nav_logo_btn"
          name="nav_logo_btn"
          onClick={onHomeClick} 
          className="flex items-center shrink-0 p-0 m-0 border-none bg-transparent cursor-pointer h-[55px] sm:h-[80px] lg:h-[85px] transition-transform hover:scale-105"
        >
          <img
            src="/Simless-logo03.png"
            alt="Simless-logo03"
            className="h-full w-auto object-contain scale-100 sm:scale-110 origin-left" 
          />
        </button>

        {/* RIGHT SIDE NAV LINKS & ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">

          {/* Desktop Nav Items */}
          <nav className="hidden sm:flex items-center gap-2 lg:gap-5">
            
            <div className="hidden md:flex items-center gap-1.5 lg:gap-4 border-r border-slate-200/50 pr-3 lg:pr-5">
              
              <button id="nav_home_btn" name="nav_home" onClick={onHomeClick} className={linkClass('home')}>
                <Home className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('home')}>
                  {t('home', 'Home')}
                </span>
                {activeTab === 'home' && (
                  <span className="absolute bottom-0 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>

              <button id="nav_plan_btn" name="nav_plan" onClick={onProductClick} className={linkClass('plan')}>
                <Map className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'plan' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('plan')}>
                  {t('planAndPrice', 'Plan & Price')}
                </span>
                {activeTab === 'plan' && (
                  <span className="absolute bottom-0 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>

              <button id="nav_install_btn" name="nav_install" onClick={onInstallClick} className={linkClass('install')}>
                <BookOpen className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'install' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('install')}>
                  {t('userGuide', 'User Guide')}
                </span>
                {activeTab === 'install' && (
                  <span className="absolute bottom-0 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>

              <button id="nav_data_btn" name="nav_data" onClick={onDataClick} className={linkClass('data')}>
                <Database className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'data' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('data')}>
                  {t('myData', 'My Data')}
                </span>
                {activeTab === 'data' && (
                  <span className="absolute bottom-0 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>

              <button id="nav_partner_btn" name="nav_partner" onClick={onPartnerClick} className={linkClass('partner')}>
                <Handshake className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'partner' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`} />
                <span className={gradientTextClass('partner')}>
                  {t('partner', 'Partner')}
                </span>
                {activeTab === 'partner' && (
                  <span className="absolute bottom-0 left-0 right-0 w-1/2 mx-auto h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>

            </div>

            {/* Desktop Language Button Control */}
            <div className="flex items-center gap-2.5 lg:gap-3">
              
              <div className="relative">
                <button
                  id="desktop_lang_toggle_btn"
                  name="desktop_lang_toggle"
                  type="button"
                  onClick={() => setShowLangDropdown((prev) => !prev)}
                  className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-800 rounded-full px-3 h-8 sm:h-[34px] font-semibold text-xs tracking-wide outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/30 hover:bg-white transition-all shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{currentLangLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLangDropdown && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-44 bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-slate-100/80 z-50 transition-all animate-in fade-in zoom-in-95 duration-150">
                    {languages.map((lang) => {
                      const isSelected = isBurmese ? lang.code === 'my' : lang.code === 'en';
                      return (
                        <button
                          key={lang.code}
                          id={`desktop_lang_opt_${lang.code}`}
                          name={`desktop_lang_opt_${lang.code}`}
                          type="button"
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer border-none outline-none transition-colors ${
                            isSelected
                              ? 'bg-slate-100/70 text-blue-600 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{lang.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Account Button */}
              <div className="hidden sm:flex items-center gap-1">
                <User className="w-4 h-4 text-blue-600 shrink-0" />

                <button
                  id="desktop_account_btn"
                  name="desktop_account"
                  type="button"
                  onClick={onAccountClick}
                  className="bg-white/60 backdrop-blur-sm border border-slate-200/80 text-slate-800 rounded-full px-3 h-8 sm:h-[34px] font-semibold text-xs tracking-wide outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/30 hover:bg-white transition-colors flex items-center justify-center whitespace-nowrap shadow-none"
                >
                  <span>
                    {isLoggedIn
                      ? t('myAccount', 'My Account')
                      : t('signIn', 'Sign In')}
                  </span>
                </button>
              </div>

            </div>

          </nav>

          {/* Mobile Nav Language Button Control */}
          <div className="flex sm:hidden items-center gap-1.5">
            <div className="relative">
              <button
                id="mobile_lang_toggle_btn"
                name="mobile_lang_toggle"
                type="button"
                onClick={() => setShowLangDropdown((prev) => !prev)}
                className="flex items-center gap-1 bg-white/70 border border-slate-200/80 text-slate-800 rounded-full px-2 py-1 h-7 text-[11px] font-semibold tracking-wide outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/30 transition-colors shadow-sm whitespace-nowrap"
              >
                <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                <span>{currentLangLabel}</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showLangDropdown && (
                <div className="absolute top-[calc(100%+6px)] right-0 w-36 bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-slate-100/80 z-50">
                  {languages.map((lang) => {
                    const isSelected = isBurmese ? lang.code === 'my' : lang.code === 'en';
                    return (
                      <button
                        key={lang.code}
                        id={`mobile_lang_opt_${lang.code}`}
                        name={`mobile_lang_opt_${lang.code}`}
                        type="button"
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold rounded-xl cursor-pointer border-none outline-none transition-colors ${
                          isSelected
                            ? 'bg-slate-100/70 text-blue-600 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                id="mobile_contact_btn"
                name="mobile_contact"
                type="button"
                onClick={() => setShowContact((prev) => !prev)}
                className={`flex items-center gap-1 px-2 py-1 h-7 rounded-full font-semibold text-[11px] tracking-wide transition-colors cursor-pointer whitespace-nowrap border ${
                  showContact
                    ? 'bg-blue-50/80 border-blue-500 text-blue-700'
                    : 'bg-white/60 border-slate-200/80 text-slate-800 hover:bg-white'
                }`}
              >
                <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                <span>{t('contact', 'Contact')}</span>
              </button>

              {showContact && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-50">
                  <div className="flex items-center gap-2 p-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-lg rounded-full">
                    <button
                      id="viber_btn"
                      name="viber"
                      type="button"
                      onClick={() => {
                        setShowContact(false);
                        window.open('https://viber.click/959943229667', '_blank', 'noopener,noreferrer');
                      }}
                      title="Viber"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-100 text-purple-500 shadow-sm cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </button>

                    <button
                      id="fb_btn"
                      name="fb"
                      type="button"
                      onClick={() => {
                        setShowContact(false);
                        window.open('https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr', '_blank', 'noopener,noreferrer');
                      }}
                      title="Facebook"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-100 text-blue-500 shadow-sm cursor-pointer"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>

                    <button
                      id="telegram_btn"
                      name="telegram"
                      type="button"
                      onClick={() => {
                        setShowContact(false);
                        window.open('https://t.me/mattsbie', '_blank', 'noopener,noreferrer');
                      }}
                      title="Telegram"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-100 text-sky-500 shadow-sm cursor-pointer"
                    >
                      <Send className="w-4 h-4 -ml-0.5" />
                    </button>

                    <button
                      id="whatsapp_btn"
                      name="whatsapp"
                      type="button"
                      onClick={() => {
                        setShowContact(false);
                        window.open('https://wa.me/959943229667', '_blank', 'noopener,noreferrer');
                      }}
                      title="WhatsApp"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-100 text-emerald-500 shadow-sm cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}