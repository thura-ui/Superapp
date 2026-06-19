import { useState, useEffect } from 'react';
import LoadingPage from './components/LoadingPage';
import Onboarding from './components/Onboarding';
import CountrySelection from './components/CountrySelection';
import PlanDetails from './components/PlanDetails';
import HelpCenter from './components/HelpCenter';
import EsimCheck from './components/EsimCheck'; // Re-add EsimCheck import
import { logout } from './lib/authApi';

import NoEsimSupport from './components/NoEsimSupport';
import EsimInstallationGuide from './components/EsimInstallationGuide';
import EsimStatus from './components/EsimStatus';
import ApnSettings from './components/ApnSettings';
import FAQ from './components/FAQ';
import MyData from './components/MyData';
import PurchaseHistory from './components/PurchaseHistory';
import CartPage from './components/Cart';
import AccountAuth from './components/AccountAuth'; // Import AccountAuth
import AccountDetails from './components/AccountDetails'; // Import AccountDetails
import BottomNavigation from './components/BottomNavigation'; // Import BottomNavigation
import type { Screen, Country } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [faqInitialCategory, setFaqInitialCategory] = useState<string | undefined>(undefined);
  const [faqBackScreen, setFaqBackScreen] = useState<'help-center' | 'plan-details'>('help-center');
  const [openMyData, setOpenMyData] = useState(false);
  const [openOrderSignalInfo, setOpenOrderSignalInfo] = useState(false);
  const [openAllCountries, setOpenAllCountries] = useState(false);
  const [returnToAllCountries, setReturnToAllCountries] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken')); // Initialize based on token
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  const goHome = () => setCurrentScreen('country-selection');
  const goCart = () => setCurrentScreen('cart');
  const goEsimCheck = () => setCurrentScreen('esim-check');
  const goHelpCenter = () => setCurrentScreen('help-center');
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
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

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
      popular: false
    });
    setCurrentScreen('plan-details');
  };

  const handleGlobalPlan = () => {
    setSelectedCountry({
      id: 'global',
      name: 'Global eSIM',
      code: 'GLB',
      type: 'global',
      popular: false
    });
    setCurrentScreen('plan-details');
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'cart' && (
        <CartPage onBack={goHome} />
      )}
      {currentScreen === 'onboarding' && (
        <Onboarding
          onLogin={() => goAuth('sign-in')}
          onSignUp={() => goAuth('sign-up')}
          onSkip={goHome}
        />
      )}
      {currentScreen === 'country-selection' && (
        <CountrySelection
          onBack={goEsimCheck}
          onHome={goHome}
          onSelectCountry={handleSelectCountry}
          onSelectRegion={handleSelectRegion}
          onGlobalPlan={handleGlobalPlan}
          onHelp={goHelpCenter}
          onScreenChange={setCurrentScreen}

          openAllCountries={openAllCountries}
          onOpenAllCountriesHandled={() => setOpenAllCountries(false)}
        />
      )}
      {currentScreen === 'plan-details' && selectedCountry && (
        <PlanDetails
          country={selectedCountry}
          onBack={handleBackFromPlanDetails}
          onGoToCart={goCart}
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
        <EsimInstallationGuide
          onBack={() => setCurrentScreen('help-center')}
        />
      )}
      {currentScreen === 'esim-status' && (
        <EsimStatus
          onBack={goHelpCenter}
          onCheckNow={goToMyData}
        />
      )}
      {currentScreen === 'apn-settings' && (
        <ApnSettings
          onBack={goHelpCenter}
          onOpenOrderDetailSignalInfo={goToMyOrders}
        />
      )}
      {currentScreen === 'faq' && (
        <FAQ
          onBack={handleBackFromFaq}
          initialCategory={faqInitialCategory}
        />
      )}
      {currentScreen === 'esim-check' && (
        <EsimCheck
          onBack={goHome}
          onYes={goHome}
          onNoSupport={() => setCurrentScreen('no-esim-support')}
        />
      )}

      {currentScreen === 'no-esim-support' && (
        <NoEsimSupport
          onBack={goEsimCheck}
          onOrderSim={goHome}
        />
      )}
      {currentScreen === 'auth' && (
        <AccountAuth
          initialMode={authMode}
          onAuthSuccess={(loggedIn) => {
            setIsLoggedIn(loggedIn);
            setCurrentScreen(loggedIn ? 'account-details' : 'auth'); // If login success, go to account details, else stay on auth
          }}
          onBack={() => setCurrentScreen('onboarding')} // Going back from auth leads to onboarding
        />
      )}

      {currentScreen === 'account-details' && isLoggedIn && (
        <AccountDetails
          onBack={goHome} // Assuming going back from here leads to home
          onLogout={async () => {
            await logout();
            setIsLoggedIn(false);
            setCurrentScreen('auth'); // On logout, go to auth screen
          }}
        />
      )}

      {currentScreen === 'my-data' && (
        <MyData
          onClose={goHome}
          onHome={goHome}
          onOrder={goToMyOrders}
          onHelp={goHelpCenter}
        />
      )}

      {currentScreen === 'my-orders' && (
        <PurchaseHistory
          onClose={goHome}
          onHome={goHome}
          onData={goToMyData}
          onHelp={goHelpCenter}
        />
      )}

      {currentScreen !== 'onboarding' && (
        <BottomNavigation
          isLoggedIn={isLoggedIn}
          activeTab={
            currentScreen === 'country-selection' ? 'home' :
            currentScreen === 'plan-details' ? 'home' :
            currentScreen === 'esim-check' ? 'home' :
            currentScreen === 'no-esim-support' ? 'home' :
            currentScreen === 'my-data' ? 'data' :
            currentScreen === 'my-orders' ? 'order' :
            (currentScreen === 'esim-installation-guide' || currentScreen === 'esim-status' || currentScreen === 'apn-settings' || currentScreen === 'faq' || currentScreen === 'help-center') ? 'help' :
            (currentScreen === 'auth' || currentScreen === 'account-details') ? 'account' :
            'home'
          }
          onHomeClick={goHome}
          onDataClick={goToMyData}
          onOrderClick={goToMyOrders}
          onHelpClick={goHelpCenter}
          onAccountClick={() => {
            setCurrentScreen(isLoggedIn ? 'account-details' : 'auth');
          }}
        />
      )}
    </div>
  );
}

export default App;
