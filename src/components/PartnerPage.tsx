import { useState } from 'react';
import { Globe, DollarSign, BarChart3, Briefcase, Code, Plane, Users } from 'lucide-react';

export default function PartnerPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', type: 'travel_agency' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Join the eSimConnect Partner Network
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Become a Partner */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-black text-white mb-5">1. Become a Partner</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Plane, title: 'For Travel Agencies', desc: 'Offer eSims to your travelers.' },
                  { icon: Code, title: 'For Tech Platforms', desc: 'API Integration for embedded eSim purchasing.' },
                  { icon: Briefcase, title: 'For Corporate Travel', desc: 'Efficient global connectivity management.' },
                  { icon: Users, title: 'For Content Creators', desc: 'Commission-based referral program.' },
                ].map(item => (
                  <div key={item.title} className="flex flex-col items-center text-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-400/20">
                      <item.icon className="w-5 h-5 text-teal-300" />
                    </div>
                    <p className="text-white font-bold text-xs">{item.title}</p>
                    <p className="text-white/50 text-[11px]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Partner Benefits */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-black text-white mb-5">2. Key Partner Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: DollarSign, title: 'Lucrative Commissions', desc: 'Earn from every activation.' },
                  { icon: Globe, title: 'Global Reach', desc: 'Access eSims for 200+ destinations.' },
                  { icon: BarChart3, title: 'Real-time Dashboard', desc: 'Track partner performance and payouts.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-9 h-9 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-400/20 shrink-0">
                      <item.icon className="w-4 h-4 text-teal-300" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works (Partner Onboarding) */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-black text-white mb-5">3. How It Works (Partner Onboarding)</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {[
                  { num: '1', title: 'Register', desc: 'Fill out our brief application form.' },
                  { num: '2', title: 'Get Access', desc: 'Log into your partner portal.' },
                  { num: '3', title: 'Start Earning', desc: 'Integrate and sell eSim plans.' },
                ].map((step, i) => (
                  <div key={step.num} className="flex items-center gap-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">{step.num}</span>
                      </div>
                      <p className="text-white font-bold text-sm">{step.title}</p>
                      <p className="text-white/50 text-xs max-w-[140px]">{step.desc}</p>
                    </div>
                    {i < 2 && <span className="text-white/30 text-2xl hidden sm:block mx-2">{'>'}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sticky top-24">
              <h3 className="text-xl font-black text-white mb-5">Get in Touch</h3>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-400/30">
                    <Globe className="w-7 h-7 text-teal-300" />
                  </div>
                  <p className="text-white font-bold">Inquiry Submitted!</p>
                  <p className="text-white/50 text-sm mt-1">We'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Organization"
                    value={form.organization}
                    onChange={e => setForm({ ...form, organization: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 text-sm"
                  />
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400/60 text-sm appearance-none"
                  >
                    <option value="travel_agency" className="bg-gray-900">Travel Agency</option>
                    <option value="tech_platform" className="bg-gray-900">Tech Platform</option>
                    <option value="corporate" className="bg-gray-900">Corporate Travel</option>
                    <option value="creator" className="bg-gray-900">Content Creator</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/30 transition-all text-sm"
                  >
                    Submit Inquiry
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
