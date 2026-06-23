import { User, ShoppingCart } from 'lucide-react';

interface TopNavigationProps {
  activeTab: string;
  isLoggedIn: boolean;
  onHomeClick: () => void;
  onProductClick: () => void;
  onDataClick: () => void;
  onPartnerClick: () => void;
  onAccountClick: () => void;
  onCartClick: () => void;
}

export default function TopNavigation({
  activeTab,
  isLoggedIn,
  onHomeClick,
  onProductClick,
  onDataClick,
  onPartnerClick,
  onAccountClick,
  onCartClick,
}: TopNavigationProps) {
  const linkClass = (tab: string) =>
    `px-4 py-2 font-bold text-sm transition-all rounded-xl ${
      activeTab === tab
        ? 'text-white bg-white/10 border border-white/20'
        : 'text-white/70 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#042f2e]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={onHomeClick} className="flex items-center gap-2 shrink-0">
            <img
              src="/s_i_m_l_e_s_s-removebg copy copy.png"
              alt="SIMLESS Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-lg font-black tracking-tight hidden sm:block">
              <span className="text-[#1a8cff]">SIMLESS</span>{' '}
              <span className="text-[#f5a623]">Your Travel eSIM</span>
            </span>
          </button>

          {/* Nav Links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={onHomeClick} className={linkClass('home')}>Home</button>
            <button onClick={onProductClick} className={linkClass('product')}>Product</button>
            <button onClick={onDataClick} className={linkClass('data')}>
              <span className="flex items-center gap-1.5">
                My Data Checked
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </span>
            </button>
            <button onClick={onPartnerClick} className={linkClass('partner')}>Partner with us</button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCartClick}
              className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all relative"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={onAccountClick}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white hidden sm:block">
                {isLoggedIn ? 'My Account' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          <button onClick={onHomeClick} className={linkClass('home') + ' text-xs whitespace-nowrap'}>Home</button>
          <button onClick={onProductClick} className={linkClass('product') + ' text-xs whitespace-nowrap'}>Product</button>
          <button onClick={onDataClick} className={linkClass('data') + ' text-xs whitespace-nowrap'}>My Data</button>
          <button onClick={onPartnerClick} className={linkClass('partner') + ' text-xs whitespace-nowrap'}>Partner</button>
        </div>
      </div>
    </nav>
  );
}
