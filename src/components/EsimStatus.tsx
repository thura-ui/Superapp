import { ChevronLeft } from 'lucide-react';

interface EsimStatusProps {
  onBack: () => void;
  onCheckNow: () => void;
}

export default function EsimStatus({ onBack, onCheckNow }: EsimStatusProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-3 sm:py-4">
          <button onClick={onBack} className="mr-3 touch-manipulation active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Travel eSIM Status</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
            Add the eSIM Card, and you can check the validity period of the card and the data plan
          </p>
          <p className="text-gray-600 text-xs sm:text-sm">
            (it is recommended to bind the card in advance before traveling)
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-blue-400">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="10" width="60" height="90" rx="8" stroke="#3B82F6" strokeWidth="2.5" fill="white"/>
                <rect x="30" y="20" width="40" height="30" rx="4" fill="#DBEAFE"/>
                <circle cx="35" cy="60" r="3" fill="#3B82F6"/>
                <circle cx="50" cy="60" r="3" fill="#3B82F6"/>
                <circle cx="65" cy="60" r="3" fill="#3B82F6"/>
                <rect x="30" y="70" width="40" height="4" rx="2" fill="#3B82F6"/>
              </svg>
            </div>
            <div className="flex-1 pt-4 sm:pt-8">
              <p className="text-gray-900 text-sm sm:text-base font-medium">
                1. Click the "My Data" page
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-blue-400">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="10" width="60" height="90" rx="8" stroke="#3B82F6" strokeWidth="2.5" fill="white"/>
                <rect x="27" y="25" width="46" height="6" rx="2" fill="#DBEAFE"/>
                <circle cx="30" cy="28" r="1.5" fill="#3B82F6"/>
                <rect x="27" y="35" width="46" height="6" rx="2" fill="#DBEAFE"/>
                <circle cx="30" cy="38" r="1.5" fill="#3B82F6"/>
                <rect x="27" y="45" width="46" height="6" rx="2" fill="#DBEAFE"/>
                <circle cx="30" cy="48" r="1.5" fill="#3B82F6"/>
                <rect x="27" y="55" width="46" height="6" rx="2" fill="#DBEAFE"/>
                <circle cx="30" cy="58" r="1.5" fill="#3B82F6"/>
              </svg>
            </div>
            <div className="flex-1 pt-4 sm:pt-8">
              <p className="text-gray-900 text-sm sm:text-base font-medium">
                2. Check your data information
              </p>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-4">
          <button
            onClick={onCheckNow}
            className="w-full py-3 sm:py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-98 transition-all touch-manipulation"
          >
            Check Now
          </button>
        </div>
      </div>
    </div>
  );
}
