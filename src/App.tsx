import { useState, useEffect } from 'react';
import LoadingPage from './components/LoadingPage';
import Onboarding from './components/Onboarding';
import TopNavigation from './components/TopNavigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import CountrySelection from './components/CountrySelection';
import PlanDetails from './components/PlanDetails';
import HelpCenter from './components/HelpCenter';
import EsimCheck from './components/EsimCheck';
import { logout } from './lib/authApi';

import NoEsimSupport from './components/NoEsimSupport';
import EsimInstallationGuide from './components/EsimInstallationGuide';
import EsimStatus from './components/EsimStatus';
import ApnSettings from './components/ApnSettings';
import FAQ from './components/FAQ';
import MyData from './components/MyData';
import PurchaseHistory from './components/PurchaseHistory';
import CartPage from './components/Cart';
import AccountAuth from './components/AccountAuth';
import AccountDetails from './components/AccountDetails';
import PartnerPage from './components/PartnerPage';
import type { Screen, Country } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [faqInitialCategory, setFaqInitialCategory] = useState<string | undefined>(undefined);
  const [faqBackScreen, setFaqBackScreen] = useState<'help-center' | 'plan-details'>('help-center');
  const [returnToAllCountries, setReturnToAllCountries] = useState(false);
  const [openAllCountries, setOpenAllCountries] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  const goHome = () => setCurrentScreen('home');
  const goProduct = () => setCurrentScreen('country-selection');
  const goCart = () => setCurrentScreen('cart');
  const goEsimCheck = () => setCurrentScreen('esim-check');
  const goHelpCenter = () => setCurrentScreen('help-center');
  const goPartner = () => setCurrentScreen('partner');
  const goAuth = (mode: 'sign-in' | 'sign-up' = 'sign-in') => {
    setAuthMode(mode);
    setCurrentScreen('auth');
  };

  const goToMyData = () => setCurrentScreen('my-data');
  const goToMyOrders = () => setCurrentScreen('my-orders');

  const openFaq = (category?: string, backScreen: 'help-center' | 'plan-details' = 'help-center') => {
    setFaqInitialCategory(category);
    setFaqBackScreen(backScreen);
    setCurrentScreen('faq');
  };

  const handleBackFromFaq = () => {
    setFaqInitialCategory(undefined);
    setCurrentScreen(faqBackScreen);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectCountry = (country: Country, sourceTab?: 'popular' | 'all') => {
    setSelectedCountry(country);
    setReturnToAllCountries(sourceTab === 'all');
    setCurrentScreen('plan-details');
  };

  const handleBackFromPlanDetails = () => {
    setCurrentScreen('country-selection');
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

  if (isLoading) {
    return <LoadingPage />;
  }

  if (currentScreen === 'onboarding') {
    return (
      <Onboarding
        onLogin={() => goAuth('sign-in')}
        onSignUp={() => goAuth('sign-up')}
        onSkip={goHome}
      />
    );
  }

  // Full-screen overlays (no nav/footer)
  if (currentScreen === 'cart') {
    return <CartPage onBack={goHome} />;
  }

  if (currentScreen === 'plan-details' && selectedCountry) {
    return (
      <PlanDetails
        country={selectedCountry}
        onBack={handleBackFromPlanDetails}
        onGoToCart={goCart}
      />
    );
  }

  const navTab =
    currentScreen === 'home' ? 'home' :
    currentScreen === 'country-selection' ? 'product' :
    currentScreen === 'my-data' ? 'data' :
    currentScreen === 'partner' ? 'partner' :
    (currentScreen === 'auth' || currentScreen === 'account-details') ? 'account' :
    'home';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] flex flex-col">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[55%] h-[55%] bg-emerald-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[50%] h-[50%] bg-teal-300/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNavigation
          activeTab={navTab}
          isLoggedIn={isLoggedIn}
          onHomeClick={goHome}
          onProductClick={goProduct}
          onDataClick={goToMyData}
          onPartnerClick={goPartner}
          onAccountClick={() => setCurrentScreen(isLoggedIn ? 'account-details' : 'auth')}
          onCartClick={goCart}
        />

        <main className="flex-1">
          {currentScreen === 'home' && (
            <HomePage
              onExplorePlans={goProduct}
              onSelectCountry={handleSelectCountry}
            />
          )}

          {currentScreen === 'country-selection' && (
            <CountrySelection
              onBack={goEsimCheck}
              onHome={goHome}
              onSelectCountry={handleSelectCountry}
              onSelectRegion={handleSelectRegion}
              onGlobalPlan={() => {
                setSelectedCountry({ id: 'global', name: 'Global eSIM', code: 'GLB', type: 'global', popular: false });
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
              onEsimStatus={() => setCurrentScreen('esim-status')}
              onApnSettings={() => setCurrentScreen('apn-settings')}
              onFaq={() => openFaq(undefined, 'help-center')}
            />
          )}

          {currentScreen === 'esim-installation-guide' && (
            <EsimInstallationGuide onBack={() => setCurrentScreen('help-center')} />
          )}

          {currentScreen === 'esim-status' && (
            <EsimStatus onBack={goHelpCenter} onCheckNow={goToMyData} />
          )}

          {currentScreen === 'apn-settings' && (
            <ApnSettings onBack={goHelpCenter} onOpenOrderDetailSignalInfo={goToMyOrders} />
          )}

          {currentScreen === 'faq' && (
            <FAQ onBack={handleBackFromFaq} initialCategory={faqInitialCategory} />
          )}

          {currentScreen === 'esim-check' && (
            <EsimCheck
              onBack={goHome}
              onYes={goHome}
              onNoSupport={() => setCurrentScreen('no-esim-support')}
            />
          )}

          {currentScreen === 'no-esim-support' && (
            <NoEsimSupport onBack={goEsimCheck} onOrderSim={goHome} />
          )}

          {currentScreen === 'auth' && (
            <AccountAuth
              initialMode={authMode}
              onAuthSuccess={(loggedIn) => {
                setIsLoggedIn(loggedIn);
                setCurrentScreen(loggedIn ? 'account-details' : 'auth');
              }}
              onBack={goHome}
            />
          )}

          {currentScreen === 'account-details' && isLoggedIn && (
            <AccountDetails
              onBack={goHome}
              onLogout={async () => {
                await logout();
                setIsLoggedIn(false);
                setCurrentScreen('auth');
              }}
            />
          )}

          {currentScreen === 'my-data' && (
            <MyData onClose={goHome} onHome={goHome} onOrder={goToMyOrders} onHelp={goHelpCenter} />
          )}

          {currentScreen === 'my-orders' && (
            <PurchaseHistory onClose={goHome} onHome={goHome} onData={goToMyData} onHelp={goHelpCenter} />
          )}

          {currentScreen === 'partner' && <PartnerPage />}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
