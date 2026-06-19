import { ChevronLeft, Search, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchProducts, type ProductItem } from '../lib/productsApi';
import type { GlobalPlan, Country } from '../types';
import PlanDetails from './PlanDetails';

interface GlobalPlansProps {
  onBack: () => void;
}

export default function GlobalPlans({ onBack }: GlobalPlansProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [globalPlans, setGlobalPlans] = useState<GlobalPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<GlobalPlan | null>(null);

  useEffect(() => {
    fetchGlobalPlans();
  }, []);

  const normalizeApiType = (value?: string) => (value || '').trim().toLowerCase();

  const getSafeCountryCode = (value?: string) => {
    if (!value) return 'UN';
    const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2);
    }
    return 'UN';
  };

  const mapProductRegionsToCountries = (product: ProductItem): Country[] => {
    return (product.regions || [])
      .filter((region) => Boolean(region.name))
      .map((region, index) => ({
        id: String(region.id ?? `${product.slug}-country-${index}`),
        name: region.name || 'Unknown',
        code: getSafeCountryCode(region.mcc || region.slug || region.name),
        type: 'global' as const,
        popular: false,
      }));
  };

  const fetchGlobalPlans = async () => {
    setLoading(true);

    try {
      const products = await fetchProducts({ perPage: 220 });
      const globalProducts = products.filter((product) => normalizeApiType(product.type) === 'global');

      const plansWithCountries: GlobalPlan[] = globalProducts
        .map((product) => ({
          id: product.slug,
          name: product.name,
          description: product.description,
          imageUrl: product.image_url || product.flag_image_url,
          countries: mapProductRegionsToCountries(product),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setGlobalPlans(plansWithCountries);
    } catch (error) {
      console.error('Error fetching global plans:', error);
      setGlobalPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundImage = (planName: string) => {
    const backgrounds: { [key: string]: string } = {
      'Asia': 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Europe': 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=600',
      'Americas': 'https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Africa': 'https://images.pexels.com/photos/2386381/pexels-photo-2386381.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Middle East': 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Oceania': 'https://images.pexels.com/photos/995764/pexels-photo-995764.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Global': 'https://images.pexels.com/photos/335393/pexels-photo-335393.jpeg?auto=compress&cs=tinysrgb&w=600'
    };

    for (const key in backgrounds) {
      if (planName.toLowerCase().includes(key.toLowerCase())) {
        return backgrounds[key];
      }
    }

    return backgrounds['Global'];
  };

  const filteredPlans = globalPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.countries.some(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (selectedPlan) {
    return <PlanDetails globalPlan={selectedPlan} onBack={() => setSelectedPlan(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-md mx-auto min-h-screen">
        <div className="flex items-center p-4 bg-white/70 backdrop-blur-2xl border-b-2 border-white/60 shadow-xl">
          <button onClick={onBack} className="p-3 hover:bg-white/60 rounded-2xl transition-all backdrop-blur-sm -ml-2 group">
            <ChevronLeft className="w-6 h-6 text-gray-800 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 flex-1 text-center pr-10 drop-shadow-sm">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              🌍 Global Plans
            </span>
          </h1>
        </div>

        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="text"
              placeholder="Search global plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full pl-14 pr-5 py-5 bg-white/70 backdrop-blur-2xl border-2 border-white/60 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-xl font-bold text-gray-800 placeholder:text-gray-500 placeholder:font-medium transition-all"
            />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Global Coverage Plans</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl border-2 border-white/60">
              <div className="animate-spin rounded-full h-14 w-14 border-5 border-purple-400 border-t-transparent mb-5"></div>
              <div className="text-gray-700 font-black text-lg">Loading plans...</div>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-16 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl border-2 border-white/60">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Globe className="w-14 h-14 text-white" />
                </div>
              </div>
              <p className="font-black text-gray-900 text-xl mb-3">No global plans available yet</p>
              <p className="text-sm text-gray-600 font-bold">Check back soon for new plans</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className="w-full relative overflow-hidden rounded-3xl border-2 border-white/60 hover:shadow-2xl transition-all text-left group transform hover:scale-[1.02] h-72"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${getBackgroundImage(plan.name)})` }}
                  />

                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 via-pink-500/50 to-purple-600/50 backdrop-blur-[2px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Content */}
                  <div className="relative h-full p-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/95 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Globe className="w-8 h-8 text-purple-600" />
                          </div>
                          <h3 className="font-black text-white text-2xl drop-shadow-2xl">{plan.name}</h3>
                        </div>
                        <span className="text-sm text-white bg-white/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl font-black shadow-xl border-2 border-white/60">
                          {plan.countries.length} Countries
                        </span>
                      </div>

                      {plan.countries.length > 0 && (
                        <div className="bg-white/35 backdrop-blur-xl rounded-2xl p-4 border-2 border-white/60 shadow-xl">
                          <div className="flex flex-wrap gap-2.5">
                            {plan.countries.slice(0, 12).map((country) => (
                              <img
                                key={country.id}
                                src={country.flagUrl || `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                                alt={country.name}
                                title={country.name}
                                className="w-11 h-8 object-contain hover:scale-110 transition-transform"
                              />
                            ))}
                            {plan.countries.length > 12 && (
                              <div className="w-11 h-8 rounded-lg bg-white/95 backdrop-blur-md border-2 border-white/90 flex items-center justify-center text-xs font-black text-purple-600 shadow-lg">
                                +{plan.countries.length - 12}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-base font-black text-white bg-white/30 backdrop-blur-xl px-6 py-3 rounded-2xl border-2 border-white/60 shadow-lg group-hover:bg-white/40 transition-all">
                        View Plans →
                      </span>
                      <div className="w-12 h-12 bg-white/30 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/60 shadow-lg group-hover:bg-white/40 transition-all">
                        <ChevronLeft className="w-6 h-6 rotate-180 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
