import { Home, BarChart3, FileText, HelpCircle, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab?: 'home' | 'data' | 'order' | 'help' | 'account';
  onHomeClick?: () => void;
  onDataClick?: () => void;
  onOrderClick?: () => void;
  onHelpClick?: () => void;
  onAccountClick?: () => void;
  isLoggedIn?: boolean;
  className?: string;
}

export default function BottomNavigation({
  activeTab = 'home',
  onHomeClick,
  onDataClick,
  onOrderClick,
  onHelpClick,
  onAccountClick,
  isLoggedIn = false,
  className
}: BottomNavigationProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-slate-300/20 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] z-50 ${className ?? ''}`}>
      <div className="max-w-md mx-auto px-6">
        <div className="flex items-center justify-between py-3">
          <button
            onClick={onHomeClick}
            className="flex flex-col items-center justify-center gap-1.5 py-1 px-3 min-w-[64px] transition-all group relative"
          >
            <div className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
              activeTab === 'home' 
                ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-400/30' 
                : 'bg-transparent hover:bg-white/5'
            }`}>
              <Home className={`w-6 h-6 transition-all duration-300 ${
                activeTab === 'home' ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'text-gray-400 group-hover:text-gray-200'
              }`} />
              {activeTab === 'home' && (
                <div className="absolute inset-0 bg-cyan-400/10 blur-lg rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
              activeTab === 'home' ? 'text-cyan-300' : 'text-gray-500 group-hover:text-gray-300'
            }`}>
              Home
            </span>
          </button>

          {isLoggedIn && (
            <>
              <button
                onClick={onOrderClick}
                className="flex flex-col items-center justify-center gap-1.5 py-1 px-3 min-w-[64px] transition-all group relative"
              >
                <div className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                  activeTab === 'order' 
                    ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-400/30' 
                    : 'bg-transparent hover:bg-white/5'
                }`}>
                  <FileText className={`w-6 h-6 transition-all duration-300 ${
                    activeTab === 'order' ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'text-gray-400 group-hover:text-gray-200'
                  }`} />
                  {activeTab === 'order' && (
                    <div className="absolute inset-0 bg-cyan-400/10 blur-lg rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                  activeTab === 'order' ? 'text-cyan-300' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  Orders
                </span>
              </button>

              <button
                onClick={onDataClick}
                className="flex flex-col items-center justify-center gap-1.5 py-1 px-3 min-w-[64px] transition-all group relative"
              >
                <div className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                  activeTab === 'data' 
                    ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-400/30' 
                    : 'bg-transparent hover:bg-white/5'
                }`}>
                  <BarChart3 className={`w-6 h-6 transition-all duration-300 ${
                    activeTab === 'data' ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'text-gray-400 group-hover:text-gray-200'
                  }`} />
                  {activeTab === 'data' && (
                    <div className="absolute inset-0 bg-cyan-400/10 blur-lg rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                  activeTab === 'data' ? 'text-cyan-300' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  Data
                </span>
              </button>
            </>
          )}

          <button
            onClick={onAccountClick}
            className="flex flex-col items-center justify-center gap-1.5 py-1 px-3 min-w-[64px] transition-all group relative"
          >
            <div className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
              activeTab === 'account' 
                ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-400/30' 
                : 'bg-transparent hover:bg-white/5'
            }`}>
              <User className={`w-6 h-6 transition-all duration-300 ${
                activeTab === 'account' ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'text-gray-400 group-hover:text-gray-200'
              }`} />
              {activeTab === 'account' && (
                <div className="absolute inset-0 bg-cyan-400/10 blur-lg rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
              activeTab === 'account' ? 'text-cyan-300' : 'text-gray-500 group-hover:text-gray-300'
            }`}>
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

