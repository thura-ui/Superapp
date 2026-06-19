import { motion } from 'framer-motion';

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-teal-400/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-10 relative z-10">
        <motion.div
          className="w-64 h-64 rounded-full p-[4px] flex items-center justify-center relative shadow-[0_0_50px_rgba(34,211,238,0.2)]"
          style={{
            background:
              'conic-gradient(from 0deg, #2dd4bf, #06b6d4, #0891b2, #0e7490, #2dd4bf)'
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        >
          <motion.div
            className="w-full h-full rounded-full bg-white/10 backdrop-blur-3xl flex items-center justify-center border border-white/20 shadow-2xl relative overflow-hidden"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          >
            {/* Reflection Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            
            <img
              src="/s_i_m_l_e_s_s-removebg.png"
              alt="Simless Logo"
              className="w-44 h-44 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            />
          </motion.div>
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <motion.h1
            className="text-3xl font-black tracking-[0.3em] uppercase bg-gradient-to-r from-teal-200 via-cyan-100 to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Simless
          </motion.h1>
          <motion.p
            className="text-cyan-200/50 font-black text-xs tracking-[0.5em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Travel eSIM
          </motion.p>
        </div>
      </div>
    </div>
  );
}
