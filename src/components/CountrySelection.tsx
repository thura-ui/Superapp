import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import {
  fetchProductsPaginated,
  type ApiPaginationMeta,
  type ProductItem,
} from '../lib/productsApi';
import type { Country, Screen } from '../types';
import { useTranslation } from 'react-i18next'; // 🌟 i18next မှ useTranslation ကို import လုပ်ထားပါသည်

interface CountrySelectionProps {
  onBack: () => void;
  onHome?: () => void;
  onSelectCountry: (country: Country, sourceTab?: 'popular' | 'all', selectedType?: 'fixed' | 'unlimited') => void;
  onSelectRegion: (regionId: string, regionName: string) => void;
  onGlobalPlan: () => void;
  onHelp?: () => void;
  onScreenChange?: (screen: Screen) => void;
  openAllCountries?: boolean;
  onOpenAllCountriesHandled?: () => void;
  initialTab?: 'country' | 'region' | 'regional' | 'global'; 
}

interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  country_count: number;
  secondary_cover_image?: string;
  flag_image?: string;
}

interface ProductWithVariation {
  id: string;
  name: string;
  code: string;
  flag_image?: string;
  type: string;
  startingPrice: number;
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
  if (!countryCode || countryCode === 'UN') return '🌐';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
};

const renderFlagAvatar = (imageUrl: string | undefined, label: string, fallbackText: string) => {
  if (imageUrl && imageUrl.trim() !== '') {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-solid border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
        <img 
          src={imageUrl} 
          alt={label} 
          className="w-full h-full object-cover rounded-full" 
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-solid border-slate-200 bg-slate-50 text-slate-900 shadow-sm shrink-0 flex items-center justify-center text-xs font-semibold font-['Poppins']">
      {fallbackText}
    </div>
  );
};

const normalizePaginationLabel = (label: string) => {
  return label
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/\s+/g, ' ')
    .trim();
};

const PAGE_SIZE_OPTIONS = [
  { label: '12', value: 12 },
  { label: 'All', value: 220 }
] as const;

const resolveStartingPrice = (product: ProductItem): number => {
  if (typeof product.starting_price === 'number' && Number.isFinite(product.starting_price)) {
    return product.starting_price;
  }

  const variationPrices = (product.variations ?? [])
    .map((v) => Number(v.effective_price ?? v.price_mmk ?? v.price ?? NaN))
    .filter((n) => Number.isFinite(n) && n >= 0);

  if (variationPrices.length > 0) {
    return Math.min(...variationPrices);
  }

  return 0;
};

const mapCountryProducts = (products: ProductItem[]): ProductWithVariation[] => {
  return products.map((product) => {
    const apiType = normalizeApiType(product.type);
    const mappedType: 'local' | 'regional' | 'global' =
      apiType === 'regional' || apiType === 'region'
        ? 'regional'
        : apiType === 'global'
          ? 'global'
          : 'local';

    const regionCode = getSafeCountryCode(product.regions?.[0]?.mcc);

    return {
      id: product.slug,
      name: product.name,
      code: regionCode,
      flag_image: product.flag_image,
      type: mappedType,
      startingPrice: resolveStartingPrice(product),
    };
  });
};

const mapProductsToRegions = (products: ProductItem[]): Region[] => {
  return products.map((product) => ({
    id: product.slug,
    name: product.name,
    code: 'REG',
    description: product.description || product.name,
    country_count: extractCountryCountFromDescription(product.description),
    secondary_cover_image: product.secondary_cover_image,
    flag_image: product.flag_image,
  }));
};

const getStartingTab = (tab?: string): 'country' | 'regional' | 'global' => {
  if (tab === 'region' || tab === 'regional') return 'regional';
  if (tab === 'global') return 'global';
  return 'country';
};

