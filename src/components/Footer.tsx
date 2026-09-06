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
  onWhatIsEsimClick?: () => void;
  onHowItWorksClick?: () => void;
  onPrivacyPolicyClick?: () => void;
  onTermsClick?: () => void;
  // 🌟 CountrySelection Tabs သို့ သွားမည့် Handlers များ
  onCountryEsimsClick?: () => void;
  onRegionalEsimsClick?: () => void;
  onGlobalEsimsClick?: () => void;
}

export default function Footer({ 
  onHomeClick,
  onHelpCenterClick,
  onFaqClick,
  onTravelEsimClick,
  onApnSettingsClick,
  onEsimCheckClick,
  onWhatIsEsimClick,
  onHowItWorksClick,
  onPrivacyPolicyClick,
  onTermsClick,
  onCountryEsimsClick,
  onRegionalEsimsClick,
  onGlobalEsimsClick,
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

  return (
    <footer className="w-full bg-white/60 backdrop-blur-lg border-t border-slate-200/60 pt-12 pb-8 relative z-40 select-none font-['Poppins'] text-slate-900">
      
      <div className="w-full max-w-full px-3 sm:px-6 lg:px-8 mx-auto">
        
        {/* Main Columns Flex Layout */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 pb-10">
          
          {/* Column 1: Logo Section */}
          <div className="flex flex-col items-start justify-start shrink-0 max-w-xs">
            <button 
              type="button"
              onClick={() => handleNav(onHomeClick)}
              className="p-0 m-0 border-none bg-transparent cursor-pointer flex items-center h-[55px] sm:h-[80px] lg:h-[85px] transition-transform hover:scale-105"
            >
              <img
                src="/Simless-logo03.png"
                alt="SIMLESS Logo"
                className="h-full w-auto object-contain scale-100 sm:scale-110 origin-left"
              />
            </button>
            <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed text-left">
              Stay connected anywhere, anytime with SIMLESS Travel eSIM.
            </p>
          </div>

          {/* Right Columns Wrapper */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 lg:gap-10 w-full lg:max-w-4xl lg:ml-auto">
            
            {/* 🌟 Column 2: Our eSIMs */}
            <div className="flex flex-col text-left space-y-3 w-full">
              <h4 className="text-sm font-bold text-slate-900 tracking-wider whitespace-nowrap">
                Our eSIMs
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button 
                    type="button" 
                    onClick={() => handleNav(onCountryEsimsClick || onHomeClick)} 
                    className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
                  >
                    Country eSIMs
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => handleNav(onRegionalEsimsClick || onHomeClick)} 
                    className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
                  >
                    Regional eSIMs
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => handleNav(onGlobalEsimsClick || onHomeClick)} 
                    className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
                  >
                    Globals
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: About eSIMs */}
            <div className="flex flex-col text-left space-y-3 w-full">
              <h4 className="text-sm font-bold text-slate-900 tracking-wider whitespace-nowrap">
                About eSIMs
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button type="button" onClick={() => handleNav(onWhatIsEsimClick || onFaqClick)} className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap">
                    What is an eSIM?
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav(onHowItWorksClick || onTravelEsimClick)} className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap">
                    How does Simless eSIM work?
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav(onEsimCheckClick)} className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap">
                    eSIM Compatibility
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav(onApnSettingsClick)} className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap">
                    APN Settings
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Company (မူလအတိုင်း Get Help ထက် အရင် ထားရှိပေးထားပါသည်) */}
            <div className="flex flex-col text-left space-y-3 w-full pl-10 sm:pl-12 relative">
              <h4 className="text-sm font-bold text-slate-900 tracking-wider whitespace-nowrap">
                Company
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button 
                    type="button" 
                    onClick={() => handleNav(onTermsClick)} 
                    className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => handleNav(onPrivacyPolicyClick)} 
                    className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Get Help */}
            <div className="flex flex-col text-left space-y-3 w-full pl-15 sm:pl-10 relative">
              <h4 className="text-sm font-bold text-slate-900 tracking-wider whitespace-nowrap">
                Get Help
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button type="button" onClick={() => handleNav(onHelpCenterClick)} className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap">
                    Help Center
                  </button>
                </li>
                <li className="relative">
                  <button 
                    type="button" 
                    onClick={() => setShowContact(!showContact)} 
                    className="text-slate-600 hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
                  >
                    Contact Us
                  </button>

                  {/* 🔴 Absolute Popover (Contact Us ခလုတ်အောက် တည်တည့်တွင် Floating ပုံစံဖြင့် ပေါ်လာပါမည်) 🔴 */}
                  {showContact && (
                    <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-blue-100 shadow-xl whitespace-nowrap">
                        <button 
                          type="button"
                          onClick={() => handleOpenLink(`https://viber.click/${phone}`)}
                          title="Viber" 
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-purple-50 border border-slate-100 transition-transform hover:scale-110 shadow-xs text-purple-600 cursor-pointer p-0 shrink-0"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleOpenLink('https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr')}
                          title="Facebook" 
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-blue-50 border border-slate-100 transition-transform hover:scale-110 shadow-xs text-blue-600 cursor-pointer p-0 shrink-0"
                        >
                          <Facebook className="w-4 h-4" />
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleOpenLink('https://t.me/mattsbie')}
                          title="Telegram" 
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-sky-50 border border-slate-100 transition-transform hover:scale-110 shadow-xs text-sky-500 cursor-pointer p-0 shrink-0"
                        >
                          <Send className="w-4 h-4 -ml-0.5 mt-0.5" />
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleOpenLink(`https://wa.me/${phone}`)}
                          title="WhatsApp" 
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-emerald-50 border border-slate-100 transition-transform hover:scale-110 shadow-xs text-emerald-500 cursor-pointer p-0 shrink-0"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              </ul>
            </div>

            {/* Column 6: Follow Us */}
            <div className="flex flex-col text-left space-y-3 w-full pl-8 sm:pl-7">
              <h4 className="text-sm font-bold text-slate-900 tracking-wider whitespace-nowrap">
                Follow Us
              </h4>
              <div className="flex items-center gap-3 pt-1">
                <button 
                  type="button"
                  onClick={() => handleOpenLink('https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 font-semibold text-xs transition-all duration-300 hover:scale-105 cursor-pointer whitespace-nowrap"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Copyright Section */}
        <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-semibold">
            &copy; {new Date().getFullYear()} {t('footerCopyright', 'Created by SIMLESS Development')}
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span>All rights reserved.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}