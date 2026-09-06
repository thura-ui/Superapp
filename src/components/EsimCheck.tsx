import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Copy, Check, ChevronDown, X, AlertCircle } from 'lucide-react';

interface EsimCheckProps {
  onBack: () => void;
  onYes?: () => void;
}

const BRAND_DEVICES = [
  {
    brand: 'iPhone',
    models: [
      'iPhone 17e', 'iPhone Air', 'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17',
      'iPhone 16e', 'iPhone 16 Pro Max', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16',
      'iPhone 15 Pro Max', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14',
      'iPhone SE 3 (2022)', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 Mini', 'iPhone 13',
      'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 Mini', 'iPhone 12',
      'iPhone SE 2 (2020)', 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
      'iPhone XS Max', 'iPhone XS', 'iPhone XR'
    ],
    note: 'Important: Except for iPhone Air, all iPhone models sold in mainland China do not support eSIM, and only some iPhone models sold in Hong Kong and Macao support eSIMs. If you bought an iPhone in any of these countries, check if your iPhone is eSIM-compatible before installing an eSIM app.'
  },
  {
    brand: 'Samsung',
    models: [
      'Samsung Galaxy XCover7 Pro', 'Samsung Galaxy A56', 'Samsung Galaxy A55 5G', 'Samsung Galaxy A54 5G',
      'Samsung Galaxy A36', 'Samsung Galaxy A35 5G', 'Samsung Galaxy A23 5G', 'Samsung Galaxy Z Flip 7',
      'Samsung Galaxy Z Flip 6', 'Samsung Galaxy Z Flip 5', 'Samsung Galaxy Z Fold 7', 'Samsung Galaxy Z Fold 6',
      'Samsung Galaxy Z Fold 5', 'Samsung Galaxy Z Fold 3', 'Samsung Galaxy Z Fold', 'Samsung Galaxy S26',
      'Samsung Galaxy S26+', 'Samsung Galaxy S26 Ultra', 'Samsung Galaxy S25', 'Samsung Galaxy S25 Edge',
      'Samsung Galaxy S25+', 'Samsung Galaxy S25 FE', 'Samsung Galaxy S25 Ultra', 'Samsung Galaxy S25 Slim',
      'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24+', 'Samsung Galaxy S24 FE', 'Samsung Galaxy S24',
      'Samsung Galaxy S23 FE', 'Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23+', 'Samsung Galaxy S23',
      'Samsung Galaxy S22 Ultra', 'Samsung Galaxy S22+', 'Samsung Galaxy S22', 'Samsung Galaxy S21+ Ultra 5G',
      'Samsung Galaxy S21+ 5G', 'Samsung Galaxy S21 5G', 'Samsung Galaxy S20 Ultra 5G', 'Samsung Galaxy S20 Ultra',
      'Samsung Galaxy S20+ 5G', 'Samsung Galaxy S20+', 'Samsung Galaxy S20', 'Samsung Galaxy Z Fold5 5G',
      'Samsung Galaxy Z Fold 4', 'Samsung Galaxy Z Fold 3 5G', 'Samsung Galaxy Z Fold2 5G', 'Samsung Galaxy Fold',
      'Samsung Galaxy Z Flip5 5G', 'Samsung Galaxy Z Flip 4', 'Samsung Galaxy Z Flip 3 5G', 'Samsung Galaxy Z Flip',
      'Samsung Galaxy A54', 'Samsung Galaxy Note 20 Ultra 5G', 'Samsung Galaxy Note 20'
    ],
    note: 'Important: The following models are not eSIM-compatible: Galaxy S20 FE all models, Galaxy S21 FE all models, Galaxy S20/S21 (US), Galaxy Z Flip 5G (US), Note 20 Ultra (US & Hong Kong), Galaxy Z Fold 2 (US & Hong Kong).'
  },
  {
    brand: 'Google',
    models: [
      'Google Pixel 10 Pro XL', 'Google Pixel 10 Pro', 'Google Pixel 10', 'Google Pixel 9 Pro Fold',
      'Google Pixel 9 Pro XL', 'Google Pixel 9 Pro', 'Google Pixel 9', 'Google Pixel 9a', 'Google Pixel Fold',
      'Google Pixel 8 Pro', 'Google Pixel 8', 'Google Pixel 8a', 'Google Pixel 7 Pro', 'Google Pixel 7',
      'Google Pixel 7a', 'Google Pixel 6 Pro', 'Google Pixel 6a', 'Google Pixel 6', 'Google Pixel 5a',
      'Google Pixel 5', 'Google Pixel 4 XL', 'Google Pixel 4a', 'Google Pixel 4', 'Google Pixel 3a XL',
      'Google Pixel 3a', 'Google Pixel 3 XL', 'Google Pixel 3', 'Google Pixel 2 XL', 'Google Pixel 2'
    ],
    note: 'Important: The following models are not eSIM-compatible: Pixel 3 from Australia, Japan, and Taiwan, or from any US / Canadian carriers except Sprint and Google Fi; Pixel 3a from South East Asia, Japan, and Verizon US.'
  },
  {
    brand: 'Motorola',
    models: [
      'Motorola Razr (2025)', 'Motorola Razr+ (2025)', 'Motorola Razr Ultra (2025)', 'Motorola Razr+',
      'Motorola G52J 5G', 'Motorola G52J 5G Ⅱ', 'Motorola G53J 5G', 'Motorola Moto G (2025)',
      'Motorola Moto G34', 'Motorola Moto G35', 'Motorola Moto G53', 'Motorola Moto G54',
      'Motorola Moto G54 Power', 'Motorola Moto G55', 'Motorola Moto G75', 'Motorola Moto G84',
      'Motorola Moto G85', 'Motorola Moto G86', 'Motorola Moto G (2024)', 'Motorola Moto G Power (2024)',
      'Motorola Moto G Stylus 5G (2023)', 'Motorola Moto G Stylus 5G (2024)', 'Motorola Edge Fusion',
      'Motorola Edge 60', 'Motorola Edge 60 Pro', 'Motorola Edge 60 Fusion', 'Motorola Edge 60 Stylus',
      'Motorola Edge 50', 'Motorola Edge 50 Fusion', 'Motorola Edge 50 Pro', 'Motorola Edge 50 Neo',
      'Motorola Edge 50 Ultra', 'Motorola Edge 40 Neo', 'Motorola Edge 40 Pro', 'Motorola Edge 40',
      'Motorola Edge+', 'Motorola Edge+ (2023)', 'Motorola Edge (2024)', 'Motorola Edge (2023)',
      'Motorola Edge (2022)', 'Motorola Razr 40', 'Motorola Razr 40 Ultra', 'Motorola Razr 60',
      'Motorola Razr 50', 'Motorola Razr 50 Ultra', 'Motorola Razr 2024', 'Motorola Razr+ 2024',
      'Motorola Razr 2022', 'Motorola Razr 2019', 'Motorola Razr 5G', 'Motorola ThinkPhone 25'
    ]
  },
  {
    brand: 'Xiaomi',
    models: [
      'Xiaomi 15', 'Xiaomi 15 Ultra', 'Xiaomi 14', 'Xiaomi 14 Pro', 'Xiaomi 14T', 'Xiaomi 14T Pro',
      'Xiaomi 13T', 'Xiaomi 13T Pro', 'Xiaomi 13 Pro', 'Xiaomi 13 Lite', 'Xiaomi 13', 'Xiaomi 12T Pro',
      'Xiaomi Poco X7', 'Xiaomi Redmi Note 14 Pro', 'Xiaomi Redmi Note 14 Pro 5G', 'Xiaomi Redmi Note 14 Pro+',
      'Xiaomi Redmi Note 14 Pro+ 5G', 'Xiaomi Redmi Note 13 Pro', 'Xiaomi Redmi Note 13 Pro+', 'Xiaomi Redmi Note 11 Pro 5G'
    ]
  },
  {
    brand: 'OPPO',
    models: [
      'Oppo Find X3 Pro', 'Oppo Find N2 Flip', 'Oppo Find N5', 'Oppo Reno 5A', 'Oppo Reno 6 Pro 5G',
      'Oppo Reno 9A', 'Oppo Find X5', 'Oppo Find X5 Pro', 'Oppo A55s 5G', 'Oppo Find X8 Pro',
      'Oppo Find X8', 'Oppo Find X3', 'Oppo Reno14', 'Oppo Reno14 Pro'
    ]
  },
  {
    brand: 'Honor',
    models: [
      'Honor 400 Pro', 'Honor 400', 'Honor 400 Lite', 'Honor Magic7 Lite', 'Honor 50', 'Honor X8',
      'Honor 90', 'Honor Magic6 Pro', 'Honor Magic6 Pro RSR', 'Honor Magic5 Pro', 'Honor Magic4 Pro',
      'Honor 200 Pro', 'Honor 200', 'Honor Magic Vs3', 'Honor Magic V2', 'Honor Magic V3'
    ]
  },
  {
    brand: 'SONY',
    models: [
      'Sony Xperia 10 III Lite', 'Sony Xperia 10 VI', 'Sony Xperia 10 V', 'Sony Xperia 10 IV',
      'Sony Xperia 1 VI', 'Sony Xperia 1 V', 'Sony Xperia 1 IV', 'Sony Xperia 5 IV', 'Sony Xperia Ace III', 'Sony Xperia 5 V'
    ]
  },
  {
    brand: 'Huawei',
    models: ['Huawei Mate 40 Pro', 'Huawei P40 Pro', 'Huawei P40'],
    note: 'Important: The following models are not eSIM-compatible: The P40 Pro+ and P50 Pro.'
  },
  {
    brand: 'Vivo',
    models: ['Vivo X200 Pro', 'Vivo X200', 'Vivo X200s', 'Vivo X200 FE', 'Vivo X100 Pro', 'Vivo X90 Pro', 'Vivo V29', 'Vivo V29 Lite 5G', 'Vivo V40', 'Vivo V40 Lite', 'Vivo V50']
  },
  {
    brand: 'OnePlus',
    models: ['OnePlus Open', 'OnePlus 11', 'OnePlus 12', 'OnePlus 13', 'OnePlus 13R']
  },
  {
    brand: 'Sharp',
    models: ['Sharp AQUOS R10', 'Sharp AQUOS R9 Pro', 'Sharp AQUOS R9', 'Sharp AQUOS R8 Pro', 'Sharp AQUOS R8', 'Sharp AQUOS R7', 'Sharp Simple Sumaho 6', 'Sharp AQUOS zero6', 'Sharp AQUOS wish3', 'Sharp AQUOS wish 2 SHG08', 'Sharp AQUOS wish', 'Sharp AQUOS sense7 plus', 'Sharp AQUOS sense7', 'Sharp AQUOS sense6s', 'Sharp AQUOS sense4 lite', 'Sharp AQUOS sense9', 'Sharp AQUOS sense8']
  },
  {
    brand: 'Hammer',
    models: ['Hammer Explorer PRO', 'Hammer Blade 3', 'Hammer Blade 5G', 'Hammer myPhone NOW eSIM', 'Hammer myPhone Hammer Construction']
  },
  {
    brand: 'TCL',
    models: ['TCL 60', 'TCL 60 XE NxtPaper', 'TCL 50 5G', 'TCL 50 NxtPaper', 'TCL 50 Pro NxtPaper', 'TCL 40 XL']
  },
  {
    brand: 'Others',
    models: [
      'Nokia G60 5G', 'Nokia X30', 'Nokia XR21', 'Rakuten Big', 'Rakuten Big-S', 'Rakuten Mini',
      'Rakuten Hand', 'Rakuten Hand 5G', 'Nuu X5', 'Fairphone 4', 'Fairphone 5', 'T-Mobile Revvl 7',
      'T-Mobile Revvl 7 Pro', 'Gemini PDA 4G+Wi-Fi', 'Nothing Phone (3a) Pro', 'Realme 14 Pro+',
      'ASUS Zenfone 12 Ultra', 'ZTE nubia Flip2', 'Alcatel V3 Ultra', 'Trump Mobile T1'
    ]
  }
];

