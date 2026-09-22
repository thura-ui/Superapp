import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreventDevTools } from './hooks/usePreventDevTools';
import LoadingPage from './components/LoadingPage';
import TopNavigation from './components/TopNavigation';
import BottomNavigation from './components/BottomNavigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import CountrySelection from './components/CountrySelection';
import PlanDetails from './components/PlanDetails';
import HelpCenter from './components/HelpCenter';
import EsimCheck from './components/EsimCheck';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import { logout } from './lib/authApi';
import { addToCart } from './lib/cartApi';
import { fetchPopularProducts } from './lib/productsApi';

import NoEsimSupport from './components/NoEsimSupport';
import EsimInstallationGuide from './components/EsimInstallationGuide';
import ApnSettings from './components/ApnSettings';
import FAQ from './components/FAQ';
import MyData from './components/MyData';
import PurchaseHistory from './components/PurchaseHistory';
import SparkHistory from './components/SparkHistory'; 
import CartPage from './components/Cart';
import AccountAuth from './components/AccountAuth';
import AccountDetails from './components/AccountDetails';
import RestartPassword from './components/RestartPassword';
import PartnerPage from './components/PartnerPage';
import CustomAlertHost from './components/CustomAlertHost';
import Chatbot from './components/Chatbot';
import type { Screen, Country } from './types';
import { showAlert } from './lib/customAlert';
import { MessageCircle } from 'lucide-react';

