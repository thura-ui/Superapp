import { motion } from 'framer-motion';

interface NoEsimSupportProps {
  onBack: () => void;
  onOrderSim: () => void;
}

export default function NoEsimSupport({ onBack, onOrderSim }: NoEsimSupportProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-6 py-8 overflow-hidden font-sans bg-gradient-to-br from-gray-50 via-white to-gray-100">

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="absolute left-6 top-6 z-20 w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-lg text-gray-700 transition-all hover:bg-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="sadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
              <filter id="shadowFilter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="120"
              cy="120"
              r="100"
              fill="url(#sadGradient)"
              filter="url(#shadowFilter)"
            />

            <ellipse
              cx="85"
              cy="100"
              rx="12"
              ry="20"
              fill="#8B4513"
              opacity="0.9"
            />
            <ellipse
              cx="155"
              cy="100"
              rx="12"
              ry="20"
              fill="#8B4513"
              opacity="0.9"
            />

            <path
              d="M 70 160 Q 120 140 170 160"
              stroke="#8B4513"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />

            <path
              d="M 75 88 Q 78 82 85 85"
              stroke="#8B4513"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 165 88 Q 162 82 155 85"
              stroke="#8B4513"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
          </svg>

          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full opacity-70"></div>
          </motion.div>
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 ml-4"
          >
            <div className="w-2 h-2 bg-blue-300 rounded-full opacity-50"></div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            Oops! Your mobile doesn't<br />support eSIM
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            But would you like to buy an eSIM for your friends or your loved ones as well?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-4"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onOrderSim}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B4A] to-[#FF8A6B] rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl hover:from-[#FF7B5A] hover:to-[#FF9A7B] border-2 border-[#FF6B4A] transition-all"
          >
            Sure, I'll order a SIM
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="w-full py-4 bg-white border-2 border-cyan-400 rounded-full text-cyan-600 font-bold text-lg shadow-sm hover:bg-cyan-50 hover:border-cyan-500 transition-all"
          >
            No, I'll order a SIM
          </motion.button>
        </motion.div>
      </div>

      <div className="text-xs text-gray-500 font-semibold mt-8">
        Simless Travel eSIM
      </div>
    </div>
  );
}
