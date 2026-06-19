import { ChevronLeft } from 'lucide-react';

interface ApnSettingsProps {
  onBack: () => void;
  onOpenOrderDetailSignalInfo?: () => void;
}

export default function ApnSettings({ onBack, onOpenOrderDetailSignalInfo }: ApnSettingsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-3 sm:py-4">
          <button onClick={onBack} className="mr-3 touch-manipulation active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">APN Settings</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            When the mobile phone is successfully connected to the network but there is no network connection, please check the APN settings.
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
                1. Click My Order Page
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-blue-400">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="10" width="60" height="90" rx="8" stroke="#3B82F6" strokeWidth="2.5" fill="white"/>
                <path d="M35 35 L65 35 L65 55 L60 60 L40 60 L35 55 Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5"/>
                <line x1="40" y1="40" x2="60" y2="40" stroke="#3B82F6" strokeWidth="1"/>
                <line x1="40" y1="45" x2="60" y2="45" stroke="#3B82F6" strokeWidth="1"/>
                <line x1="40" y1="50" x2="60" y2="50" stroke="#3B82F6" strokeWidth="1"/>
              </svg>
            </div>
            <div className="flex-1 pt-4 sm:pt-8">
              <p className="text-gray-900 text-sm sm:text-base font-medium">
                2. Click Plan Order Detail
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-blue-400">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="10" width="60" height="90" rx="8" stroke="#3B82F6" strokeWidth="2.5" fill="white"/>
                <rect x="27" y="25" width="46" height="10" rx="2" fill="white" stroke="#3B82F6" strokeWidth="1.5"/>
                <text x="50" y="32" fontSize="6" fill="#3B82F6" textAnchor="middle" fontWeight="600">APN</text>
                <rect x="27" y="40" width="46" height="10" rx="2" fill="white" stroke="#3B82F6" strokeWidth="1.5"/>
                <text x="50" y="47" fontSize="6" fill="#3B82F6" textAnchor="middle" fontWeight="600">Username</text>
                <rect x="27" y="55" width="46" height="10" rx="2" fill="white" stroke="#3B82F6" strokeWidth="1.5"/>
                <text x="50" y="62" fontSize="6" fill="#3B82F6" textAnchor="middle" fontWeight="600">Password</text>
              </svg>
            </div>
            <div className="flex-1 pt-4 sm:pt-8">
              <p className="text-gray-900 text-sm sm:text-base font-medium">
                3. Click Signal Info button
              </p>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-4">
          <button
            onClick={() => {
              if (onOpenOrderDetailSignalInfo) {
                onOpenOrderDetailSignalInfo();
              } else {
                // fallback: go back to previous screen
                onBack();
              }
            }}
            className="w-full py-3 sm:py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-98 transition-all touch-manipulation">
            Check Now
          </button>
        </div>
      </div>
    </div>
  );
}
