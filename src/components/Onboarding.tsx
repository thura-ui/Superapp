import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onLogin: () => void;
  onSignUp: () => void;
  onSkip: () => void;
}

export default function Onboarding({ onLogin, onSignUp, onSkip }: OnboardingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] flex flex-col items-center justify-between p-6 overflow-hidden relative">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[70%] aspect-square bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] aspect-square bg-teal-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center flex-1 py-10">
        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-cyan-300 text-xs sm:text-sm font-black tracking-[0.4em] uppercase opacity-60 mb-2">Adventure Awaits</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Simless <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">eSIM</span>
          </h1>
        </motion.div>

        {/* eSIM Support Section - Euro Gray Wet Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full relative overflow-hidden rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center mb-12 border border-white/20"
        >
          {/* Glass Backdrop */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />
          
          {/* Raindrop & Wipe Texture */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0.5px, transparent 2px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 1px, transparent 3px)`,
              backgroundSize: '100px 100px',
              maskImage: 'radial-gradient(circle at center, transparent 40%, black 90%)',
              WebkitMaskImage: 'radial-gradient(circle at center, transparent 40%, black 90%)',
            }}
          />

          <div className="relative z-10 w-full">
            <div className="relative mb-8 flex justify-center">
              <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full scale-150" />
              <div className="relative w-20 h-20 bg-white/10 backdrop-blur-md rounded-[28px] flex items-center justify-center shadow-xl border border-white/20 rotate-3 group hover:rotate-0 transition-transform duration-500">
                <Smartphone className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight">Your eSIM Support</h2>
            <p className="text-sm text-cyan-100/70 text-center leading-relaxed tracking-tight font-bold mb-8 max-w-[280px] mx-auto">
            Dial <span className="text-cyan-300">*#06#</span> to check compatibility. If an EID appears, you're ready for global data.
            </p>

            <div className="space-y-4 w-full text-left">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-[22px] border border-white/10">
                <div className="w-8 h-8 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-400/30">
                  <CheckCircle className="w-5 h-5 text-teal-300" />
                </div>
                <span className="text-xs font-black text-white/90 uppercase tracking-widest">Instant Activation</span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-[22px] border border-white/10">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
                  <CheckCircle className="w-5 h-5 text-cyan-300" />
                </div>
                <span className="text-xs font-black text-white/90 uppercase tracking-widest">No Physical SIM</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons - Crystal Glass Styles */}
        <div className="w-full space-y-4 relative z-10">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            className="w-full relative overflow-hidden py-5 rounded-[24px] shadow-2xl transition-all group border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/80 to-cyan-600/80 backdrop-blur-md group-hover:from-teal-500 group-hover:to-cyan-500 transition-all" />
            <div className="relative flex items-center justify-center gap-3 text-white font-black text-lg uppercase tracking-widest">
              Log In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onSignUp}
            className="w-full relative overflow-hidden py-5 rounded-[24px] shadow-xl transition-all border border-white/20 group"
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-md group-hover:bg-white/10 transition-all" />
            <span className="relative text-white font-black text-lg uppercase tracking-widest">
              Sign Up
            </span>
          </motion.button>
        </div>

        {/* Skip Link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onSkip}
          className="mt-10 text-cyan-300/40 hover:text-cyan-300 font-black text-[10px] tracking-[0.4em] uppercase transition-colors flex items-center gap-1"
        >
          Skip For Now
        </motion.button>
      </div>
    </div>
  );
}
