import React, { useState } from 'react';
import { FileText, ShieldCheck, ChevronRight, ArrowLeft, Scale, AlertCircle } from 'lucide-react';

interface TermsConditionsProps {
  onBack?: () => void;
}

export default function TermsConditions({ onBack }: TermsConditionsProps) {
  const [activeSection, setActiveSection] = useState<string>('all');

  const sections = [
    { id: 'section-1', title: '1. Your Agreement with Us' },
    { id: 'section-2', title: '2. Acceptance of Agreement' },
    { id: 'section-3', title: '3. Changes to the Agreement' },
    { id: 'section-4', title: '4. Software License' },
    { id: 'section-5', title: '5. Use of Software & Services' },
    { id: 'section-6', title: '6. User Obligations' },
    { id: 'section-7', title: '7. Intellectual Property' },
    { id: 'section-8', title: '8. Fees & Rates' },
    { id: 'section-9', title: '9. Payments' },
    { id: 'section-10', title: '10. Refund Policy' },
    { id: 'section-11', title: '11. Termination' },
    { id: 'section-12', title: '12. Warranty & Liability' },
    { id: 'section-13', title: '13. Privacy & Contact' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    /* Top Navigation Bar နှင့် လွတ်စေရန် pt-24 sm:pt-28 ကို သတ်မှတ်ပေးထားပါသည် */
    <div className="w-full min-h-screen bg-slate-50/50 pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-['Poppins'] text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden text-left">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          {onBack && (
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider">
              Legal Terms
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            SIMLESS TRAVEL E-SIM Terms & Conditions
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Dear users, welcome to read the “SIMLESS TRAVEL E-SIM Service Terms” (hereinafter referred to as “these Terms”). Please review these conditions carefully before using our software or services.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Quick Navigation Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 text-left">
              Table of Contents
            </h3>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  activeSection === sec.id 
                    ? 'bg-blue-50 text-blue-600 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{sec.title}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
              </button>
            ))}
          </div>

          {/* Main Content Body */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-10 text-left text-xs sm:text-sm text-slate-700 leading-relaxed">
            
            {/* Alert Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Important Notice</p>
                <p>IF YOU DO NOT MEET THE LEGAL AGE OR LEGAL QUALIFICATIONS IN YOUR COUNTRY, YOU MUST NOT ACCEPT THESE TERMS OR USE OUR SERVICES.</p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="section-1" className="space-y-4 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                1. Your Agreement with Us
              </h2>
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">1.1 Definitions</h3>
                <ul className="space-y-2 pl-2 border-l-2 border-blue-500/20 text-slate-600">
                  <li><strong>“SIMLESS TRAVEL E-SIM”</strong> refers to the mobile/mini-program operated by WEITAIGE TECHNOLOGY CO., LIMITED to provide convenient communication and related services for outbound tourists.</li>
                  <li><strong>“SIMLESS TRAVEL E-SIM Software”</strong> refers to the internet communication software application of SIMLESS TRAVEL E-SIM or other software applications under the brand.</li>
                  <li><strong>“Update”</strong> refers to the improvement, modification, enhancement, correction, update, or upgrade of the software.</li>
                  <li><strong>“SIMLESS TRAVEL E-SIM Services”</strong> refers to the general term for free products and paid services.</li>
                  <li><strong>“SIMLESS TRAVEL E-SIM Website”</strong> refers to <a href="https://simless-mm.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://simless-mm.com/</a>.</li>
                  <li><strong>“You” or “Your”</strong> refers to the registered user account holder and authorized recipient.</li>
                  <li><strong>“We” or “Our”</strong> refers to the “SIMLESS TRAVEL E-SIM” brand.</li>
                </ul>
                <p className="pt-2">Your agreement with us consists of the provisions and rules described in these Terms, whether in paper or electronic form. Additional service terms and policies (including the Privacy Policy) constitute part of these Terms.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                2. Acceptance of Agreement
              </h2>
              <p>You must accept these Terms in order to download and/or use SIMLESS TRAVEL E-SIM’s software, services, and/or website. Please read all terms carefully and seek legal advice if needed. Downloading or using SIMLESS TRAVEL E-SIM implies acceptance of these Terms.</p>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                3. Changes to the Agreement
              </h2>
              <p>We may update these Terms from time to time. Continued use of SIMLESS TRAVEL E-SIM following any updates constitutes your agreement and acceptance of the revised Terms.</p>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                4. Software License & Restrictions
              </h2>
              <p>You are granted a limited, non-exclusive, non-transferable, revocable license to download and use SIMLESS TRAVEL E-SIM software strictly for personal use.</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                <p className="font-bold text-slate-800">License Restrictions:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>No sublicensing, resale, or commercial redistribution.</li>
                  <li>No reverse engineering, decompiling, hacking, or modification.</li>
                  <li>No removal of copyright or proprietary notices.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                5. Use of Software and Services
              </h2>
              <p>You are responsible for internet access, compatible devices, and all necessary equipment required to run the application. SIMLESS TRAVEL E-SIM may perform updates, maintenance, or temporary service suspensions without prior liability.</p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                6. User Obligations
              </h2>
              <p>You are responsible for safeguarding your account credentials and all activities occurring under your account. Prohibited uses include unlawful activity, spam, harassment, data scraping, malware, impersonation, and content harmful to minors.</p>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                7. Ownership & Intellectual Property
              </h2>
              <p>All SIMLESS TRAVEL E-SIM software, services, trademarks, and content (excluding user-submitted content) are exclusively owned by us and protected by applicable international intellectual property laws.</p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                8. Fees
              </h2>
              <p>Fees for paid products are disclosed before purchase and may change at our discretion. Taxes are not included unless stated otherwise.</p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                9. Payments
              </h2>
              <p>Payments may be securely processed through Stripe or other approved payment integration channels provided by SIMLESS TRAVEL E-SIM.</p>
            </section>

            {/* Section 10 */}
            <section id="section-10" className="space-y-3 pt-2 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                10. Refund Policy
              </h2>
              <p className="text-slate-700">Refunds are strictly available <strong>only before activation</strong> of paid products, subject to the conditions specified in these Terms and verification by support.</p>
            </section>

            {/* Section 11 */}
            <section id="section-11" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                11. Termination
              </h2>
              <p>We reserve the right to suspend or terminate your account at any time for violations, fraud, regulatory requirements, or service discontinuation.</p>
            </section>

            {/* Section 12 */}
            <section id="section-12" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                12. Warranty and Liability
              </h2>
              <p>SIMLESS TRAVEL E-SIM services are provided on an <strong>“as is” and “as available”</strong> basis without warranties of any kind. Liability is limited to the maximum extent permitted by law.</p>
            </section>

            {/* Section 13 */}
            <section id="section-13" className="space-y-3 pt-2 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                13. Privacy, Contact & General Provisions
              </h2>
              <p>Your personal information is handled according to the SIMLESS TRAVEL E-SIM Privacy Policy. These Terms constitute the entire agreement between you and us.</p>
              <p className="pt-2">For questions or concerns, please contact us through the official <a href="https://simless-mm.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">SIMLESS TRAVEL E-SIM Website</a>.</p>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}