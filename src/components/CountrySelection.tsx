import { useState, useEffect, useRef } from 'react';
import { Search, Clock, ChevronDown } from 'lucide-react';
import {
  fetchProductsPaginated,
  type ApiPaginationMeta,
  type ProductItem,
} from '../lib/productsApi';
import type { Country, Screen } from '../types';
import { useTranslation } from 'react-i18next';

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
  startingPrice: number; // 🔴 Price Interface ထည့်သွင်းခြင်း
}

interface ProductWithVariation {
  id: string;
  name: string;
  code: string;
  flag_image?: string;
  type: string;
  startingPrice: number;
  isComingSoon?: boolean;
}

const COMING_SOON_COUNTRIES: { name: string; code: string }[] = [
  { name: 'Aland Islands', code: 'ax' },
  { name: 'Albania', code: 'al' },
  { name: 'Andorra', code: 'ad' },
  { name: 'Anguilla', code: 'ai' },
  { name: 'Antigua and Barbuda', code: 'ag' },
  { name: 'Argentina', code: 'ar' },
  { name: 'Azerbaijan', code: 'az' },
  { name: 'Bahamas', code: 'bs' },
  { name: 'Bahrain', code: 'bh' },
  { name: 'Bangladesh', code: 'bd' },
  { name: 'Barbados', code: 'bb' },
  { name: 'Belize City', code: 'bz' },
  { name: 'Benin', code: 'bj' },
  { name: 'Bolivia', code: 'bo' },
  { name: 'Botswana', code: 'bw' },
  { name: 'Bosnia and Herzegovina', code: 'ba' },
  { name: 'Brunei Darussalam', code: 'bn' },
  { name: 'Burkina Faso', code: 'bf' },
  { name: 'Cameroon', code: 'cm' },
  { name: 'Cayman Islands', code: 'ky' },
  { name: 'Central African Republic', code: 'cf' },
  { name: 'Chad', code: 'td' },
  { name: 'Chile', code: 'cl' },
  { name: 'Columbia', code: 'co' },
  { name: 'Congo', code: 'cg' },
  { name: 'Costa Rica', code: 'cr' },
  { name: "Cote D'Ivoire", code: 'ci' },
  { name: 'Curacao', code: 'cw' },
  { name: 'Democratic Republic of Congo', code: 'cd' },
  { name: 'Dominican Republic', code: 'do' },
  { name: 'Ecuador', code: 'ec' },
  { name: 'El Salvador', code: 'sv' },
  { name: 'France', code: 'fr' },
  { name: 'French Guiana', code: 'gf' },
  { name: 'Gabon', code: 'ga' },
  { name: 'Georgia', code: 'ge' },
  { name: 'Germany', code: 'de' },
  { name: 'Ghana', code: 'gh' },
  { name: 'Gibraltar (UK)', code: 'gi' },
  { name: 'Grenada', code: 'gd' },
  { name: 'Guam', code: 'gu' },
  { name: 'Guernsey', code: 'gg' },
  { name: 'Guinea-Bissau', code: 'gw' },
  { name: 'Guyana', code: 'gy' },
  { name: 'Honduras', code: 'hn' },
  { name: 'Iraq', code: 'iq' },
  { name: 'Jamaica', code: 'jm' },
  { name: 'Jersey', code: 'je' },
  { name: 'Jordan', code: 'jo' },
  { name: 'Kazakhstan', code: 'kz' },
  { name: 'Kenya', code: 'ke' },
  { name: 'Kuwait', code: 'kw' },
  { name: 'Kyrgyzstan', code: 'kg' },
  { name: 'Laos', code: 'la' },
  { name: 'Liberia', code: 'lr' },
  { name: 'Macedonia', code: 'mk' },
  { name: 'Madagascar', code: 'mg' },
  { name: 'Malawi', code: 'mw' },
  { name: 'Maldives', code: 'mv' },
  { name: 'Mali', code: 'ml' },
  { name: 'Martinique Island', code: 'mq' },
  { name: 'Mauritius', code: 'mu' },
  { name: 'Moldova', code: 'md' },
  { name: 'Monaco', code: 'mc' },
  { name: 'Mongolia', code: 'mn' },
  { name: 'Morocco', code: 'ma' },
  { name: 'Nicaragua', code: 'ni' },
  { name: 'Niger', code: 'ne' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'Oman', code: 'om' },
  { name: 'Pakistan', code: 'pk' },
  { name: 'Panama', code: 'pa' },
  { name: 'Paraguay', code: 'py' },
  { name: 'Peru', code: 'pe' },
  { name: 'Puerto Rico', code: 'pr' },
  { name: 'Qatar', code: 'qa' },
  { name: 'Republic of Montenegro', code: 'me' },
  { name: 'Reunion', code: 're' },
  { name: 'Rwanda', code: 'rw' },
  { name: 'Saint Lucia', code: 'lc' },
  { name: 'Saint Vincent and the Grenadines', code: 'vc' },
  { name: 'Saudi Arabia', code: 'sa' },
  { name: 'Senegal', code: 'sn' },
  { name: 'Serbia', code: 'rs' },
  { name: 'Seychelles', code: 'sc' },
  { name: 'South Africa', code: 'za' },
  { name: 'Sri Lanka', code: 'lk' },
  { name: 'St. Kitts and Nevis', code: 'kn' },
  { name: 'Suriname', code: 'sr' },
  { name: 'Swaziland', code: 'sz' },
  { name: 'Tanzania', code: 'tz' },
  { name: 'Trinidad and Tobago', code: 'tt' },
  { name: 'Dominica', code: 'dm' },
  { name: 'Tunisia', code: 'tn' },
  { name: 'Turks and Caicos', code: 'tc' },
  { name: 'Uganda', code: 'ug' },
  { name: 'Ukraine', code: 'ua' },
  { name: 'Uruguay', code: 'uy' },
  { name: 'Uzbekistan', code: 'uz' },
  { name: 'Virgin Islands (UK)', code: 'vg' },
  { name: 'Zambia', code: 'zm' }
];

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
  { label: 'Per page 12', value: 12 },
  { label: 'Per page All', value: 220 }
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
      isComingSoon: false
    };
  });
};

