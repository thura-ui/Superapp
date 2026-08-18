import { Smartphone, FileText, Wifi, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🌟 i18next မှ useTranslation ကို import လုပ်ထားပါသည်

interface ApnSettingsProps {
  onBack: () => void;
  onOpenOrderDetailSignalInfo?: () => void;
}

export default function ApnSettings({ onBack, onOpenOrderDetailSignalInfo }: ApnSettingsProps) {
  // 🌟 Translation hook ကို ခေါ်ယူထားပါသည်
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 selection:bg-blue-500/10 font-['Poppins']">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-center">
          {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
          <h1 className="text-base sm:text-xl font-semibold text-slate-900 tracking-tight text-center font-['Poppins']">
            {t('apnSettingsGuide', 'APN Settings Guide')}
          </h1>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Hero Card (Info Notice) */}
          <div className="md:col-span-5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[28px] p-6 text-white shadow-xl shadow-blue-500/15 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <div>
              {/* 🌟 Font weight ကို font-semibold ပြောင်းလဲထားပါသည် */}
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md inline-block mb-2 font-['Poppins']">
                {t('apnTroubleshooting', 'Troubleshooting')}
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-snug font-['Poppins']">
                {t('apnNoInternet', 'No Internet Connection?')}
              </h2>
            </div>
            <p className="text-blue-50/90 text-xs sm:text-sm leading-relaxed font-semibold font-['Poppins']">
              {t('apnNoInternetDesc', 'When your mobile phone is successfully connected to the network signal but internet data is not working, please check and configure your APN settings.')}
            </p>
          </div>

          {/* Right Instruction Steps */}
          <div className="md:col-span-7 bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-sm space-y-4">
            {/* 🌟 Font weight ကို font-semibold ပြောင်းလဲထားပါသည် */}
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1 font-['Poppins']">
              {t('apnFollowSteps', 'Follow these simple steps:')}
            </h3>

            <div className="space-y-3">
              {/* Step 1: Go to My Data */}
              <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* 🌟 Font weight ကို font-semibold ပြောင်းလဲထားပါသည် */}
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block font-['Poppins']">{t('apnStep1', 'Step 1')}</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate font-['Poppins']">{t('apnStep1Desc', 'Go to My Data Page')}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0 text-cyan-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* 🌟 Font weight ကို font-semibold ပြောင်းလဲထားပါသည် */}
                  <span className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider block font-['Poppins']">{t('apnStep2', 'Step 2')}</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate font-['Poppins']">{t('apnStep2Desc', 'Click My Data Detail')}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* 🌟 Font weight ကို font-semibold ပြောင်းလဲထားပါသည် */}
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block font-['Poppins']">{t('apnStep3', 'Step 3')}</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate font-['Poppins']">{t('apnStep3Desc', 'Click Signal Info button to view APN')}</p>
                </div>
              </div>
            </div>

            {/* Action Button: Check Now -> My Data သို့ သွားမည် */}
            <div className="pt-3">
              {/* 🌟 Font weight ကို font-semibold ပြောင်းလဲထားပါသည် */}
              <button
                onClick={() => {
                  if (onOpenOrderDetailSignalInfo) {
                    onOpenOrderDetailSignalInfo();
                  } else {
                    onBack();
                  }
                }}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none font-['Poppins']"
              >
                <span>{t('apnCheckNow', 'Check Now')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}