export default function EsimCheck({ onBack, onYes }: EsimCheckProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openBrand, setOpenBrand] = useState<string | null>(null);

  // Auto-typing Effect Logic
  const [typedCode, setTypedCode] = useState('');
  const fullCode = '*#06#';

  useEffect(() => {
    let index = 0;
    setTypedCode('');
    
    const interval = setInterval(() => {
      if (index <= fullCode.length) {
        setTypedCode(fullCode.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const handleCheckPhone = () => {
    window.location.href = 'tel:*%2306%23';
    setHint('Opening Phone App with *#06#...');
    if (onYes) onYes();
  };

  const toggleBrand = (brandName: string) => {
    setOpenBrand(prev => prev === brandName ? null : brandName);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBack) {
      onBack();
    }
  };

  const modalContent = (
    <div className="mobile-typography-fix relative font-['Poppins']">
      
      {/* 📱 MOBILE VIEW */}
      <div className="block md:hidden fixed inset-0 z-[99999] flex items-center justify-center p-4">
        
        {/* Backdrop (နောက်ခံနှိပ်ပါကလည်း Help Center သို့ ပြန်ရောက်မည်) */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={handleBackClick}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-[90vw] max-w-[340px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-500/30" />
          <div className="absolute inset-0 bg-white/50" />

        <div className="relative bg-white/95 backdrop-blur-xl border border-white/80 p-3.5 flex flex-col items-center gap-2.5">
            
            {/* Header / Back Button Bar */}
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleBackClick}
                type="button"
                className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Go back to Help Center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <span className="text-[9px] font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 inline-block">
                Compatibility Check
              </span>

              <div className="w-6" />
            </div>

            <div className="text-center">
              <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 leading-tight px-1 m-0">
                Dial <span className="text-blue-600 font-bold tracking-wider inline-block min-w-[40px] text-left">{typedCode}<span className="animate-pulse">|</span></span> to check if your phone supports eSIM function before purchase
              </h4>
            </div>

            {/* 🔴 ပုံ Size ကို ပိုမိုကြီးမားစွာ (max-h-48 သို့မဟုတ် max-h-52) ပြင်ဆင်ထားပါသည် 🔴 */}
            <div className="w-full my-1 flex items-center justify-center">
              <img 
                src="/noBG02.png" 
                alt="EID check example" 
                className="w-full h-auto max-h-48 sm:max-h-52 object-contain drop-shadow-md transition-transform hover:scale-105" 
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-2 w-full text-center flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <p className="text-[9px] sm:text-[10px] text-emerald-900 font-semibold leading-tight m-0">
                If EID barcode is displayed, your phone supports eSIM!
              </p>
            </div>

            <div className="w-full space-y-1 pt-0.5">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="group relative w-full overflow-hidden rounded-full shadow-md transition-all cursor-pointer border-none p-0"
                onClick={handleCheckPhone}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-800 p-[2px]">
                  <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-cyan-200 via-blue-100 to-cyan-200" />
                </div>
                <div className="relative rounded-full overflow-hidden px-3 py-2 flex items-center justify-center gap-2">
                  <span className="font-semibold text-[11px] sm:text-xs whitespace-nowrap bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 bg-clip-text text-transparent">
                    Open Phone App (*#06#)
                  </span>
                </div>
              </motion.button>
              <p className="text-[8.5px] text-slate-500 font-semibold text-center m-0">
                💡 Tap to automatically open Phone App with <strong className="text-slate-800 font-semibold">*#06#</strong> typed.
              </p>
            </div>

            {hint && (
              <p className="text-[9px] text-blue-700 text-center font-semibold bg-blue-50 border border-blue-200/60 p-1.5 rounded-lg w-full m-0">
                {hint}
              </p>
            )}

          </div>

        </motion.div>
      </div>

      {/* 🖥️ WEB VIEW SIDE DRAWER MODAL */}
      <div className="hidden md:block fixed inset-0 z-[99999] overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackClick}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />

        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        >
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden border-l border-slate-100">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                eSIM Compatible Devices
              </h3>
              <button 
                onClick={handleBackClick}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide text-left">
              
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-slate-700 leading-relaxed">
                  Open the dialing interface of your phone and enter the code:
                </p>

                <div className="flex items-center justify-center gap-2 py-1">
                  <span className="text-2xl font-black text-blue-600 tracking-widest min-w-[90px] text-center">
                    {typedCode}<span className="animate-pulse">|</span>
                  </span>
                  <button 
                    onClick={handleCopyCode}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[12px] font-medium text-slate-600 leading-normal text-center">
                  If <strong className="text-slate-900 font-semibold">EID</strong> information is displayed, it means eSIM is supported; otherwise, it is not supported.
                </p>

                <p className="text-[11px] font-semibold text-slate-400 text-center">
                  * Please check "EID", not IMEI, IMEI2, Or MEID.
                </p>
              </div>

              <div className="w-full flex items-center justify-center py-4">
                <img 
                  src="/noBG02.png" 
                  alt="EID Barcode Display Example" 
                  className="w-full max-w-[340px] h-auto max-h-72 object-contain drop-shadow-md transition-transform hover:scale-105" 
                />
              </div>

              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[12px] font-semibold text-slate-400 absolute">
                  Or
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-slate-800">
                  Check the device list below for eSIM support:
                </p>

                <div className="space-y-2">
                  {BRAND_DEVICES.map((brandGroup) => {
                    const isOpen = openBrand === brandGroup.brand;

                    return (
                      <div 
                        key={brandGroup.brand}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleBrand(brandGroup.brand)}
                          className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-slate-50 text-left transition-colors border-none cursor-pointer"
                        >
                          <span className="text-[13px] font-semibold text-slate-800">
                            {brandGroup.brand}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-slate-50/60 border-t border-slate-100"
                            >
                              <div className="p-4 space-y-3 text-left">
                                <ul className="space-y-1.5 text-[12px] font-medium text-slate-700 list-disc pl-4">
                                  {brandGroup.models.map((model, idx) => (
                                    <li key={idx} className="leading-tight">
                                      {model}
                                    </li>
                                  ))}
                                </ul>

                                {brandGroup.note && (
                                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] font-medium text-amber-900 leading-relaxed flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <span>{brandGroup.note}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>

    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}