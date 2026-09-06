import { Smartphone, FileText, Wifi, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ApnSettingsProps {
  onBack: () => void;
  onOpenOrderDetailSignalInfo?: () => void;
}

export default function ApnSettings({ onBack, onOpenOrderDetailSignalInfo }: ApnSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="mobile-typography-fix min-h-screen bg-slate-50/50 pt-16 sm:pt-28 pb-12 px-3.5 sm:px-6 lg:px-8 selection:bg-blue-500/10 font-['Poppins'] text-slate-900 relative">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Top Header Navigation */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3">
          <button
            onClick={onBack}
            type="button"
            className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h3 className="text-sm sm:text-xl font-semibold text-slate-900 tracking-tight font-['Poppins'] m-0 flex-1 truncate">
            {t('apnSettingsGuide', 'APN Settings Guide')}
          </h3>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          {/* Left Hero Card (Info Notice) */}
          <div className="md:col-span-5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[22px] sm:rounded-[28px] p-5 sm:p-6 text-white shadow-lg shadow-blue-500/15 space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-blue-100 uppercase tracking-widest bg-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md inline-block mb-1.5 font-['Poppins']">
                {t('apnTroubleshooting', 'Troubleshooting')}
              </span>
              <h2 className="text-lg sm:text-2xl text-white font-semibold tracking-tight leading-snug font-['Poppins'] m-0">
                {t('apnNoInternet', 'No Internet Connection?')}
              </h2>
            </div>
            <p className="text-blue-50/90 text-xs sm:text-sm leading-relaxed font-normal sm:font-semibold font-['Poppins'] m-0">
              {t('apnNoInternetDesc', 'When your mobile phone is successfully connected to the network signal but internet data is not working, please check and configure your APN settings.')}
            </p>
          </div>

          {/* Right Instruction Steps */}
          <div className="md:col-span-7 bg-white border border-slate-200/70 rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider px-0.5 font-['Poppins'] m-0">
              {t('apnFollowSteps', 'Follow these simple steps:')}
            </h4>

            <div className="space-y-2.5 sm:space-y-3">
              {/* Step 1: Go to My Data */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-blue-600 uppercase tracking-wider block font-['Poppins']">{t('apnStep1', 'Step 1')}</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate font-['Poppins'] m-0">{t('apnStep1Desc', 'Go to My Data Page')}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0 text-cyan-600">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-cyan-600 uppercase tracking-wider block font-['Poppins']">{t('apnStep2', 'Step 2')}</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate font-['Poppins'] m-0">{t('apnStep2Desc', 'Click My Data Detail')}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block font-['Poppins']">{t('apnStep3', 'Step 3')}</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate font-['Poppins'] m-0">{t('apnStep3Desc', 'Click Signal Info button to view APN')}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 sm:pt-3">
              <button
                onClick={() => {
                  if (onOpenOrderDetailSignalInfo) {
                    onOpenOrderDetailSignalInfo();
                  } else {
                    onBack();
                  }
                }}
                className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-none font-['Poppins']"
              >
                <span className="text-white">{t('apnCheckNow', 'Check Now')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}