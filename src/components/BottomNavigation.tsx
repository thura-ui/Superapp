import { Home, Database, HelpCircle, User, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🌟 i18next ကို import လုပ်ထားပါသည်

interface BottomNavigationProps {
  activeTab?: 'home' | 'plan' | 'data' | 'account' | 'help';
  isLoggedIn?: boolean;
  onHomeClick: () => void;
  onPlanClick: () => void;
  onDataClick: () => void;
  onAccountClick: () => void;
  onHelpClick: () => void;
  className?: string;
}

export default function BottomNavigation({
  activeTab = 'home',
  isLoggedIn = false,
  onHomeClick,
  onPlanClick,
  onDataClick,
  onAccountClick,
  onHelpClick,
  className
}: BottomNavigationProps) {
  // 🌟 Translation hook ကို ခေါ်ယူထားပါသည်
  const { t } = useTranslation();

  const baseItemClass = "flex flex-1 min-w-0 flex-col items-center justify-center gap-1 py-1 px-1 sm:px-2 transition-all group relative border-none bg-transparent cursor-pointer font-['Retro_Floral',sans-serif]";
  
  const pillClass = (isActive: boolean) =>
    `relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl transition-all duration-300 ${
      isActive
        ? 'bg-blue-500/15 shadow-[0_0_20px_rgba(37,99,235,0.18)] border border-solid border-blue-400/30'
        : 'bg-transparent hover:bg-white/70'
    }`;
    
  const iconClass = (isActive: boolean) =>
    `w-4.5 h-4.5 sm:w-5 sm:h-5 transition-all duration-300 ${
      isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'
    }`;
    
  const labelClass = (isActive: boolean) =>
    `text-xs lg:text-[13px] font-normal tracking-wide transition-colors duration-300 text-center font-['Retro_Floral'] ${
      isActive ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'
    }`;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white/75 backdrop-blur-xl border-t border-white/80 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] z-50 font-['Retro_Floral',sans-serif] ${className ?? ''}`}>
      <div className="max-w-md mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-1 py-1.5 sm:py-2">
          
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => onHomeClick()}
            className={baseItemClass}
          >
            <div className={pillClass(activeTab === 'home')}>
              <Home className={iconClass(activeTab === 'home')} />
              {activeTab === 'home' && (
                <div className="absolute inset-0 bg-blue-400/10 blur-lg rounded-full" />
              )}
            </div>
            <span className={labelClass(activeTab === 'home')}>{t('navHome', 'Home')}</span>
          </button>

          {/* Plan Tab */}
          <button
            type="button"
            onClick={() => onPlanClick()}
            className={baseItemClass}
          >
            <div className={pillClass(activeTab === 'plan')}>
              <Map className={iconClass(activeTab === 'plan')} />
              {activeTab === 'plan' && (
                <div className="absolute inset-0 bg-blue-400/10 blur-lg rounded-full" />
              )}
            </div>
            <span className={labelClass(activeTab === 'plan')}>{t('navPlan', 'Plan')}</span>
          </button>

          {/* Data Tab */}
          <button
            type="button"
            onClick={() => onDataClick()}
            className={baseItemClass}
          >
            <div className={pillClass(activeTab === 'data')}>
              <Database className={iconClass(activeTab === 'data')} />
              {activeTab === 'data' && (
                <div className="absolute inset-0 bg-blue-400/10 blur-lg rounded-full" />
              )}
            </div>
            <span className={labelClass(activeTab === 'data')}>{t('navData', 'Data')}</span>
          </button>

          {/* Help Tab */}
          <button
            type="button"
            onClick={() => onHelpClick()}
            className={baseItemClass}
          >
            <div className={pillClass(activeTab === 'help')}>
              <HelpCircle className={iconClass(activeTab === 'help')} />
              {activeTab === 'help' && (
                <div className="absolute inset-0 bg-blue-400/10 blur-lg rounded-full" />
              )}
            </div>
            <span className={labelClass(activeTab === 'help')}>{t('navHelp', 'Help')}</span>
          </button>

          {/* Account Tab */}
          <button
            type="button"
            onClick={() => onAccountClick()}
            className={baseItemClass}
          >
            <div className={pillClass(activeTab === 'account')}>
              <User className={iconClass(activeTab === 'account')} />
              {activeTab === 'account' && (
                <div className="absolute inset-0 bg-blue-400/10 blur-lg rounded-full" />
              )}
            </div>
            <span className={labelClass(activeTab === 'account')}>
              {isLoggedIn ? t('navAccount', 'Account') : t('navSignIn', 'Sign In')}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}