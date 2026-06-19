import { useState } from 'react';
import { motion } from 'framer-motion';

interface EsimCheckProps {
  onBack: () => void;
  onYes?: () => void;
  onNoSupport?: () => void;
}

export default function EsimCheck({ onBack, onYes, onNoSupport }: EsimCheckProps) {
  const [hint, setHint] = useState<string | null>(null);

  const handleYes = () => {
    setHint(null);
    if (onYes) {
      onYes();
    } else {
      onBack();
    }
  };

  const handleNoSupport = () => {
    if (onNoSupport) {
      onNoSupport();
    } else {
      setHint('Looks like your phone might not support eSIM yet. Check the manufacturer website for more info.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-4 py-8 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px] rounded-[40px] shadow-2xl overflow-hidden mt-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-500/30" />
        <div className="absolute inset-0 bg-white/40" />

        <div className="relative bg-white/80 backdrop-blur-2xl border-2 border-white/70 p-6 sm:p-8 flex flex-col items-center gap-6 sm:gap-8">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="absolute left-4 top-4 z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-lg text-blue-600 transition-all hover:bg-white/80 hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </motion.button>
          <h2 className="text-base sm:text-lg font-black text-gray-900 text-center leading-tight drop-shadow-sm px-2 pt-12">
            Dial <span className="text-base sm:text-lg font-black text-gray-900">*#06#</span> to check if your phone supports eSIM function before you purchase
          </h2>

          <div className="flex w-full items-center justify-center gap-6 px-2 sm:px-4 flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 flex items-center justify-center py-1">
              <div className="bg-white rounded-lg p-3 shadow-md flex items-center justify-center w-full max-w-[200px]">
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

            <div className="w-full sm:w-1/2 flex items-center justify-center py-1">
              <div className="bg-white rounded-lg p-3 shadow-md flex items-center justify-center w-full max-w-[200px]">
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

          <p className="w-full text-center text-sm text-gray-600 font-medium mt-3">
            If EID barcode is displayed, your phone supports eSIM
          </p>

          <div className="w-full flex flex-col gap-4">
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="group relative w-full overflow-hidden rounded-[32px] shadow-xl hover:shadow-[0_20px_60px_rgba(59,130,246,0.4)] transition-all"
              onClick={handleYes}
            >
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-800 p-[4px]">
                <div className="absolute inset-[4px] rounded-[28px] bg-gradient-to-br from-cyan-200 via-blue-100 to-cyan-200" />
              </div>
              <div className="relative rounded-[28px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/10" />
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
                <div className="absolute inset-0 shadow-[inset_0_2px_20px_rgba(255,255,255,0.5)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative px-8 py-5">
                  <span className="font-black text-sm sm:text-lg whitespace-nowrap bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 bg-clip-text text-transparent drop-shadow-sm">
                    Yes, phone supports eSIM
                  </span>
                </div>
              </div>
            </motion.button>
          </div>

          {hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600 text-center font-bold"
            >
              {hint}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
