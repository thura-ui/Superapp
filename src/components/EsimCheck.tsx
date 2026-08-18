import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Smartphone, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

interface EsimCheckProps {
  onBack: () => void;
  onYes?: () => void;
}

export default function EsimCheck({ onBack, onYes }: EsimCheckProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 🌟 [UNIVERSAL DIALER & AUTO-COPY LOGIC]: ဖုန်းအားလုံးတွင် အဆင်ပြေစေရန် Clipboard သို့ Copy ကူးပေးပြီး Dialer ပွင့်စေမည်
  const handleCheckPhone = () => {
    const code = '*#06#';
    
    // 1. Copy code to clipboard as a backup
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {});
    }

    // 2. Open Phone Dialer with encoded USSD string
    window.location.href = 'tel:*%2306%23';

    setHint('Copied *#06#! If dialer does not show automatically, paste or type *#06# in your Phone App.');

    if (onYes) {
      onYes();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-4 py-8 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <button
        onClick={onBack}
        className="relative z-10 self-start p-2 hover:bg-white/80 rounded-lg transition-colors -ml-2 mb-2 md:hidden cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[540px] rounded-[36px] sm:rounded-[40px] shadow-2xl overflow-hidden mt-2 md:mt-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-500/30" />
        <div className="absolute inset-0 bg-white/40" />

        <div className="relative bg-white/85 backdrop-blur-2xl border-2 border-white/80 p-6 sm:p-8 flex flex-col items-center gap-5 sm:gap-6">
          
          {/* Header Title */}
          <div className="text-center space-y-2">
            {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
            <span className="text-[11px] font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block">
              Compatibility Check
            </span>
            {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug drop-shadow-sm px-2">
              Dial <span className="text-blue-600 font-semibold">*#06#</span> to check if your phone supports eSIM function before purchase
            </h2>
          </div>

          {/* Image Previews */}
          <div className="flex w-full items-center justify-center gap-4 sm:gap-6 px-2 flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-md flex items-center justify-center w-full max-w-[200px]">
                <img
                  src="/EID1.png"
                  alt="EID check example 1"
                  className="w-full h-auto max-h-32 object-contain"
                  onError={(e) => {
                    console.error('Failed to load image');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-md flex items-center justify-center w-full max-w-[200px]">
                <img
                  src="/EID2.png"
                  alt="EID check example 2"
                  className="w-full h-auto max-h-32 object-contain"
                  onError={(e) => {
                    console.error('Failed to load image');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-3.5 w-full text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
            <p className="text-xs sm:text-sm text-emerald-900 font-semibold">
              If EID barcode is displayed, your phone supports eSIM!
            </p>
          </div>

          {/* 🌟 [MOBILE BUTTON]: Mobile View တွင် ပေါ်မည့် Check My Phone Button */}
          <div className="w-full block md:hidden space-y-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="group relative w-full overflow-hidden rounded-[32px] shadow-xl hover:shadow-[0_20px_60px_rgba(59,130,246,0.4)] transition-all cursor-pointer border-none"
              onClick={handleCheckPhone}
            >
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-800 p-[3px]">
                <div className="absolute inset-[3px] rounded-[29px] bg-gradient-to-br from-cyan-200 via-blue-100 to-cyan-200" />
              </div>
              <div className="relative rounded-[29px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/10" />
                <div className="relative px-6 py-4 flex items-center justify-center gap-2">
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-blue-900" />
                  )}
                  {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
                  <span className="font-semibold text-base whitespace-nowrap bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 bg-clip-text text-transparent">
                    {copied ? 'Code Copied (*#06#)' : 'Check for I Phone'}
                  </span>
                </div>
              </div>
            </motion.button>

            {/* Quick Hint for Mobile */}
            {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
            <p className="text-[11px] text-slate-500 font-semibold text-center">
              💡 If dialer shows only <code className="font-semibold text-blue-600">*</code> or nothing, type <strong className="text-slate-800 font-semibold">*#06#</strong> manually in your Phone App.
            </p>
          </div>

          {/* 🌟 [WEB VIEW GUIDE]: Desktop / Web View လမ်းညွှန်ချက် */}
          <div className="hidden md:block w-full bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2">
            {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs uppercase tracking-wide">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>How to Check on Your Mobile Phone:</span>
            </div>
            <ol className="text-xs font-semibold text-slate-700 space-y-1.5 pl-5 list-decimal leading-relaxed">
              <li>Open your mobile phone's Phone / Dialer App.</li>
              <li>Type <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600 font-semibold">*#06#</code>.</li>
              <li>Check if the <strong className="text-slate-900 font-semibold">EID Barcode / Number</strong> appears on screen.</li>
            </ol>
          </div>

          {hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              /* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */
              className="text-xs text-blue-700 text-center font-semibold bg-blue-50 border border-blue-200/60 p-2.5 rounded-xl w-full"
            >
              {hint}
            </motion.p>
          )}

        </div>
      </motion.div>
    </div>
  );
}