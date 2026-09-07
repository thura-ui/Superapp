import { Zap, AlertCircle, Coins, Calendar, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SparkInfoBox() {
  const { t, i18n } = useTranslation();
  const isMyanmar = i18n.language === 'my';

  return (
    <div className="bg-cyan-50/60 backdrop-blur-md border border-cyan-100/80 rounded-3xl p-5 md:p-7 shadow-xs space-y-4 font-['Poppins']">
      
      {/* Box Header */}
      <div className="flex items-center gap-2.5 border-b border-cyan-100/80 pb-3.5">
        <div className="w-8 h-8 rounded-xl bg-cyan-50/80 border border-cyan-100 flex items-center justify-center shrink-0 shadow-xs">
          <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight font-['Poppins']">
            {isMyanmar ? 'Spark ဆိုတာဘာလဲ။' : 'What is Spark?'}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold font-['Poppins']">
            {isMyanmar ? 'Simless Reward Points စနစ်' : 'Simless Loyalty Reward Points'}
          </p>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-['Poppins']">
        
        {/* Conversion Rate Box */}
        <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 bg-cyan-50/80 rounded-xl flex items-center justify-center border border-cyan-100 shrink-0 shadow-xs mt-0.5">
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-xs sm:text-[13px]">
              {isMyanmar ? 'တန်ဖိုးနှင့် ရရှိနိုင်မှု' : 'Conversion Rate & Earning'}
            </p>
            <p className="text-blue-600 font-bold text-xs sm:text-[13px]">
              1 Spark = 450 MMK
            </p>
            <p className="text-slate-600 font-medium text-[11px] sm:text-xs leading-relaxed">
              {isMyanmar 
                ? '၄,၀၀၀ ကျပ်ဖိုး ဝယ်ယူတိုင်း ၁ Spark ရရှိမည်ဖြစ်ပါသည်။' 
                : 'Every 4,000 MMK spent earns 1 Spark.'}
            </p>
          </div>
        </div>

        {/* Redemption Usage Box */}
        <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-50/80 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0 shadow-xs mt-0.5">
            <Gift className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-xs sm:text-[13px]">
              {isMyanmar ? 'အသုံးပြုပုံ' : 'How to Use'}
            </p>
            <p className="text-slate-600 font-medium text-[11px] sm:text-xs leading-relaxed pt-0.5">
              {isMyanmar 
                ? 'ရရှိထားသော Spark များကို Data Packages များ ဝယ်ယူရာတွင် တိုက်ရိုက် လဲလှယ်သုံးစွဲနိုင်ပါသည်။' 
                : 'Earned Sparks can be directly used to redeem Data Packages.'}
            </p>
          </div>
        </div>

      </div>

      {/* Expiry Warning Notice Box */}
      <div className="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-2xl p-4 shadow-xs flex items-start gap-3 text-xs font-['Poppins']">
        <div className="w-8 h-8 bg-amber-50/80 rounded-xl flex items-center justify-center border border-amber-200 shrink-0 shadow-xs mt-0.5">
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="space-y-2 text-[11px] sm:text-xs min-w-0 flex-1">
          <p className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            {isMyanmar ? 'သတိပြုရန် - Spark သက်တမ်း' : 'Important Expiry Notice'}
          </p>

          <p className="text-slate-700 font-semibold leading-relaxed">
            {isMyanmar 
              ? 'Spark များကို ၁ နှစ်တာ သက်တမ်း ပေးထားပါသည်။ ဝယ်ယူရရှိခဲ့သည့် သက္ကရာဇ်နှစ်အလိုက် နောက်တစ်နှစ် ဇန်နဝါရီ ၁ ရက်နေ့တွင် Spark များ သက်တမ်းကုန်ဆုံးမည် ဖြစ်ပါသည်။' 
              : 'Sparks are valid for 1 year. All Sparks earned within a calendar year expire on January 1st of the following year.'}
          </p>

          <div className="p-3 bg-cyan-50/50 border border-cyan-100/80 rounded-xl text-[10.5px] sm:text-[11px] text-slate-600 font-medium leading-relaxed">
            <strong className="text-blue-600 font-bold">{isMyanmar ? 'ဥပမာ - ' : 'Example: '}</strong>
            {isMyanmar 
              ? '၂၀၂၅-၁-၁ ရက်နေ့တွင် ဝယ်ယူရရှိခဲ့သော Spark များသည် ၂၀၂၆-၁-၁ ရက်နေ့တွင် သက်တမ်းကုန်ဆုံးမည်ဖြစ်သလို၊ ၂၀၂၅-၁၀-၁၀ ရက်နေ့က ဝယ်ယူခဲ့သော Spark များသည်လည်း ၂၀၂၆-၁-၁ ရက်နေ့တွင် သက်တမ်းကုန်ဆုံးမည် ဖြစ်ပါသည်။' 
              : 'Sparks earned on 2025-01-01 will expire on 2026-01-01, and Sparks earned on 2025-10-10 will also expire on 2026-01-01.'}
          </div>
        </div>
      </div>

    </div>
  );
}