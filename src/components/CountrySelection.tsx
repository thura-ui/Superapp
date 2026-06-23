import { useState, useEffect } from 'react';
import { Search, Star, Globe } from 'lucide-react';
import { fetchProducts } from '../lib/productsApi';
import { addToCart } from '../lib/cartApi';
import type { Country, Screen } from '../types';

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

interface ProductWithVariation {
  id: string;
  name: string;
  code: string;
  flagUrl?: string;
  type: string;
  popular: boolean;
  firstVariationId?: number;
}

const normalizeApiType = (value?: string) => (value || '').trim().toLowerCase();

const extractCountryCountFromDescription = (description?: string): number => {
  if (!description) return 0;
  const rangeMatch = description.match(/(\d+)\s*[-~]\s*(\d+)/);
  if (rangeMatch) {
    return Math.max(Number(rangeMatch[1]), Number(rangeMatch[2]));
  }
  const numericMatches = description.match(/\d+/g);
  if (!numericMatches) return 0;
  return numericMatches.map(Number).filter(Number.isFinite).reduce((max, v) => Math.max(max, v), 0);
};

const getSafeCountryCode = (value?: string) => {
  if (!value) return 'UN';
  const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return cleaned.length >= 2 ? cleaned.slice(0, 2) : 'UN';
};

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function CountrySelection({ onSelectCountry, onSelectRegion, onScreenChange, openAllCountries, onOpenAllCountriesHandled }: CountrySelectionProps) {
  const [activeTab, setActiveTab] = useState<'popular' | 'country' | 'regional' | 'global'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularCountries, setPopularCountries] = useState<ProductWithVariation[]>([]);
  const [allCountries, setAllCountries] = useState<ProductWithVariation[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [globalPackages, setGlobalPackages] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (openAllCountries) {
      setActiveTab('country');
      if (onOpenAllCountriesHandled) onOpenAllCountriesHandled();
    }
  }, [openAllCountries, onOpenAllCountriesHandled]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const products = await fetchProducts({ perPage: 220 });
        const countryProducts = products.filter(p => {
          const t = normalizeApiType(p.type);
          return t === 'country' || t === 'local' || t === '';
        });

        const mapped: ProductWithVariation[] = countryProducts.map(product => {
          const regionCode = getSafeCountryCode(product.regions[0]?.mcc);
          const firstVarId = product.variations[0]?.id;
          return {
            id: product.slug,
            name: product.name,
            code: regionCode,
            flagUrl: product.country_flag_url || product.flag_url,
            type: 'local',
            popular: Boolean(product.is_popular || product.popular || product.featured),
            firstVariationId: typeof firstVarId === 'number' ? firstVarId : undefined,
          };
        }).sort((a, b) => a.name.localeCompare(b.name));

        const regionTypeProducts = products.filter(p => {
          const t = normalizeApiType(p.type);
          return t === 'region' || t === 'regional';
        });

        const globalTypeProducts = products.filter(p => normalizeApiType(p.type) === 'global');

        const mappedRegions: Region[] = [];
        const mappedGlobals: Region[] = [];

        for (const product of regionTypeProducts) {
          const countryCount = extractCountryCountFromDescription(product.description);
          const m: Region = {
            id: product.slug,
            name: product.name,
            code: 'REG',
            description: product.description || product.name,
            country_count: countryCount,
            flag_image_url: product.flag_image_url,
          };
          if (countryCount >= 100 && countryCount <= 220) {
            mappedGlobals.push({ ...m, code: 'GLB' });
          } else if (countryCount >= 1 && countryCount < 100) {
            mappedRegions.push(m);
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

        const markedPopular = mapped.filter(c => c.popular);
        setAllCountries(mapped);
        setPopularCountries(markedPopular.length > 0 ? markedPopular : mapped.slice(0, 12));
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

  const handleAddToCart = async (item: ProductWithVariation) => {
    if (!item.firstVariationId) {
      onSelectCountry({ id: item.id, name: item.name, code: item.code, flagUrl: item.flagUrl, type: 'local', popular: item.popular });
      return;
    }
    setAddingToCart(item.id);
    try {
      await addToCart(item.firstVariationId, 1);
      onScreenChange?.('cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  const displayCountries = activeTab === 'popular' ? popularCountries : allCountries;
  const filteredCountries = displayCountries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRegions = regions.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGlobals = globalPackages.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'popular', label: 'Popular' },
    { key: 'country', label: 'Country' },
    { key: 'regional', label: 'Regional' },
    { key: 'global', label: 'Global' },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-black text-white">eSIM Products</h1>

          {/* Search */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-400 border-t-transparent" />
          </div>
        )}

        {/* Popular & Country grids */}
        {!loading && (activeTab === 'popular' || activeTab === 'country') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCountries.length === 0 ? (
              <div className="col-span-full text-center py-16 text-white/50 font-bold">No destinations found</div>
            ) : (
              filteredCountries.map(item => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-all group"
                >
                  {/* Flag display */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden p-1">
                      {item.flagUrl ? (
                        <img src={item.flagUrl} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">{getFlagEmoji(item.code)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{item.name}</p>
                      {item.popular && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-teal-300 font-bold">
                          <Star className="w-3 h-3 fill-teal-300 text-teal-300" /> Popular
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectCountry({ id: item.id, name: item.name, code: item.code, flagUrl: item.flagUrl, type: 'local', popular: item.popular })}
                      className="py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-teal-500/30 transition-all"
                    >
                      View Plans
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCart === item.id}
                      className="py-2.5 bg-white/5 border border-white/15 text-white/80 font-bold rounded-xl text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {addingToCart === item.id ? '...' : 'Coverage & Network'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Regional */}
        {!loading && activeTab === 'regional' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegions.length === 0 ? (
              <div className="col-span-full text-center py-16 text-white/50 font-bold">No regional plans found</div>
            ) : (
              filteredRegions.map(region => (
                <div
                  key={region.id}
                  className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl group hover:bg-white/10 transition-all"
                >
                  {region.flag_image_url && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={region.flag_image_url}
                        alt={region.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 h-32 bg-gradient-to-b from-transparent to-[#042f2e]/90" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-white mb-1">{region.name}</h3>
                    {region.country_count > 0 && (
                      <p className="text-white/50 text-xs mb-4">{region.country_count} Countries</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectRegion(region.id, region.name)}
                        className="py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl text-xs shadow-md"
                      >
                        View Plans
                      </button>
                      <button
                        onClick={() => onSelectRegion(region.id, region.name)}
                        className="py-2.5 bg-white/5 border border-white/15 text-white/80 font-bold rounded-xl text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1"
                      >
                        Coverage & Network
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Global */}
        {!loading && activeTab === 'global' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGlobals.length === 0 ? (
              <div className="col-span-full text-center py-16 text-white/50 font-bold">No global plans found</div>
            ) : (
              filteredGlobals.map(pkg => (
                <div
                  key={pkg.id}
                  className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl group hover:bg-white/10 transition-all"
                >
                  {pkg.flag_image_url && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={pkg.flag_image_url}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 h-36 bg-gradient-to-b from-transparent to-[#042f2e]/90" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-white mb-1">{pkg.name}</h3>
                    {pkg.country_count > 0 && (
                      <p className="text-white/50 text-xs mb-4">{pkg.country_count} Countries Covered</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectCountry({ id: pkg.id, name: pkg.name, code: 'GLB', type: 'global', popular: false })}
                        className="py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl text-xs shadow-md"
                      >
                        View Plans
                      </button>
                      <button
                        onClick={() => onSelectCountry({ id: pkg.id, name: pkg.name, code: 'GLB', type: 'global', popular: false })}
                        className="py-2.5 bg-white/5 border border-white/15 text-white/80 font-bold rounded-xl text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1"
                      >
                        Coverage & Network
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
