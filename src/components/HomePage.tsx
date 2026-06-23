import { useState, useEffect } from 'react';
import { Wifi, QrCode, Globe, Zap, Headphones, Star } from 'lucide-react';
import { fetchProducts } from '../lib/productsApi';
import type { Country } from '../types';

interface HomePageProps {
  onExplorePlans: () => void;
  onSelectCountry: (country: Country) => void;
}

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function HomePage({ onExplorePlans, onSelectCountry }: HomePageProps) {
  const [popularPlans, setPopularPlans] = useState<Country[]>([]);

  useEffect(() => {
    fetchProducts({ perPage: 220 }).then(products => {
      const countryProducts = products.filter(p => {
        const t = (p.type || '').toLowerCase();
        return t === 'country' || t === 'local' || t === '';
      });

      const marked = countryProducts.filter(p => p.is_popular || p.popular || p.featured);
      const source = marked.length > 0 ? marked : countryProducts;

      const popular = source.slice(0, 8).map(p => ({
        id: p.slug,
        name: p.name,
        code: (p.regions[0]?.mcc || 'UN').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2) || 'UN',
        flagUrl: p.country_flag_url || p.flag_url,
        type: 'local' as const,
        popular: true,
      }));
      setPopularPlans(popular);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Global Connectivity,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">Instantly.</span>
            </h1>
            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
              Get your eSim for over 150+ Countries. Stay connected while traveling with high-speed data, no physical SIM card needed.
            </p>
            <button
              onClick={onExplorePlans}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-black rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:scale-105 active:scale-95"
            >
              Explore Plans & Get eSim
            </button>
          </div>

          <div className="flex-1 relative w-full max-w-md lg:max-w-lg">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Traveler with phone"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#042f2e]/60 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: '1. Choose Plan', desc: 'Find a global plan to the global plan.' },
              { icon: QrCode, title: '2. Download eSim', desc: 'Activate instantly via QR code instantly via QR code.' },
              { icon: Wifi, title: '3. Stay Connected', desc: 'Enjoy fast data everywhere.' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center border border-white/10">
                  <item.icon className="w-8 h-8 text-teal-300" />
                </div>
                <h3 className="text-lg font-black text-white">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Data Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-10">Popular Data Plans</h2>
          {popularPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularPlans.map(plan => (
                <div
                  key={plan.id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                      {plan.flagUrl ? (
                        <img src={plan.flagUrl} alt={plan.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-xl">{getFlagEmoji(plan.code)}</span>
                      )}
                    </div>
                    <span className="font-black text-white text-lg">{plan.name}</span>
                  </div>
                  <button
                    onClick={() => onSelectCountry(plan)}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/30 transition-all text-sm"
                  >
                    View Plans
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-400 border-t-transparent" />
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-10">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Nuura', role: 'Traveler', text: 'Our competitors info to beta standard is turning esim problem class.' },
              { name: 'Boris', role: 'Consumer', text: 'I have been very profitable and diversity sunrise are enough for boring.' },
              { name: 'Sanny', role: 'Businessman', text: 'We really trip a place connection, and best onto a become transmission.' },
            ].map(t => (
              <div key={t.name} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <p className="text-white/60 text-sm mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Benefits</h2>
          <p className="text-white/50 mb-10">Most convenient reads and more five times.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Activation', desc: 'Remains your constant sanctions and confirmations.' },
              { icon: Wifi, title: 'High Speed', desc: 'Remote activation for high speed and cellular routing.' },
              { icon: Headphones, title: 'Reliable Support', desc: 'We cover precise for high speed and reliable support.' },
            ].map(b => (
              <div key={b.title} className="flex flex-col items-center gap-3 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
                <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center border border-teal-400/20">
                  <b.icon className="w-7 h-7 text-teal-300" />
                </div>
                <h3 className="text-white font-bold">{b.title}</h3>
                <p className="text-white/50 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}