type LauncherPosition = { x: number; y: number };
const SUPPORT_CHAT_POSITION_KEY = 'simless-support-chat-position';
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function App() {
  usePreventDevTools();

  const { i18n } = useTranslation();
  const [langKey, setLangKey] = useState<string>(i18n.language || 'en');

  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen | 'restart-password' | 'spark-history' | 'privacy-policy' | 'terms-conditions'>('home');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [autoOpenCheckout, setAutoOpenCheckout] = useState(false);
  
  const [selectedPlanType, setSelectedPlanType] = useState<'fixed' | 'unlimited' | undefined>(undefined);
  const [activePlanTab, setActivePlanTab] = useState<'country' | 'regional' | 'global'>('country');

  const [faqInitialCategory, setFaqInitialCategory] = useState<string | undefined>(undefined);
  const [faqBackScreen, setFaqBackScreen] = useState<'help-center' | 'plan-details'>('help-center');
  const [returnToAllCountries, setReturnToAllCountries] = useState(false);
  const [openAllCountries, setOpenAllCountries] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [postAuthScreen, setPostAuthScreen] = useState<Screen | null>(null);
  const [pendingCheckoutVariationId, setPendingCheckoutVariationId] = useState<number | null>(null);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [supportPosition, setSupportPosition] = useState<LauncherPosition>({ x: 0, y: 0 });
  const [supportReady, setSupportReady] = useState(false);
  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  useEffect(() => {
    const handleLangSync = () => {
      const current = localStorage.getItem('language') || i18n.language || 'en';
      setLangKey(`${current}-${Date.now()}`);
    };

    i18n.on('languageChanged', handleLangSync);
    window.addEventListener('language-changed', handleLangSync);

    return () => {
      i18n.off('languageChanged', handleLangSync);
      window.removeEventListener('language-changed', handleLangSync);
    };
  }, [i18n]);

  useEffect(() => {
    let isMounted = true;

    const safetyTimer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 60000);

    fetchPopularProducts({ type: 'country', perPage: 12 })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(safetyTimer);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') && urlParams.has('email')) {
      setCurrentScreen('restart-password');
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(SUPPORT_CHAT_POSITION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LauncherPosition;
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setSupportPosition(parsed);
          setSupportReady(true);
          return;
        }
      } catch {
        // fall back to default position
      }
    }

    const defaultX = typeof window !== 'undefined' ? window.innerWidth - 84 : 24;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const defaultY = typeof window !== 'undefined' ? window.innerHeight - (isMobile ? 160 : 84) : 24;
    setSupportPosition({
      x: clamp(defaultX, 24, 9999),
      y: clamp(defaultY, 24, 9999),
    });
    setSupportReady(true);
  }, []);

  useEffect(() => {
    if (!supportReady) return;
    localStorage.setItem(SUPPORT_CHAT_POSITION_KEY, JSON.stringify(supportPosition));
  }, [supportPosition, supportReady]);

  const supportChatLauncher = (
    <>
      <button
        type="button"
        aria-label="Chat With Support"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragStateRef.current = {
            dragging: true,
            startX: event.clientX,
            startY: event.clientY,
            originX: supportPosition.x,
            originY: supportPosition.y,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          if (!dragStateRef.current.dragging) return;
          const deltaX = event.clientX - dragStateRef.current.startX;
          const deltaY = event.clientY - dragStateRef.current.startY;
          if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
            dragStateRef.current.moved = true;
          }
          const nextX = clamp(dragStateRef.current.originX + deltaX, 12, window.innerWidth - 72);
          const nextY = clamp(dragStateRef.current.originY + deltaY, 12, window.innerHeight - 72);
          setSupportPosition({ x: nextX, y: nextY });
        }}
        onPointerUp={(event) => {
          if (!dragStateRef.current.dragging) return;
          dragStateRef.current.dragging = false;
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            // ignore
          }
          if (!dragStateRef.current.moved) {
            setShowSupportChat(true);
          }
        }}
        onPointerCancel={(event) => {
          dragStateRef.current.dragging = false;
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            // ignore
          }
        }}
        className="fixed z-50 w-14 h-14 rounded-full bg-white border-2 border-emerald-500 shadow-[0_10px_26px_rgba(15,23,42,0.22)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform touch-none"
        style={{ left: `${supportPosition.x}px`, top: `${supportPosition.y}px`, opacity: supportReady ? 1 : 0 }}
      >
        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </button>
      {showSupportChat && <Chatbot onClose={() => setShowSupportChat(false)} />}
    </>
  );

  const goHome = () => setCurrentScreen('home');
  const goProduct = () => setCurrentScreen('country-selection');
  
  const goCountryEsims = () => {
    setActivePlanTab('country');
    setCurrentScreen('country-selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goRegionalEsims = () => {
    setActivePlanTab('regional');
    setCurrentScreen('country-selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goGlobalEsims = () => {
    setActivePlanTab('global');
    setCurrentScreen('country-selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goCart = () => {
    if (!isLoggedIn) {
      showAlert('signin-required', () => {
        setPostAuthScreen('cart');
        goAuth('sign-in');
      });
      return;
    }
    setCurrentScreen('cart');
  };
  const goEsimCheck = () => setCurrentScreen('esim-check');
  const goHelpCenter = () => setCurrentScreen('help-center');
  const goPartner = () => setCurrentScreen('partner');
  const goPrivacyPolicy = () => setCurrentScreen('privacy-policy');
  const goTerms = () => setCurrentScreen('terms-conditions');

  const goAuth = (mode: 'sign-in' | 'sign-up' = 'sign-in') => {
    setAuthMode(mode);
    setCurrentScreen('auth');
  };

  const goToAccountOrAuth = () => {
    setCurrentScreen(isLoggedIn ? 'account-details' : 'auth');
  };

  const goToMyData = () => setCurrentScreen('my-data');
  const goToMyOrders = () => setCurrentScreen('my-orders');
  const goToSparkHistory = () => setCurrentScreen('spark-history'); 

  const goHistory = () => {
    if (!isLoggedIn) {
      showAlert('signin-required', () => {
        setPostAuthScreen('my-orders');
        goAuth('sign-in');
      });
      return;
    }
    setCurrentScreen('my-orders');
  };

  const openFaq = (category?: string, backScreen: 'help-center' | 'plan-details' = 'help-center') => {
    setFaqInitialCategory(category);
    setFaqBackScreen(backScreen);
    setCurrentScreen('faq');
  };

  const handleBackFromFaq = () => {
    setFaqInitialCategory(undefined);
    setCurrentScreen(faqBackScreen);
  };

  const handleSelectCountry = (country: Country, sourceTab?: 'popular' | 'all', selectedType?: 'fixed' | 'unlimited') => {
    setSelectedCountry(country);
    setSelectedPlanType(selectedType);
    setReturnToAllCountries(sourceTab === 'all');
    setCurrentScreen('plan-details');
  };

  const handleBackFromPlanDetails = () => {
    setCurrentScreen('country-selection');
    setSelectedPlanType(undefined);
    if (returnToAllCountries) {
      setOpenAllCountries(true);
      setReturnToAllCountries(false);
    }
  };

  const handleSelectRegion = (regionId: string, regionName: string) => {
    setSelectedCountry({
      id: regionId,
      name: regionName,
      code: 'REG',
      type: 'regional',
      popular: false,
    });
    setCurrentScreen('plan-details');
  };

  const scrollToWhatIsEsim = () => {
    if (currentScreen !== 'home') {
      setCurrentScreen('home');
      setTimeout(() => {
        const section = document.getElementById('what-is-esim-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else {
      const section = document.getElementById('what-is-esim-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const scrollToHowItWorks = () => {
    if (currentScreen !== 'home') {
      setCurrentScreen('home');
      setTimeout(() => {
        const section = document.getElementById('how-it-works-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else {
      const section = document.getElementById('how-it-works-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  const navTab =
    currentScreen === 'home' ? 'home' :
    (currentScreen === 'country-selection' || currentScreen === 'plan-details') ? 'plan' :
    currentScreen === 'esim-installation-guide' ? 'install' :
    currentScreen === 'my-data' ? 'data' :
    currentScreen === 'my-orders' ? 'history' :
    currentScreen === 'help-center' ? 'help' :
    currentScreen === 'partner' ? 'partner' :
    (currentScreen === 'auth' || currentScreen === 'account-details' || currentScreen === 'restart-password' || currentScreen === 'spark-history') ? 'account' :
    'home';

  return (
    <div key={langKey} className="min-h-screen bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfb_100%)] text-slate-900 overflow-x-hidden pb-20 md:pb-10 relative">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-300/12 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[55%] h-[55%] bg-emerald-300/12 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[50%] h-[50%] bg-teal-200/16 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation Bar - Cart ရော Restart Password ရောက်ချိန်တွင်ပါ TopNavigation ကို ဖြုတ်ထားပါသည် */}
        {currentScreen !== 'cart' && currentScreen !== 'restart-password' && (
          <TopNavigation
            activeTab={navTab}
            isLoggedIn={isLoggedIn}
            onHomeClick={goHome}
            onProductClick={goProduct}
            onInstallClick={() => setCurrentScreen('esim-installation-guide')}
            onDataClick={goToMyData}
            onPartnerClick={goPartner}
            onHelpClick={goHelpCenter}
            onAccountClick={goToAccountOrAuth}
            onHistoryClick={goHistory}
            onChatClick={() => setShowSupportChat(true)}
          />
        )}

        <main className="flex-1 w-full relative z-0">
          {currentScreen === 'home' && (
            <HomePage
              onExplorePlans={(filterType) => {
                if (filterType === 'region') setActivePlanTab('regional');
                else if (filterType === 'country') setActivePlanTab('country');
                goProduct();
              }}
              onSelectCountry={handleSelectCountry}
            />
          )}

          {currentScreen === 'cart' && (
            <CartPage
              onBack={goHome}
              onGoProduct={goProduct}
              onGoHome={goHome}
            />
          )}

          {currentScreen === 'plan-details' && selectedCountry && (
            <PlanDetails
              country={selectedCountry}
              planFilterType={selectedPlanType}
              isLoggedIn={isLoggedIn}
              onRequireLogin={(variationId) => {
                setPendingCheckoutVariationId(variationId);
                setPostAuthScreen('cart');
                goAuth('sign-in');
              }}
              onProceedToCheckout={() => {
                setAutoOpenCheckout(true);
                setCurrentScreen('cart');
              }}
              onBack={handleBackFromPlanDetails}
              onHome={goHome}
              onGoToCart={goCart}
            />
          )}

          {currentScreen === 'country-selection' && (
            <CountrySelection
              initialTab={activePlanTab} 
              onBack={goEsimCheck}
              onHome={goHome}
              onSelectCountry={handleSelectCountry}
              onSelectRegion={handleSelectRegion}
              onGlobalPlan={() => {
                setSelectedCountry({ id: 'global', name: 'Global eSIM', code: 'GLB', type: 'global', popular: false });
                setSelectedPlanType('fixed');
                setCurrentScreen('plan-details');
              }}
              onHelp={goHelpCenter}
              onScreenChange={setCurrentScreen}
              openAllCountries={openAllCountries}
              onOpenAllCountriesHandled={() => setOpenAllCountries(false)}
            />
          )}

          {currentScreen === 'help-center' && (
            <HelpCenter
              onBack={goHome}
              onTravelEsim={() => setCurrentScreen('esim-installation-guide')}
              onEsimCheck={goEsimCheck}
              onApnSettings={() => setCurrentScreen('apn-settings')}
              onFaq={() => openFaq(undefined, 'help-center')}
            />
          )}

          {currentScreen === 'esim-installation-guide' && (
            <EsimInstallationGuide onBack={() => setCurrentScreen('help-center')} />
          )}

          {currentScreen === 'apn-settings' && (
            <ApnSettings onBack={goHelpCenter} onOpenOrderDetailSignalInfo={goToMyData} />
          )}

          {currentScreen === 'faq' && (
            <FAQ onBack={handleBackFromFaq} initialCategory={faqInitialCategory} />
          )}

          {currentScreen === 'esim-check' && (
            <EsimCheck
              onBack={goHelpCenter}
              onYes={goHelpCenter}
            />
          )}

          {currentScreen === 'no-esim-support' && (
            <NoEsimSupport onBack={goEsimCheck} onOrderSim={goHome} />
          )}

          {currentScreen === 'privacy-policy' && (
            <PrivacyPolicy onBack={goHome} />
          )}

          {currentScreen === 'terms-conditions' && (
            <TermsConditions onBack={goHome} />
          )}

          {currentScreen === 'auth' && (
            <AccountAuth
              initialMode={authMode}
              onAuthSuccess={async (loggedIn) => {
                setIsLoggedIn(loggedIn);
                if (loggedIn && postAuthScreen) {
                  if (postAuthScreen === 'cart' && pendingCheckoutVariationId !== null) {
                    try {
                      await addToCart(pendingCheckoutVariationId, 1);
                    } finally {
                      setPendingCheckoutVariationId(null);
                    }
                  }
                  setCurrentScreen(postAuthScreen);
                  setPostAuthScreen(null);
                } else {
                  setCurrentScreen(loggedIn ? 'account-details' : 'auth');
                }
              }}
              onBack={goHome}
            />
          )}

          {currentScreen === 'restart-password' && (
            <RestartPassword 
              onGoToSignIn={() => { setAuthMode('sign-in'); setCurrentScreen('auth'); }} 
              onBack={goHome}
            />
          )}

          {currentScreen === 'account-details' && isLoggedIn && (
            <AccountDetails
              onLogout={async () => {
                await logout();
                setIsLoggedIn(false);
                setCurrentScreen('auth');
              }}
              onGoToOrders={goToMyOrders}
              onGoToSparkHistory={goToSparkHistory} 
            />
          )}

          {currentScreen === 'spark-history' && (
            <SparkHistory onBack={() => setCurrentScreen('account-details')} />
          )}

          {currentScreen === 'my-data' && (
            <MyData onClose={goHome} onHome={goHome} />
          )}

          {currentScreen === 'my-orders' && (
            <PurchaseHistory 
              onClose={() => setCurrentScreen('account-details')} 
              onBackToAccount={() => setCurrentScreen('account-details')}
              onHome={goHome} 
              onData={goToMyData} 
              onHelp={goHelpCenter} 
            />
          )}

          {currentScreen === 'partner' && <PartnerPage />}
        </main>

        {/* Bottom Navigation */}
        <div className="md:hidden">
          <BottomNavigation
            activeTab={navTab as 'home' | 'plan' | 'data' | 'account' | 'help'}
            isLoggedIn={isLoggedIn}
            onHomeClick={goHome}
            onPlanClick={goProduct}
            onDataClick={goToMyData}
            onHelpClick={goHelpCenter}
            onAccountClick={goToAccountOrAuth}
          />
        </div>

        {/* Footer - Cart ရော Restart Password ရောက်ချိန်တွင်ပါ Footer ကို ဖြုတ်ထားပါသည် */}
        {currentScreen !== 'cart' && currentScreen !== 'restart-password' && (
          <div className="hidden md:block">
            <Footer
              activeScreen={currentScreen} 
              onHomeClick={goHome}
              onHelpCenterClick={goHelpCenter}
              onFaqClick={() => openFaq(undefined, 'help-center')}
              onTravelEsimClick={() => setCurrentScreen('esim-installation-guide')}
              onApnSettingsClick={() => setCurrentScreen('apn-settings')}
              onEsimCheckClick={goEsimCheck}
              onWhatIsEsimClick={scrollToWhatIsEsim}
              onHowItWorksClick={scrollToHowItWorks}
              onPrivacyPolicyClick={goPrivacyPolicy}
              onTermsClick={goTerms}
              onCountryEsimsClick={goCountryEsims}
              onRegionalEsimsClick={goRegionalEsims}
              onGlobalEsimsClick={goGlobalEsims}
            />
          </div>
        )}
      </div>
      {supportChatLauncher}
      <CustomAlertHost />
    </div>
  );
}

export default App;