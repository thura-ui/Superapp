import { useState, useEffect } from 'react';
import { ChevronLeft, Search, ChevronRight, Star, Globe, HelpCircle, ShoppingCart } from 'lucide-react';
import { fetchProducts } from '../lib/productsApi';
import type { Country, Screen } from '../types';
import MyData from './MyData';
import PurchaseHistory from './PurchaseHistory';
import BottomNavigation from './BottomNavigation';
interface CountrySelectionProps {
  onBack: () => void;
  onHome?: () => void;
  onSelectCountry: (country: Country, sourceTab?: 'popular' | 'all') => void;
  onSelectRegion: (regionId: string, regionName: string) => void;
  onGlobalPlan: () => void;
  onHelp?: () => void;
  onScreenChange?: (screen: Screen) => void;
  openAllCountries?: boolean;
  onOpenAllCountriesHandled?: () => void;
}

interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  country_count: number;
  flag_image_url?: string;
}

const normalizeApiType = (value?: string) => (value || '').trim().toLowerCase();

const extractCountryCountFromDescription = (description?: string): number => {
  if (!description) {
    return 0;
  }

  const rangeMatch = description.match(/(\d+)\s*[-~]\s*(\d+)/);
  if (rangeMatch) {
    const left = Number(rangeMatch[1]);
    const right = Number(rangeMatch[2]);
    return Number.isFinite(left) && Number.isFinite(right) ? Math.max(left, right) : 0;
  }

  const numericMatches = description.match(/\d+/g);
  if (!numericMatches || numericMatches.length === 0) {
    return 0;
  }

  return numericMatches
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), 0);
};

const getSafeCountryCode = (value?: string) => {
  if (!value) return 'UN';
  const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2);
  }
  return 'UN';
};