const mapProductsToRegions = (products: ProductItem[]): Region[] => {
  const mapped = products.map((product) => ({
    id: product.slug,
    name: product.name,
    code: 'REG',
    description: product.description || product.name,
    country_count: extractCountryCountFromDescription(product.description),
    secondary_cover_image: product.secondary_cover_image,
    flag_image: product.flag_image,
    startingPrice: resolveStartingPrice(product), // 🔴 Regional / Global အတွက် စျေးနှုန်းတွက်ထုတ်ခြင်း
  }));

  const popularRegionSlugs = ['sg-my-th-3', 'sea-5', 'europe-33', 'asia-11'];

  mapped.sort((a, b) => {
    const indexA = popularRegionSlugs.indexOf(a.id);
    const indexB = popularRegionSlugs.indexOf(b.id);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  return mapped;
};

const getStartingTab = (tab?: string): 'country' | 'regional' | 'global' => {
  if (tab === 'region' || tab === 'regional') return 'regional';
  if (tab === 'global') return 'global';
  return 'country';
};

const CustomSelect = ({ 
  value, 
  options, 
  onChange,
  buttonClassName
}: { 
  value: number, 
  options: readonly { label: string, value: number }[], 
  onChange: (val: number) => void,
  buttonClassName?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div ref={wrapperRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 bg-white border border-solid rounded-xl focus:outline-none transition-all cursor-pointer font-['Poppins'] select-none ${
          isOpen ? 'border-blue-400 ring-2 ring-blue-100 text-blue-600' : 'border-slate-200 text-slate-800 hover:border-blue-300 hover:text-blue-600 hover:bg-slate-50'
        } ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-500'}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] z-50 w-36 bg-white border border-solid border-slate-200 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col font-['Poppins']">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-3 text-[12px] sm:text-[13px] text-left transition-colors w-full cursor-pointer ${
                value === option.value 
                  ? 'bg-blue-50 text-blue-600 font-bold' 
                  : 'text-slate-700 font-semibold hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CountrySelection({ onSelectCountry, openAllCountries, onOpenAllCountriesHandled, initialTab }: CountrySelectionProps) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'country' | 'regional' | 'global'>(getStartingTab(initialTab));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getStartingTab(initialTab));
    }
  }, [initialTab]);

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

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const effectivePerPage = isMobile ? 220 : pageSize;

      const currentFetchKey = `${activeTab}_${pageToLoad}_${effectivePerPage}_${cleanSearch}`;
      if (lastFetchTrackerRef.current === currentFetchKey) {
        return;
      }
      lastFetchTrackerRef.current = currentFetchKey;

      setLoading(true);
      try {
        const response = await fetchProductsPaginated({
          type: typeFilter,
          perPage: effectivePerPage,
          page: isMobile ? 1 : pageToLoad,
          search: cleanSearch ? cleanSearch : undefined,
        });

        if (disposed) return;

        if (activeTab === 'country') {
          const apiCountries = mapCountryProducts(response.items);
          const existingNames = new Set(apiCountries.map(c => c.name.toLowerCase()));

          const isAllSelected = effectivePerPage >= 220;
          const isLastPage = response.meta ? response.meta.current_page === response.meta.last_page : true;
          const shouldShowComingSoon = isAllSelected || isLastPage || cleanSearch.length > 0;

          let filteredComingSoon: ProductWithVariation[] = [];

          if (shouldShowComingSoon) {
            filteredComingSoon = COMING_SOON_COUNTRIES
              .filter(c => !existingNames.has(c.name.toLowerCase()))
              .filter(c => !cleanSearch || c.name.toLowerCase().includes(cleanSearch.toLowerCase()))
              .map(c => ({
                id: `coming-soon-${c.code}`,
                name: c.name,
                code: c.code.toUpperCase(),
                flag_image: `https://flagcdn.com/w160/${c.code}.png`,
                type: 'local',
                startingPrice: 0,
                isComingSoon: true,
              }));
          }

          setAllCountries([...apiCountries, ...filteredComingSoon]);
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

          const mappedGlobal = mapProductsToRegions(pureGlobalProducts).sort((a, b) => {
            return a.country_count - b.country_count;
          });

          setGlobalPackages(mappedGlobal);
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
      <div className="mt-8 w-full font-['Poppins'] relative hidden sm:block">
        <div className="flex flex-wrap items-center justify-end gap-2 select-none">
          <CustomSelect 
            value={pageSize} 
            options={PAGE_SIZE_OPTIONS} 
            onChange={(newSize) => { 
              setPageSize(newSize); 
              setPage(1); 
            }}
            buttonClassName="px-4 py-2 font-semibold text-xs lg:text-[13px] w-[136px]"
          />

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
                  isActive 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-[0_6px_18px_rgba(37,99,235,0.35)] scale-105' 
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                } ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-white' : ''}`}
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
    <div className="mobile-typography-fix w-full pt-20 sm:pt-28 pb-20 sm:pb-28 font-['Poppins'] text-slate-900">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
                    : 'bg-white text-slate-800 border-blue-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500 border-t-transparent" />
          </div>
        )}

        {!loading && activeTab === 'country' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allCountries.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-900 font-semibold text-xs lg:text-[13px] font-['Poppins']">{t('noDestinationsFound')}</div>
              ) : (
                allCountries.map(item => {
                  if (item.isComingSoon) {
                    return (
                      <div
                        key={item.id}
                        className="group flex flex-row items-center bg-slate-50/80 border border-dashed border-slate-300 rounded-2xl p-3.5 sm:p-4 opacity-75 cursor-not-allowed select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {renderFlagAvatar(item.flag_image, item.name, getFlagEmoji(item.code))}
                          <div className="flex flex-col min-w-0 flex-1 space-y-0.5 text-left">
                            <span className="font-semibold text-slate-700 text-sm sm:text-[15px] truncate tracking-tight font-['Poppins']">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-1 text-amber-600 text-[10px] font-bold mt-1">
                              <Clock className="w-3 h-3" />
                              <span>Coming Soon</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
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
                            {t('startingFrom')} <span className="text-slate-900 font-semibold text-[10px] sm:text-[12px] whitespace-nowrap no-underline decoration-0">MMK {item.startingPrice.toLocaleString('en-US')}</span>
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold font-['Poppins']">{t('tapToViewPlanDetails')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {renderPaginationSection(countryMeta, setCountryPage, allCountries.length)}
          </>
        )}

        {/* 🌟 REGIONAL TAB (Starting from MMK price ကို ထည့်သွင်းပေးထားပါသည်) */}
        {!loading && activeTab === 'regional' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {regions.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-900 font-semibold text-xs lg:text-[13px] font-['Poppins']">{t('noRegionalPlansFound')}</div>
              ) : (
                regions.map(region => (
                  <div
                    key={region.id}
                    onClick={() => onSelectCountry({ id: region.id, name: region.name, code: 'REG', flagUrl: region.flag_image, type: 'regional', popular: false }, 'all')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectCountry({ id: region.id, name: region.name, code: 'REG', flagUrl: region.flag_image, type: 'regional', popular: false }, 'all');
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
                          <h5 className="text-[11px] sm:text-sm font-semibold text-slate-900 mb-0.5 truncate tracking-tight font-['Poppins'] m-0">
                            {region.name}
                          </h5>
                          
                          {/* 🔴 Starting Price ဖော်ပြခြင်း 🔴 */}
                          {region.startingPrice > 0 ? (
                            <p className="text-[9px] sm:text-[11px] font-semibold text-slate-800 font-['Poppins'] whitespace-nowrap m-0">
                              {t('startingFrom')} <span className="text-slate-900 font-semibold text-[10px] sm:text-[12px]">MMK {region.startingPrice.toLocaleString('en-US')}</span>
                            </p>
                          ) : region.country_count > 0 ? (
                            <p className="text-slate-800 text-[10px] sm:text-[11px] font-semibold font-['Poppins'] m-0">{region.country_count} {t('countries')}</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold text-left mt-1 font-['Poppins'] m-0">{t('tapToViewPlanDetails')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {renderPaginationSection(regionalMeta, setRegionalPage, regions.length)}
          </>
        )}

        {/* 🌟 GLOBAL TAB (Starting from MMK price ကို ထည့်သွင်းပေးထားပါသည်) */}
        {!loading && activeTab === 'global' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {globalPackages.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-900 font-semibold text-xs lg:text-[13px] font-['Poppins']">{t('noGlobalPlansFound')}</div>
              ) : (
                globalPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectCountry({ id: pkg.id, name: pkg.name, code: 'GLB', flagUrl: pkg.flag_image, type: 'global', popular: false }, 'all')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectCountry({ id: pkg.id, name: pkg.name, code: 'GLB', flagUrl: pkg.flag_image, type: 'global', popular: false }, 'all');
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
                          <h5 className="text-[11px] sm:text-sm font-semibold text-slate-900 mb-0.5 truncate tracking-tight font-['Poppins'] m-0">
                            {pkg.name}
                          </h5>
                          
                          {/* 🔴 Starting Price ဖော်ပြခြင်း 🔴 */}
                          {pkg.startingPrice > 0 ? (
                            <p className="text-[9px] sm:text-[11px] font-semibold text-slate-800 font-['Poppins'] whitespace-nowrap m-0">
                              {t('startingFrom')} <span className="text-slate-900 font-semibold text-[10px] sm:text-[12px]">MMK {pkg.startingPrice.toLocaleString('en-US')}</span>
                            </p>
                          ) : pkg.country_count > 0 ? (
                            <p className="text-slate-800 text-[10px] sm:text-[11px] font-semibold font-['Poppins'] m-0">{pkg.country_count} {t('countriesCovered')}</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold text-left mt-1 font-['Poppins'] m-0">{t('tapToViewPlanDetails')}</p>
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