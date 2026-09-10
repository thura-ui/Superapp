import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts, type ProductItem } from '../lib/productsApi';
import { fetchBanners, type BannerItem } from '../lib/bannersApi';
import type { Country } from '../types';

interface HomeBannerCarouselProps {
  onExplorePlans: () => void;
  onSelectCountry: (country: Country) => void;
}

const AUTO_SLIDE_MS = 6000;   
const SEARCH_DEBOUNCE_MS = 300;

const mapProductToCountry = (product: ProductItem): Country => {
  const apiType = (product.type || '').toLowerCase();
  const mappedType: Country['type'] =
    apiType === 'regional' || apiType === 'region'
      ? 'regional'
      : apiType === 'global'
        ? 'global'
        : 'local';

  const regionCode = (product.regions?.[0]?.mcc || 'UN')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 2) || 'UN';

  return {
    id: product.slug,
    name: product.name,
    code: regionCode,
    flagUrl: product.flag_image || product.country_flag_url || product.flag_url,
    type: mappedType,
    popular: Boolean(product.is_popular || product.popular || product.featured),
  };
};

export default function HomeBannerCarousel({ onExplorePlans, onSelectCountry }: HomeBannerCarouselProps) {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Country[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchBanners()
      .then((items) => {
        const activeBanners = items.filter(b => b.is_active !== false);
        setBanners(activeBanners);
      })
      .catch(() => {
        setBanners([]);
      })
      .finally(() => {
        setBannerLoaded(true);
      });
  }, []);

  const displayBanners = isMobile ? banners.filter(b => b.id !== 2) : banners;
  const slideCount = displayBanners.length;
  const extendedBanners = slideCount > 0 ? [...displayBanners, displayBanners[0]] : [];

  useEffect(() => {
    if (slideCount <= 1) return;

    const shouldPause = isHovered || searchQuery.trim().length > 0 || showSuggestions;
    if (shouldPause) return;

    const timer = window.setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [slideCount, isHovered, searchQuery, showSuggestions, activeIndex]);

  useEffect(() => {
    if (activeIndex === slideCount && slideCount > 0) {
      const timer = window.setTimeout(() => {
        setIsTransitioning(false); 
        setActiveIndex(0); 
      }, 1200); 

      return () => window.clearTimeout(timer);
    }
  }, [activeIndex, slideCount]);

  useEffect(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      fetchProducts({ type: 'country', search: trimmed, perPage: 20 })
        .then((res: any) => {
          const productList = res?.items || [];
          const mapped = productList.map(mapProductToCountry);
          
          const filtered = mapped.filter((country: Country) =>
            country.name.toLowerCase().includes(trimmed) ||
            country.id.toLowerCase().includes(trimmed)
          );
          
          setSearchResults(filtered.length > 0 ? filtered : mapped);
        })
        .catch((err) => {
          console.error("Search fetch error:", err);
          setSearchResults([]);
        })
        .finally(() => setSearchLoading(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setActiveIndex(index);
  }, []);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      if (prev === 0) return slideCount - 1;
      return prev - 1;
    });
  }, [slideCount]);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      if (prev >= slideCount) return 0;
      return prev + 1;
    });
  }, [slideCount]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;
    
    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleSelectCountry = (country: Country) => {
    setShowSuggestions(false);
    setSearchQuery('');
    onSelectCountry(country);
  };

  const renderSearchBar = (customClass = "") => (
    <div ref={searchRef} className={`relative w-full z-50 ${customClass}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none z-10" />
      <input
        type="search"
        name="search_destination_input"
        id="search_destination_input"
        value={searchQuery}
        placeholder="Search Your Destination"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        data-lpignore="true"
        onFocus={() => setShowSuggestions(true)}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          setShowSuggestions(true);
        }}
        className="w-full pl-11 pr-5 py-3 sm:py-3.5 bg-white border border-solid border-slate-300 rounded-2xl text-slate-800 placeholder-slate-400 font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-500 tracking-wide transition-all shadow-md"
      />
      {showSuggestions && searchQuery.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-white rounded-2xl border border-solid border-slate-200 shadow-[0_15px_35px_rgba(0,0,0,0.2)] overflow-hidden max-h-56 overflow-y-auto scrollbar-hide">
          {searchLoading ? (
            <div className="px-4 py-3 text-xs text-slate-500 font-bold">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((country) => (
              <button
                key={country.id}
                type="button"
                onClick={() => handleSelectCountry(country)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 transition-colors border-0 border-b border-solid border-slate-100 last:border-b-0 cursor-pointer text-slate-800"
              >
                {country.flagUrl ? (
                  <img 
                    src={country.flagUrl} 
                    alt={country.name} 
                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 shadow-xs" 
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-blue-600">
                      {country.code !== 'UN' ? country.code : 'ESIM'}
                    </span>
                  </div>
                )}
                
                <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-800 truncate">
                  {country.name}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500 font-bold">No countries found.</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section
      className="relative overflow-visible w-full pb-6 sm:pb-10 select-none z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden w-full bg-white group/carousel transition-all duration-300"
      >
        {bannerLoaded && slideCount === 0 && (
          <div className="w-full h-36 sm:h-80 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center p-6 sm:p-10">
            <h1 className="text-sm sm:text-xl text-white font-bold">Banner data is currently unavailable.</h1>
          </div>
        )}

        <div
          className="flex flex-row w-full"
          style={{ 
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: isTransitioning ? 'transform 1200ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
          }}
        >
          {extendedBanners.map((banner, index) => (
            <div key={`${banner.id}-${index}`} className="min-w-full w-full shrink-0 relative overflow-hidden block">
              <img
                src={banner.image_url}
                alt=""
                className="w-full h-auto min-h-[180px] sm:min-h-[440px] lg:min-h-[520px] block object-cover object-center"
              />
              
              {banner.id === 2 && (
                <div className="hidden sm:flex absolute inset-0 z-10 pointer-events-none">
                  <div className="flex flex-col justify-center items-start pl-16 md:pl-20 lg:pl-24 w-1/2">
                    <div className="absolute left-14 top-[48%] z-20 w-[400px] pointer-events-auto">
                      {renderSearchBar()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {slideCount > 1 && (
          <>
            <div className="absolute bottom-4 sm:bottom-10 md:bottom-12 left-3 sm:left-10 lg:left-14 z-20 pointer-events-none hidden sm:block">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-black/40 backdrop-blur-md border border-solid border-white/40 text-white flex items-center justify-center opacity-0 sm:group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-black/60 active:scale-90 cursor-pointer shadow-lg pointer-events-auto"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
              </button>
            </div>

            <div className="absolute bottom-4 sm:bottom-10 md:bottom-12 right-3 sm:right-10 lg:right-14 z-20 pointer-events-none hidden sm:block">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-black/40 backdrop-blur-md border border-solid border-white/40 text-white flex items-center justify-center opacity-0 sm:group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-black/60 active:scale-90 cursor-pointer shadow-lg pointer-events-auto"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
              </button>
            </div>
          </>
        )}

        {slideCount > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
            {displayBanners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to banner ${index + 1}`}
                onClick={() => goToSlide(index)}
                className="h-1.5 sm:h-2 rounded-full transition-all duration-300 border-none cursor-pointer shadow-sm"
                style={{
                  width: index === activeIndex || (index === 0 && activeIndex === slideCount) ? '24px' : '6px',
                  backgroundColor: index === activeIndex || (index === 0 && activeIndex === slideCount) ? '#ffffff' : 'rgba(255,255,255,0.4)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {isMobile && (
        <div className="block sm:hidden mt-4 px-4 relative z-40">
          {renderSearchBar()}
        </div>
      )}
    </section>
  );
}