export default function CountrySelection({ onBack, onHome, onSelectCountry, onSelectRegion, onGlobalPlan, onHelp, onScreenChange, openAllCountries, onOpenAllCountriesHandled }: CountrySelectionProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'regional' | 'global'>('local');
  const [localSubTab, setLocalSubTab] = useState<'popular' | 'all'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularCountries, setPopularCountries] = useState<Country[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [globalPackages, setGlobalPackages] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (openAllCountries) {
      setActiveTab('local');
      setLocalSubTab('all');
      if (onOpenAllCountriesHandled) onOpenAllCountriesHandled();
    }
  }, [openAllCountries, onOpenAllCountriesHandled]);

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setRegions([]);
      setGlobalPackages([]);

      try {
        const products = await fetchProducts({ perPage: 220 });
        const countryProducts = products.filter((product) => {
          const productType = normalizeApiType(product.type);
          return productType === 'country' || productType === 'local' || productType === '';
        });

        const mappedCountries: Country[] = countryProducts
          .map((product) => {
            const regionCode = getSafeCountryCode(product.regions[0]?.mcc);
            return {
              id: product.slug,
              name: product.name,
              code: regionCode,
              flagUrl: product.country_flag_url || product.flag_url,
              type: 'local' as const,
              popular: Boolean(product.is_popular || product.popular || product.featured),
              color: '',
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        const regionTypeProducts = products.filter((product) => {
          const productType = normalizeApiType(product.type);
          return productType === 'region' || productType === 'regional';
        });

        const globalTypeProducts = products.filter((product) => normalizeApiType(product.type) === 'global');

        const mappedRegions: Region[] = [];
        const mappedGlobals: Region[] = [];

        for (const product of regionTypeProducts) {
          const countryCount = extractCountryCountFromDescription(product.description);
          const mapped: Region = {
            id: product.slug,
            name: product.name,
            code: 'REG',
            description: product.description || product.name,
            country_count: countryCount,
            flag_image_url: product.flag_image_url,
          };

          if (countryCount >= 100 && countryCount <= 220) {
            mappedGlobals.push({ ...mapped, code: 'GLB' });
          } else if (countryCount >= 1 && countryCount < 100) {
            mappedRegions.push(mapped);
          }
        }

        for (const product of globalTypeProducts) {
          mappedGlobals.push({
            id: product.slug,
            name: product.name,
            code: 'GLB',
            description: product.description || product.name,
            country_count: extractCountryCountFromDescription(product.description),
            flag_image_url: product.flag_image_url,
          });
        }

        setRegions(mappedRegions);
        setGlobalPackages(mappedGlobals);

        const markedPopular = mappedCountries.filter((c) => c.popular);
        setAllCountries(mappedCountries);
        setPopularCountries(markedPopular.length > 0 ? markedPopular : mappedCountries.slice(0, 12));
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllCountries([]);
        setPopularCountries([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const countries = localSubTab === 'popular' ? popularCountries : allCountries;
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] pb-32 relative overflow-hidden">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[55%] h-[55%] bg-emerald-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[10%] left-[5%] w-[50%] h-[50%] bg-teal-300/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-md mx-auto px-4">
        {/* Header - Euro Gray Frosted Glass */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl mt-8 transition-all hover:bg-white/15">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-teal-200 via-cyan-100 to-white bg-clip-text text-transparent">
              Choose Your Trip
            </span>
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => onScreenChange?.('cart')}
              className="p-2 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all border border-white/20 shadow-lg"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-6 h-6 text-cyan-300" />
            </button>
            <button 
              onClick={onHelp}
              className="p-2 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all border border-white/20 group shadow-lg"
              aria-label="Help Center"
            >
              <HelpCircle className="w-6 h-6 text-cyan-300 group-hover:text-white group-hover:rotate-12 transition-all" />
            </button>
          </div>
        </div>

        {/* Search Bar - Euro Gray Frosted Glass */}
        <div className="mt-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300 group-focus-within:text-white transition-colors z-10" />
            <input
              type="text"
              placeholder="Where to next?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-cyan-400/20 shadow-2xl font-bold text-white placeholder:text-cyan-100/40 transition-all hover:bg-white/15"
            />
          </div>
        </div>



        {/* Main Tabs - Euro Gray Glass */}
        <div className="flex bg-white/5 backdrop-blur-xl border border-white/20 mt-8 rounded-[28px] p-1.5 shadow-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-4 text-sm font-black transition-all rounded-[24px] relative overflow-hidden group ${
              activeTab === 'local'
                ? 'text-white bg-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-white/20'
                : 'text-cyan-200/60 hover:bg-white/10'
            }`}
          >
            <span className="relative z-10">Country</span>
          </button>
          <button
            onClick={() => setActiveTab('regional')}
            className={`flex-1 py-4 text-sm font-black transition-all rounded-[24px] relative overflow-hidden group ${
              activeTab === 'regional'
                ? 'text-white bg-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-white/20'
                : 'text-cyan-200/60 hover:bg-white/10'
            }`}
          >
            <span className="relative z-10">Regional</span>
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-4 text-sm font-black transition-all rounded-[24px] relative overflow-hidden group ${
              activeTab === 'global'
                ? 'text-white bg-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-white/20'
                : 'text-cyan-200/60 hover:bg-white/10'
            }`}
          >
            <span className="relative z-10">Global</span>
          </button>
        </div>

        {activeTab === 'local' && (
          <div className="mt-6 space-y-6">
            {/* Sub Tabs - Euro Gray Glass */}
            <div className="flex bg-white/5 backdrop-blur-xl border border-white/20 rounded-[24px] p-1 shadow-lg">
              <button
                onClick={() => setLocalSubTab('popular')}
                className={`flex-1 py-3 text-xs font-black transition-all rounded-[20px] relative group ${
                  localSubTab === 'popular'
                    ? 'text-white bg-cyan-500/30 shadow-md border border-white/20'
                    : 'text-cyan-200/60 hover:bg-white/10'
                }`}
              >
                <span className="relative z-10">⭐ Popular</span>
              </button>
              <button
                onClick={() => setLocalSubTab('all')}
                className={`flex-1 py-3 text-xs font-black transition-all rounded-[20px] relative group ${
                  localSubTab === 'all'
                    ? 'text-white bg-cyan-500/30 shadow-md border border-white/20'
                    : 'text-cyan-200/60 hover:bg-white/10'
                }`}
              >
                <span className="relative z-10">🌍 All </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md">
                  {localSubTab === 'popular' ? 'Popular Destinations' : 'Explore All'}
                </h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white/5 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mb-4"></div>
                  <div className="text-cyan-200 font-bold">Discovering destinations...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCountries.length === 0 ? (
                    <div className="flex items-center justify-center py-16 bg-white/5 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20">
                      <div className="text-cyan-200 font-bold">No destinations found</div>
                    </div>
                  ) : (
                    filteredCountries.map((country, index) => (
                      <button
                        key={country.id}
                        onClick={() => onSelectCountry(country, localSubTab)}
                        className="w-full relative overflow-hidden rounded-[28px] shadow-2xl hover:shadow-cyan-500/10 transition-all group transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {/* Euro Gray Frosted Glass Base */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-md transition-all group-hover:bg-white/15" />
                        
                        {/* Wet Glass & Blur Layer (Wiped Clean Center) */}
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            maskImage: 'radial-gradient(circle at center, transparent 40%, black 80%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, transparent 40%, black 80%)',
                          }}
                        />

                        {/* Raindrops Layer */}
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-20"
                          style={{
                            backgroundImage: `
                              radial-gradient(circle at 15% 25%, rgba(255,255,255,0.8) 0.5px, transparent 2px),
                              radial-gradient(circle at 75% 15%, rgba(255,255,255,0.8) 1px, transparent 3px),
                              radial-gradient(circle at 45% 85%, rgba(255,255,255,0.8) 0.8px, transparent 2.5px),
                              radial-gradient(circle at 85% 75%, rgba(255,255,255,0.8) 1.2px, transparent 3.5px),
                              radial-gradient(circle at 10% 65%, rgba(255,255,255,0.8) 0.7px, transparent 2px),
                              radial-gradient(circle at 55% 45%, rgba(255,255,255,0.8) 1px, transparent 3px)
                            `,
                            backgroundSize: '100px 100px',
                            maskImage: 'radial-gradient(circle at center, transparent 50%, black 100%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, transparent 50%, black 100%)',
                          }}
                        />

                        {/* Top Edge Highlight for Glass Effect */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative flex items-center gap-5 p-5 border border-white/20 rounded-[28px]">
                          <div className="w-16 h-12 flex items-center justify-center flex-shrink-0 bg-white/20 backdrop-blur-md rounded-xl p-2 shadow-xl border border-white/30 group-hover:bg-white/30 transition-all">
                            {country.flagUrl ? (
                              <img
                                src={country.flagUrl}
                                alt={country.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-3xl">{getFlagEmoji(country.code)}</span>
                            )}
                          </div>
                          <span className="flex-1 text-left font-black text-white text-lg tracking-tight drop-shadow-md">
                            {country.name}
                          </span>
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-cyan-500/30 transition-all group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                            <ChevronRight className="w-6 h-6 text-cyan-200 group-hover:text-white transition-all group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'regional' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md">Regional Access</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white/5 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mb-4"></div>
                <div className="text-cyan-200 font-bold">Scanning regions...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => onSelectRegion(region.id, region.name)}
                    className="w-full relative overflow-hidden rounded-[32px] border border-white/20 shadow-2xl transition-all text-left group transform hover:scale-[1.02] active:scale-[0.98] h-56"
                  >
                    {/* Background Image with Zoom */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: region.flag_image_url ? `url(${region.flag_image_url})` : 'none' }}
                    />

                    {/* Layered Glassmorphism & Wet Texture */}
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-800/20 to-transparent" />
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                        maskImage: 'radial-gradient(circle at center, transparent 30%, black 70%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, transparent 30%, black 70%)',
                      }}
                    />

                    {/* Content */}
                    <div className="relative h-full p-8 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-black text-white text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] tracking-tight">{region.name}</div>
                          <div className="mt-3 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-black text-white shadow-sm uppercase tracking-widest">
                            {region.country_count > 0 ? `${region.country_count} Countries` : 'Regional Package'}
                          </div>
                        </div>
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group-hover:bg-cyan-500/30 transition-all">
                          <ChevronRight className="w-7 h-7 text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'global' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md">Global Connectivity</h2>
            </div>

            <div className="space-y-6">
              {globalPackages.length === 0 ? (
                <div className="flex items-center justify-center py-16 bg-white/5 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20">
                  <div className="text-cyan-200 font-bold">No global packages found</div>
                </div>
              ) : (
                globalPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => onSelectCountry({ id: pkg.id, name: pkg.name, code: 'GLB', type: 'global', popular: false })}
                    className="w-full relative overflow-hidden rounded-[32px] border border-white/20 shadow-2xl transition-all text-left group transform hover:scale-[1.02] active:scale-[0.98] h-64"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: pkg.flag_image_url ? `url(${pkg.flag_image_url})` : 'none' }}
                    />

                    {/* Layered Glassmorphism & Wet Texture */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2e1065]/80 via-[#2e1065]/20 to-transparent" />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                        maskImage: 'radial-gradient(circle at center, transparent 35%, black 75%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 75%)',
                      }}
                    />

                    {/* Content */}
                    <div className="relative h-full p-8 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-black text-white text-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] tracking-tight">{pkg.name}</div>
                          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 text-xs font-black text-white shadow-sm uppercase tracking-widest">
                            {pkg.country_count > 0 ? `${pkg.country_count} Countries Covered` : 'Global Package'}
                          </div>
                        </div>
                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group-hover:bg-purple-500/30 transition-all">
                          <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