export default function CountrySelection({ onSelectCountry, onSelectRegion, openAllCountries, onOpenAllCountriesHandled, initialTab }: CountrySelectionProps) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'country' | 'regional' | 'global'>(getStartingTab(initialTab));
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(12);
  const [allCountries, setAllCountries] = useState<ProductWithVariation[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [globalPackages, setGlobalPackages] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryMeta, setCountryMeta] = useState<ApiPaginationMeta | null>(null);
  const [countryPage, setCountryPage] = useState(1);
  const [regionalMeta, setRegionalMeta] = useState<ApiPaginationMeta | null>(null);
  const [regionalPage, setRegionalPage] = useState(1);
  const [globalMeta, setGlobalMeta] = useState<ApiPaginationMeta | null>(null);
  const [globalPage, setGlobalPage] = useState(1);

  const lastFetchTrackerRef = useRef<string>('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getStartingTab(initialTab));
    }
  }, [initialTab]);

  useEffect(() => {
    if (openAllCountries) {
      setActiveTab('country');
      if (onOpenAllCountriesHandled) onOpenAllCountriesHandled();
    }
  }, [openAllCountries, onOpenAllCountriesHandled]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleTabChange = (newTab: 'country' | 'regional' | 'global') => {
    setActiveTab(newTab);
    if (newTab === 'country') setCountryPage(1);
    if (newTab === 'regional') setRegionalPage(1);
    if (newTab === 'global') setGlobalPage(1);
  };

  useEffect(() => {
    let disposed = false;

    const fetchProductsByType = async () => {
      const pageToLoad =
        activeTab === 'country'
          ? countryPage
          : activeTab === 'regional'
            ? regionalPage
            : globalPage;

      const typeFilter: 'country' | 'region' = activeTab === 'country' ? 'country' : 'region';
      const cleanSearch = debouncedSearchQuery.trim();

      const currentFetchKey = `${activeTab}_${pageToLoad}_${pageSize}_${cleanSearch}`;
      if (lastFetchTrackerRef.current === currentFetchKey) {
        return;
      }
      lastFetchTrackerRef.current = currentFetchKey;

      setLoading(true);
      try {
        const response = await fetchProductsPaginated({
          type: typeFilter,
          perPage: pageSize,
          page: pageToLoad,
          search: cleanSearch ? cleanSearch : undefined,
        });

        if (disposed) return;

        if (activeTab === 'country') {
          setAllCountries(mapCountryProducts(response.items));
          setCountryMeta(response.meta);
        }

        if (activeTab === 'regional') {
          const pureRegionalProducts = response.items.filter(
            (item) => !item.name.toLowerCase().includes('global')
          );
          setRegions(mapProductsToRegions(pureRegionalProducts));
          setRegionalMeta(response.meta);
        }

        if (activeTab === 'global') {
          const pureGlobalProducts = response.items.filter(
            (item) => item.name.toLowerCase().includes('global')
          );
          setGlobalPackages(mapProductsToRegions(pureGlobalProducts));
          setGlobalMeta(response.meta);
        }
      } catch (error) {
        if (!disposed) {
          console.error(`Error fetching ${activeTab} page:`, error);
          lastFetchTrackerRef.current = '';
          if (activeTab === 'country') {
            setAllCountries([]);
            setCountryMeta(null);
          }
          if (activeTab === 'regional') {
            setRegions([]);
            setRegionalMeta(null);
          }
          if (activeTab === 'global') {
            setGlobalPackages([]);
            setGlobalMeta(null);
          }
        }
      } finally {
        if (!disposed) setLoading(false);
      }
    };

    fetchProductsByType();

    return () => {
      disposed = true;
    };
  }, [activeTab, countryPage, regionalPage, globalPage, pageSize, debouncedSearchQuery]);

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'country', label: t('country') },
    { key: 'regional', label: t('regional') },
    { key: 'global', label: t('global') },
  ];

  const renderPaginationSection = (meta: ApiPaginationMeta | null, setPage: (page: number) => void, itemCount: number) => {
    if (!meta && itemCount === 0) return null;

    const isAllSelected = pageSize >= 220;
    const showPageNumbers = !isAllSelected && meta && meta.last_page > 1;

    if (itemCount === 0 && !showPageNumbers) {
      return null;
    }

    return (
      <div className="mt-8 w-full font-['Poppins']">
        {/* Web View Pagination */}
        <div className="hidden sm:flex flex-wrap items-center justify-end gap-2 select-none">
          <label className="flex items-center gap-2 bg-white border border-solid border-slate-200 rounded-xl px-3 py-2 font-semibold text-xs lg:text-[13px] text-slate-800">
            <span>{t('perPage')}</span>
            <select 
              value={pageSize} 
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setPage(1);
              }} 
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer font-['Poppins']"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          {showPageNumbers && meta.links.map((link, index) => {
            const pageNumber = link.page;
            const disabled = pageNumber === null;
            const isActive = link.active;
            const label = normalizePaginationLabel(link.label);
            return (
              <button 
                key={`web-${label}-${index}`} 
                disabled={disabled || isActive} 
                onClick={() => { if (pageNumber !== null) setPage(pageNumber); }} 
                className={`px-3.5 py-2 rounded-xl font-semibold text-xs lg:text-[13px] border border-solid transition-all cursor-pointer font-['Poppins'] ${
                  isActive ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                } ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-white' : ''}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Mobile View Pagination */}
        <div className="flex sm:hidden flex-row flex-nowrap items-center justify-center gap-1.5 w-full select-none">
          <label className="flex items-center gap-1 bg-white border border-solid border-slate-200 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-800 shrink-0">
            <span>{t('perPage')}</span>
            <select 
              value={pageSize} 
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setPage(1);
              }} 
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer text-[11px] font-['Poppins']"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          {showPageNumbers && meta.links.map((link, index) => {
            const pageNumber = link.page;
            const disabled = pageNumber === null;
            const isActive = link.active;
            let label = normalizePaginationLabel(link.label);

            if (label.toLowerCase().includes('previous')) label = '«';
            if (label.toLowerCase().includes('next')) label = '»';

            const isNumeric = /^\d+$/.test(label);
            if (isNumeric && Number(label) > 3) {
              return null; 
            }

            return (
              <button 
                key={`mobile-${label}-${index}`} 
                disabled={disabled || isActive} 
                onClick={() => { if (pageNumber !== null) setPage(pageNumber); }} 
                className={`px-3 py-2 rounded-xl text-[11px] font-semibold border border-solid transition-all cursor-pointer shrink-0 font-['Poppins'] ${
                  isActive 
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm' 
                    : 'bg-white text-slate-800 border-slate-200'
                } ${disabled ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : ''}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-8 font-['Poppins'] text-slate-900">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight font-['Poppins']">
            {t('travelEsimPlans')}
          </h1>
          
          <div className="flex justify-start sm:justify-end w-full sm:w-auto flex-1">
            <div className="relative w-full max-w-sm sm:max-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder={t('searchDestinations')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-solid border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 font-semibold text-xs lg:text-[13px] tracking-wide focus:outline-none focus:border-cyan-500 shadow-sm font-['Poppins']"
              />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4 mb-8 select-none">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs lg:text-[13px] tracking-wide transition-all border border-solid cursor-pointer whitespace-nowrap relative font-['Poppins'] ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.25)] scale-[1.03]'
                    : 'bg-transparent text-slate-800 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500 border-t-transparent" />
          </div>
        )}

        {/* Country Tab View */}
        {!loading && activeTab === 'country' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allCountries.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-900 font-semibold text-xs lg:text-[13px] font-['Poppins']">{t('noDestinationsFound')}</div>
              ) : (
                allCountries.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectCountry({ id: item.id, name: item.name, code: item.code, flagUrl: item.flag_image, type: 'local', popular: false }, 'all')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectCountry({ id: item.id, name: item.name, code: item.code, flagUrl: item.flag_image, type: 'local', popular: false }, 'all');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group flex flex-row items-center bg-white border border-solid border-blue-500 rounded-2xl p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] hover:border-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.2)] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {renderFlagAvatar(item.flag_image, item.name, getFlagEmoji(item.code))}
                      <div className="flex flex-col min-w-0 flex-1 space-y-0.5 text-left">
                        <span className="font-semibold text-slate-900 text-sm sm:text-[15px] truncate tracking-tight font-['Poppins']">
                          {item.name}
                        </span>
                        <p className="text-[9px] sm:text-[11px] font-semibold text-slate-800 font-['Poppins'] whitespace-nowrap no-underline decoration-0">
                          {t('startingFrom')} <span className="text-slate-900 font-semibold text-[10px] sm:text-[12px] whitespace-nowrap no-underline decoration-0">Ks {item.startingPrice.toLocaleString('en-US')}</span>
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold font-['Poppins']">{t('tapToViewPlanDetails')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {renderPaginationSection(countryMeta, setCountryPage, allCountries.length)}
          </>
        )}

        {/* Regional Tab View */}
        {!loading && activeTab === 'regional' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {regions.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-900 font-semibold text-xs lg:text-[13px] font-['Poppins']">{t('noRegionalPlansFound')}</div>
              ) : (
                regions.map(region => (
                  <div
                    key={region.id}
                    onClick={() => onSelectRegion(region.id, region.name)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectRegion(region.id, region.name);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group overflow-hidden bg-white border border-solid border-blue-500 rounded-[28px] transition-all duration-300 hover:scale-[1.02] hover:border-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.2)] flex flex-col cursor-pointer w-full"
                  >
                    {region.secondary_cover_image && (
                      <div className="w-full h-44 overflow-hidden relative shrink-0">
                        <img 
                          src={region.secondary_cover_image} 
                          alt={region.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                    
                    <div className="p-5 flex-grow bg-gradient-to-b from-sky-50/20 to-white flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        {renderFlagAvatar(region.flag_image, region.name, 'R')}
                        <div className="min-w-0 flex-1 text-left">
                          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-0.5 truncate tracking-tight font-['Poppins']">
                            {region.name}
                          </h3>
                          {region.country_count > 0 && (
                            <p className="text-slate-800 text-[11px] font-semibold font-['Poppins']">{region.country_count} {t('countries')}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-600 font-semibold text-left mt-1 font-['Poppins']">{t('tapToViewPlanDetails')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {renderPaginationSection(regionalMeta, setRegionalPage, regions.length)}
          </>
        )}

        {/* Global Tab View */}
        {!loading && activeTab === 'global' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {globalPackages.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-900 font-semibold text-xs lg:text-[13px] font-['Poppins']">{t('noGlobalPlansFound')}</div>
              ) : (
                globalPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectCountry({ id: pkg.id, name: pkg.name, code: 'GLB', type: 'global', popular: false }, 'all')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectCountry({ id: pkg.id, name: pkg.name, code: 'GLB', type: 'global', popular: false }, 'all');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group overflow-hidden bg-white border border-solid border-blue-500 rounded-[28px] transition-all duration-300 hover:scale-[1.02] hover:border-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.2)] flex flex-col cursor-pointer w-full"
                  >
                    {pkg.secondary_cover_image && (
                      <div className="w-full h-44 overflow-hidden relative shrink-0">
                        <img 
                          src={pkg.secondary_cover_image} 
                          alt={pkg.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                    
                    <div className="p-5 flex-grow bg-gradient-to-b from-sky-50/20 to-white flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        {renderFlagAvatar(pkg.flag_image, pkg.name, 'G')}
                        <div className="min-w-0 flex-1 text-left">
                          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-0.5 truncate tracking-tight font-['Poppins']">
                            {pkg.name}
                          </h3>
                          {pkg.country_count > 0 && (
                            <p className="text-slate-800 text-[11px] font-semibold font-['Poppins']">{pkg.country_count} {t('countriesCovered')}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-600 font-semibold text-left mt-1 font-['Poppins']">{t('tapToViewPlanDetails')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {renderPaginationSection(globalMeta, setGlobalPage, globalPackages.length)}
          </>
        )}
      </div>
    </div>
  );
}