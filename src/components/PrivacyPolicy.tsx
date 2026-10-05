import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const [activeSection, setActiveCategory] = useState<string>('all');

  const sections = [
    { id: 'section-1', title: '1. Collection & Use of Personal Information' },
    { id: 'section-2', title: '2. Cookies & Similar Technologies' },
    { id: 'section-3', title: '3. Sharing, Transfer & Disclosure' },
    { id: 'section-4', title: '4. Protection & Data Security' },
    { id: 'section-5', title: '5. Your Rights' },
    { id: 'section-6', title: '6. International Transfers' },
    { id: 'section-7', title: '7. Children’s Privacy' },
    { id: 'section-8', title: '8. Updates to Policy' },
    { id: 'section-9', title: '9. Contact Us' },
  ];

  const scrollToSection = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    /* 🌟 Top Navigation Bar နှင့် လွတ်စေရန် pt-24 sm:pt-28 ကို သတ်မှတ်ပေးထားပါသည် */
    <div className="w-full min-h-screen bg-slate-50/50 pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-['Poppins'] text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider">
              Legal & Compliance
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            SIMLESS TRAVEL E-SIM Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            This Privacy Policy applies to the products and services provided by SIMLESS TRAVEL E-SIM (referred to as “SIMLESS TRAVEL E-SIM”, “we”, “us”, or “our”). We are committed to complying with applicable privacy and data protection laws and regulations.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Quick Navigation Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
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

          {/* Main Privacy Policy Body */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-10 text-left text-xs sm:text-sm text-slate-700 leading-relaxed">
            
            {/* Introduction Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/60 border border-sky-100 text-sky-900 text-xs sm:text-sm leading-relaxed space-y-2">
              <p className="font-semibold">Please read this Privacy Policy carefully before using our products or services.</p>
              <p>By ticking the “I Agree” box or by continuing to use any of our products or services, you expressly confirm that you have read and agreed to this Privacy Policy. This Privacy Policy and our “User Agreement” together form a single agreement.</p>
            </div>

            {/* Section 1 */}
            <section id="section-1" className="space-y-4 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                1. How and What We Collect and Use Your Personal Information
              </h2>
              <p>We collect and use user information primarily to provide a secure, smooth, efficient, and customized service experience.</p>
              
              <div className="space-y-4 pl-2 border-l-2 border-blue-500/20">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">1.1 Personal Information You Must Provide or Authorize for Core Services</h3>
                
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">(a) Account Registration</p>
                  <p>When registering, you must provide an email address for verification. We will send a verification code to confirm the validity of your account.</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">(b) Product/Service Display, Compatibility, and Security</p>
                  <p>When you use our services, we may automatically collect and store usage data as network log information including:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>Device information:</strong> Device model, OS version, unique device identifiers (IMEI, IMSI, AndroidID, IDFA, GUID), and location-related info.</li>
                    <li><strong>Service log information:</strong> Browsing/click actions, queries, transactions, IP address, browser type, and access logs.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">(c) Traffic Products and Services</p>
                  <p>We may collect your bound traffic card ICCID, destination, activation time, expiration time, and package usage information.</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">(d) Purchasing Products or Services</p>
                  <p>When you purchase, we may collect recipient details, address, and payment method for processing and delivery.</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">(e) Customer Support & Marketing</p>
                  <p>We store communications to resolve inquiries. Marketing emails may be sent to your registered email, from which you can unsubscribe at any time.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">1.2 Optional Information & System Permissions</h3>
                <p><strong>Camera Permission:</strong> Used for scanning card numbers automatically.<br />
                <strong>Location Permission:</strong> Used to display available products for your specific destination.</p>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">1.3 Exceptions Without Consent</h3>
                <p>Where allowed by law, consent is not required for national security, public health, criminal investigations, or contractual fulfillment.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                2. Cookies and Similar Technologies
              </h2>
              <p>We store small data files called cookies on your device to ensure proper service operation, store identifiers, and save preferences. You can manage or delete cookies via browser settings.</p>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                3. How We Share, Transfer, and Disclose Personal Information
              </h2>
              <p>We do not share, transfer, or disclose personal data without explicit permission except in specific cases:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sharing:</strong> With subsidiaries, authorized service partners under confidentiality, and campaign managers (e.g., Mailchimp).</li>
                <li><strong>Transfer:</strong> During corporate restructuring/mergers. Note that backup servers are hosted in Singapore with SSL/TLS encryption protection.</li>
                <li><strong>Public Disclosure:</strong> Only required by applicable laws or explicitly authorized.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                4. How We Protect Your Personal Information
              </h2>
              <p>We maintain technical safeguards and strict access controls. In case of security breaches, we will notify affected users via push notifications, SMS, or public announcements per legal protocols.</p>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                5. Your Rights
              </h2>
              <p>You hold the right to <strong>Access, Correct, Delete, or Withdraw Consent</strong> regarding your stored personal data. Contact us to request processing changes or full deletion.</p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                6. International Transfers
              </h2>
              <p>Your information may be stored and processed globally across our infrastructure. Encryption and standard contractual protections are enforced for cross-border data handling.</p>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                7. Children’s Personal Information
              </h2>
              <p>Our products are intended for adults. We do not knowingly collect personal data from children under 14 (or under 16 for Japanese residents) without verifiable parental/guardian consent.</p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight border-b pb-2 border-slate-100">
                8. Updates to This Privacy Policy
              </h2>
              <p>Material updates to this policy will be announced explicitly on our platforms before coming into effect.</p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="space-y-3 pt-2 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                9. Contact Us
              </h2>
              <p>If you have any questions or requests regarding this Privacy Policy, please contact our support team through the <strong>“Contact Us”</strong> section inside your account area. We aim to respond within 15 business days.</p>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}