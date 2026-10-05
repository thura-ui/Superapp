import { useState } from 'react';
import { Globe, DollarSign, Briefcase, Code, Plane, Users, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_PRODUCTS_API_BASE_URL;

export default function PartnerPage() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    partner_category: 'travel_agency',
    partner_category_other: '',
    org_name: '',
    org_website: '',
    primary_region: '',
    full_name: '',
    job_title: '',
    work_email: '',
    phone_number: '',
    requirements: ''
  });

  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE}/partnership/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partner_category: form.partner_category,
          partner_category_other: form.partner_category === 'Other' ? form.partner_category_other : null,
          org_name: form.org_name,
          org_website: form.org_website || null,
          primary_region: form.primary_region || null,
          full_name: form.full_name,
          job_title: form.job_title || null,
          work_email: form.work_email.trim().toLowerCase(),
          phone_number: form.phone_number,
          requirements: form.requirements || null
        })
      });

      const resResult = await response.json();

      if (!response.ok) {
        throw new Error(resResult.error || resResult.message || t('errValidation'));
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Partnership onboarding capture failed:', err);
      setApiError(err.message || t('errSomethingWentWrong'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-20 sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50/20 min-h-screen selection:bg-blue-500/10 font-['Poppins'] text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-1.5 tracking-tight font-['Poppins']">
            {t('partnerHeaderTitle')}
          </h1>
          <p className="text-slate-500 text-[12px] sm:text-sm font-semibold uppercase tracking-wider font-['Poppins']">
            {t('partnerHeaderSubtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column Container */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* 🌟 BECOME A PARTNER SECTION 🌟 */}
            <section className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-[0_18px_50px_rgba(15,23,42,0.02)] space-y-4">
              <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight font-['Poppins']">
                {t('becomePartnerTitle')}
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-full sm:w-2/5 flex justify-center items-center">
                  <img 
                    src="/Become-a-Partener.png" 
                    alt="Become a Partner" 
                    className="w-full max-w-[260px] h-auto object-contain drop-shadow-md"
                  />
                </div>

                <div className="w-full sm:w-3/5 space-y-3">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3.5 text-white shadow-md">
                    <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block font-['Poppins']">Partner Ecosystem</span>
                    <p className="text-[11px] sm:text-xs text-blue-100 mt-0.5 font-['Poppins']">
                      Global Mobile Connectivity Ecosystem designed for scalable digital expansion.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { icon: Plane, title: t('travelAgencies'), desc: t('travelAgenciesDesc') },
                      { icon: Code, title: t('techPlatforms'), desc: t('techPlatformsDesc') },
                      { icon: Briefcase, title: t('corporateTravel'), desc: t('corporateTravelDesc') },
                      { icon: Users, title: t('contentCreators'), desc: t('contentCreatorsDesc') },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-start text-left gap-1 p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm font-['Poppins']">
                        <div className="w-7 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100/60 shrink-0">
                          <item.icon className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <p className="text-slate-900 font-bold text-[11.5px] tracking-tight font-['Poppins']">{item.title}</p>
                        <p className="text-slate-500 text-[10px] font-medium leading-tight font-['Poppins']">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 🌟 KEY PARTNER BENEFITS SECTION (STRICT HEIGHT - NO BLANK SPACES) 🌟 */}
            <section className="relative bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[28px] p-4 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.02)] font-['Poppins'] overflow-hidden">
              
              {/* Desktop Image (Absolute Position ဖြင့် ထားသဖြင့် အပေါ်/အောက် Height ကို လုံးဝ ဆွဲမဆန့်တော့ပါ) */}
              <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-full items-center justify-end pointer-events-none z-0 pr-4 sm:pr-6">
                <img 
                  src="/partner-benefits.png" 
                  alt="Partner Benefits" 
                  className="w-full max-w-[360px] h-auto object-contain drop-shadow-md scale-110 origin-right"
                />
              </div>

              {/* ဘယ်ဘက် စာသားနှင့် ကတ်များ (ဤအရာကသာ အပြင်ဘောင်၏ Height ကို အတိအကျ သတ်မှတ်ပေးပါမည်) */}
              <div className="relative z-10 w-full md:w-[55%] flex flex-col">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight mb-3 text-left font-['Poppins']">
                  {t('partnerBenefitsTitle')}
                </h2>
                
                <div className="flex flex-col gap-3">
                  {[
                    { icon: DollarSign, title: t('lucrativeCommissions'), desc: t('lucrativeCommissionsDesc') },
                    { icon: Globe, title: t('globalReach'), desc: t('globalReachDesc') },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 p-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-blue-200">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/60 shrink-0">
                        <item.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-slate-900 font-bold text-[13.5px] tracking-tight font-['Poppins']">{item.title}</p>
                        <p className="text-slate-500 text-[11px] font-medium mt-0.5 leading-snug font-['Poppins']">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Image (ဖုန်း View အတွက်) */}
              <div className="md:hidden flex justify-center w-full mt-3 -mb-4 pointer-events-none relative z-0">
                <img 
                  src="/partner-benefits.png" 
                  alt="Partner Benefits" 
                  className="w-full max-w-[280px] h-auto object-contain drop-shadow-md"
                />
              </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-[0_18px_50px_rgba(15,23,42,0.02)]">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 tracking-tight font-['Poppins']">{t('howItWorksTitle')}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1 font-['Poppins']">
                {[
                  { num: '1', title: t('registerProfile'), desc: t('registerProfileDesc') },
                  { num: '2', title: t('getAccess'), desc: t('getAccessDesc') },
                  { num: '3', title: t('startEarning'), desc: t('startEarningDesc') },
                ].map((step) => (
                  <div key={step.num} className="flex items-center gap-3">
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm font-['Poppins']">{step.num}</span>
                      </div>
                      <p className="text-slate-900 font-bold text-[12.5px] mt-0.5 font-['Poppins']">{step.title}</p>
                      <p className="text-slate-500 text-[10.5px] font-medium max-w-[130px] leading-snug font-['Poppins']">{step.desc}</p>
                    </div>
                    <span className="text-slate-300 text-base hidden sm:block mx-3 font-semibold">{'>'}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column Container - Contact Form */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-100 sticky top-24 shadow-[0_20px_50px_rgba(15,23,42,0.03)] space-y-4 font-['Poppins']">
              <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2.5 font-['Poppins']">{t('getInTouch')}</h3>

              {apiError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-[13px] font-semibold rounded-xl border border-rose-100 leading-normal text-center font-['Poppins']">
                  {apiError}
                </div>
              )}

              {submitted ? (
                <div className="text-center py-10 space-y-3 font-['Poppins']">
                  <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-slate-900 font-bold text-sm tracking-tight font-['Poppins']">{t('inquiryReceived')}</p>
                  <p className="text-slate-500 text-[13px] font-medium px-4 leading-relaxed font-['Poppins']">
                    {t('inquiryReceivedDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5 font-['Poppins']">
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder={t('phFullName')}
                      value={form.full_name}
                      onChange={e => setForm({ ...form, full_name: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors font-['Poppins']"
                    />
                    <input
                      type="text"
                      placeholder={t('phJobTitle')}
                      value={form.job_title}
                      onChange={e => setForm({ ...form, job_title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors font-['Poppins']"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder={t('phWorkEmail')}
                    value={form.work_email}
                    onChange={e => setForm({ ...form, work_email: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors font-['Poppins']"
                  />

                  <input
                    type="tel"
                    placeholder={t('phPhoneNumber')}
                    value={form.phone_number}
                    onChange={e => setForm({ ...form, phone_number: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors font-['Poppins']"
                  />

                  <input
                    type="text"
                    placeholder={t('phOrgName')}
                    value={form.org_name}
                    onChange={e => setForm({ ...form, org_name: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors font-['Poppins']"
                  />

                  <input
                    type="url"
                    placeholder={t('phOrgWebsite')}
                    value={form.org_website}
                    onChange={e => setForm({ ...form, org_website: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors font-['Poppins']"
                  />

                  <input
                    type="text"
                    placeholder={t('phPrimaryRegion')}
                    value={form.primary_region}
                    onChange={e => setForm({ ...form, primary_region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors font-['Poppins']"
                  />

                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={form.partner_category}
                      onChange={e => setForm({ ...form, partner_category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors appearance-none cursor-pointer font-['Poppins']"
                    >
                      <option value="travel_agency">{t('optTravelAgency')}</option>
                      <option value="tech_platform">{t('optTechPlatform')}</option>
                      <option value="corporate">{t('optCorporate')}</option>
                      <option value="creator">{t('optCreator')}</option>
                      <option value="Other">{t('optOther')}</option>
                    </select>

                    {form.partner_category === 'Other' && (
                      <input
                        type="text"
                        placeholder={t('phSpecifyCategory')}
                        value={form.partner_category_other}
                        onChange={e => setForm({ ...form, partner_category_other: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors animate-in fade-in duration-150 font-['Poppins']"
                      />
                    )}
                  </div>

                  <textarea
                    placeholder={t('phRequirements')}
                    value={form.requirements}
                    onChange={e => setForm({ ...form, requirements: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] transition-colors resize-none font-['Poppins']"
                  />

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] uppercase tracking-wider rounded-xl shadow-md disabled:opacity-40 transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer font-['Poppins']"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {t('btnSubmitting')}
                      </>
                    ) : (
                      t('btnSubmit')
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}