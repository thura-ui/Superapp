import { useMemo, useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, HelpCircle, Smartphone, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EsimInstallationGuideProps {
  onBack?: () => void;
}

const appleStepImages = [
  '/user-guide/others/eSIM-installation-guides/0.png',
  '/user-guide/others/eSIM-installation-guides/1.png',
  '/user-guide/others/eSIM-installation-guides/2.png',
  '/user-guide/others/eSIM-installation-guides/3.png',
  '/user-guide/others/eSIM-installation-guides/4.png',
  '/user-guide/others/eSIM-installation-guides/5.png',
  '/user-guide/others/eSIM-installation-guides/6.png',
  '/user-guide/others/eSIM-installation-guides/7 copy.png',
  '/user-guide/others/eSIM-installation-guides/8.png',
  '/user-guide/others/eSIM-installation-guides/9.png',
  '/user-guide/others/eSIM-installation-guides/10.png',
  '/user-guide/others/eSIM-installation-guides/11.png',
  '/user-guide/others/eSIM-installation-guides/12.png',
  '/user-guide/others/eSIM-installation-guides/13.png',
  '/user-guide/others/eSIM-installation-guides/14.png',
  '/user-guide/others/eSIM-installation-guides/15.png',
  '/user-guide/others/eSIM-installation-guides/16.png',
];

const samsungStepImages = [
  '/user-guide/others/eSIM-installation-guides/1.jpeg',
  '/user-guide/others/eSIM-installation-guides/2.jpeg',
  '/user-guide/others/eSIM-installation-guides/3.jpeg',
  '/user-guide/others/eSIM-installation-guides/4.jpeg',
  '/user-guide/others/eSIM-installation-guides/5.jpeg',
  '/user-guide/others/eSIM-installation-guides/6.jpeg',
  '/user-guide/others/eSIM-installation-guides/7 copy 2.png',
  '/user-guide/others/eSIM-installation-guides/9.jpeg',
  '/user-guide/others/eSIM-installation-guides/10.jpeg',
];

const othersStepImages = [
  '/user-guide/others/eSIM-installation-guides/1.jpg',
  '/user-guide/others/eSIM-installation-guides/2.jpg',
  '/user-guide/others/eSIM-installation-guides/3.jpg',
  '/user-guide/others/eSIM-installation-guides/4.jpg',
  '/user-guide/others/eSIM-installation-guides/5.jpg',
  '/user-guide/others/eSIM-installation-guides/6.jpg',
  '/user-guide/others/eSIM-installation-guides/7.png',
  '/user-guide/others/eSIM-installation-guides/8.jpg',
  '/user-guide/others/eSIM-installation-guides/9.jpg',
  '/user-guide/others/eSIM-installation-guides/10.jpg',
  '/user-guide/others/eSIM-installation-guides/11.jpg',
  '/user-guide/others/eSIM-installation-guides/12.jpg',
];

type DeviceType = 'apple' | 'samsung' | 'others';

export default function EsimInstallationGuide({ onBack }: EsimInstallationGuideProps) {
  const { t } = useTranslation();

  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('apple');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const troubleshootingTips = useMemo(() => [
    {
      title: t('tsNoInternet'),
      description: t('tsNoInternetDesc'),
    },
    {
      title: t('tsQrNotScanning'),
      description: t('tsQrNotScanningDesc'),
    },
    {
      title: t('tsEsimNotActivating'),
      description: t('tsEsimNotActivatingDesc'),
    },
    {
      title: t('tsDataNotWorking'),
      description: t('tsDataNotWorkingDesc'),
    },
    {
      title: t('tsCannotDelete'),
      description: t('tsCannotDeleteDesc'),
    },
    {
      title: t('tsDeviceNotCompatible'),
      description: t('tsDeviceNotCompatibleDesc'),
    },
  ], [t]);

  const selectedStepImages = useMemo(() => {
    if (selectedDevice === 'samsung') {
      return samsungStepImages;
    }
    if (selectedDevice === 'others') {
      return othersStepImages;
    }
    return appleStepImages;
  }, [selectedDevice]);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedDevice]);

  const handleNext = () => {
    if (currentStepIndex < selectedStepImages.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 40; 
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handleBackStep();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pt-20 sm:pt-28 pb-12 selection:bg-blue-500/10 font-['Poppins'] text-slate-900">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 space-y-4 sm:space-y-6">
        
        {/* Top Title Header */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-3 sm:p-5 rounded-2xl shadow-sm flex items-center justify-start gap-2.5 overflow-hidden">
          {/* Mobile View Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="p-1.5 sm:hidden rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <h3 
            className="font-semibold text-slate-900 tracking-tight text-left font-['Poppins'] whitespace-nowrap truncate leading-none block"
            style={{ fontSize: 'clamp(11px, 3.5vw, 18px)', margin: 0 }}
          >
            {t('travelEsimUserGuide')}
          </h3>
        </div>

        {/* Important Notice Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-2xl p-3.5 sm:p-5 border border-blue-200/50 flex items-start gap-3.5 shadow-sm overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-white">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-left min-w-0 flex-1 overflow-hidden">
            <span 
              className="font-semibold text-slate-900 tracking-tight font-['Poppins'] whitespace-nowrap truncate leading-none block mb-1"
              style={{ fontSize: 'clamp(11px, 3.5vw, 16px)' }}
            >
              {t('importantNoteTitle')}
            </span>
            <p className="text-[11px] sm:text-sm font-semibold text-slate-700 leading-relaxed font-['Poppins']">
              {t('importantNoteDesc')}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* TOP / LEFT SECTION (7 Columns) */}
          <div className="w-full lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* 🔴 Device Filter Tab Box (Other Device စာသား ပြတ်မသွားစေရန် ညှိထားပါသည်) 🔴 */}
<div className="bg-white border border-slate-200/80 p-1 sm:p-1.5 rounded-2xl shadow-sm grid grid-cols-3 gap-1 sm:gap-1.5 w-full box-border">
  <button
    type="button"
    onClick={() => setSelectedDevice('apple')}
    className={`w-full py-2.5 sm:py-3.5 px-0.5 sm:px-2 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 font-['Poppins'] ${
      selectedDevice === 'apple' 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
        : 'bg-transparent text-slate-700 hover:bg-slate-100'
    }`}
  >
    <Smartphone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${selectedDevice === 'apple' ? '!text-white' : 'text-slate-700'}`} />
    <span className={`font-semibold text-[10px] xs:text-[11px] sm:text-sm tracking-tight whitespace-nowrap leading-none ${
      selectedDevice === 'apple' ? '!text-white' : 'text-slate-700'
    }`}>
      {t('appleIos')}
    </span>
  </button>

  <button
    type="button"
    onClick={() => setSelectedDevice('samsung')}
    className={`w-full py-2.5 sm:py-3.5 px-0.5 sm:px-2 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 font-['Poppins'] ${
      selectedDevice === 'samsung' 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
        : 'bg-transparent text-slate-700 hover:bg-slate-100'
    }`}
  >
    <Smartphone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${selectedDevice === 'samsung' ? '!text-white' : 'text-slate-700'}`} />
    <span className={`font-semibold text-[10px] xs:text-[11px] sm:text-sm tracking-tight whitespace-nowrap leading-none ${
      selectedDevice === 'samsung' ? '!text-white' : 'text-slate-700'
    }`}>
      {t('samsung')}
    </span>
  </button>

  <button
    type="button"
    onClick={() => setSelectedDevice('others')}
    className={`w-full py-2.5 sm:py-3.5 px-0.5 sm:px-2 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 font-['Poppins'] ${
      selectedDevice === 'others' 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
        : 'bg-transparent text-slate-700 hover:bg-slate-100'
    }`}
  >
    <Smartphone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${selectedDevice === 'others' ? '!text-white' : 'text-slate-700'}`} />
    <span className={`font-semibold text-[10px] xs:text-[11px] sm:text-sm tracking-tight whitespace-nowrap leading-none ${
      selectedDevice === 'others' ? '!text-white' : 'text-slate-700'
    }`}>
      {t('others')}
    </span>
  </button>
</div>

            {/* Installation Step Viewer Card */}
            <div className="bg-white border border-slate-200/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  
                  <h3 className="text-[11px] xs:text-[11px] sm:text-base font-semibold text-slate-900 font-['Poppins'] whitespace-nowrap">
                    {t('installationSteps')}
                  </h3>
                </div>

                <span className="text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 sm:px-3 py-1 rounded-full font-['Poppins']">
                  {t('stepXOfY', { current: currentStepIndex + 1, total: selectedStepImages.length })}
                </span>
              </div>

              {/* Step Image Container */}
              <div 
                className="relative flex items-center justify-center py-1 sm:py-2 px-2 sm:px-4 group touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                
                {/* HOVER / TOUCH LEFT ARROW BUTTON */}
                <button
                  onClick={handleBackStep}
                  disabled={currentStepIndex === 0}
                  className={`absolute left-0 sm:left-2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-blue-400/30 bg-blue-500/20 backdrop-blur-md text-blue-700 shadow-[0_4px_15px_rgba(37,99,235,0.15)] flex items-center justify-center transition-all duration-300 cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100 ${
                    currentStepIndex === 0
                      ? '!opacity-20 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                      : 'hover:bg-blue-600/80 hover:text-white hover:border-blue-400 active:scale-95'
                  }`}
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>

                {/* Display Step Image */}
                <div className="w-full max-w-xs sm:max-w-md mx-auto rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2 shadow-inner min-h-[280px] sm:min-h-[320px] flex items-center justify-center select-none">
                  <img
                    src={selectedStepImages[currentStepIndex]}
                    alt={`Step ${currentStepIndex + 1}`}
                    className="w-full h-auto max-h-[380px] sm:max-h-[460px] rounded-xl object-contain pointer-events-none"
                  />
                </div>

                {/* HOVER / TOUCH RIGHT ARROW BUTTON */}
                <button
                  onClick={handleNext}
                  disabled={currentStepIndex === selectedStepImages.length - 1}
                  className={`absolute right-0 sm:right-2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-blue-400/30 bg-blue-500/20 backdrop-blur-md text-blue-700 shadow-[0_4px_15px_rgba(37,99,235,0.15)] flex items-center justify-center transition-all duration-300 cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100 ${
                    currentStepIndex === selectedStepImages.length - 1
                      ? '!opacity-20 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                      : 'hover:bg-blue-600/80 hover:text-white hover:border-blue-400 active:scale-95'
                  }`}
                  aria-label="Next step"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>

              </div>

            </div>

          </div>

          {/* BOTTOM / RIGHT SECTION (5 Columns) */}
          <div className="w-full lg:col-span-5 space-y-4 sm:space-y-6">
            
            {/* Troubleshooting Card */}
            <div className="bg-white border border-slate-200/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 shadow-sm space-y-3 text-left">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 font-['Poppins']">{t('troubleshootingTips')}</h3>
              </div>

              <div className="space-y-2 pt-1">
                {troubleshootingTips.map((tip) => (
                  <div key={tip.title} className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-slate-100 space-y-0.5">
                    <h4 className="text-[12px] sm:text-[13px] font-semibold text-slate-900 font-['Poppins']">{tip.title}</h4>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 leading-snug font-['Poppins']">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help Line */}
            <div className="bg-amber-500/10 border border-amber-200/60 rounded-[24px] p-4 text-left space-y-1.5">
              <h4 className="text-xs sm:text-sm font-semibold text-amber-900 font-['Poppins']">{t('needMoreAssistance')}</h4>
              <p className="text-[11px] font-semibold text-amber-900/90 leading-relaxed font-['Poppins']">
                {t('needMoreAssistanceDesc')}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-amber-950 border-t border-amber-200/50 mt-2 font-['Poppins']">
                📞 {t('Contact Us')}: <br />
                +959943229667, +959251167248 <br />
                <span className="text-[10px] font-semibold text-amber-800">{t('supportHours')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}