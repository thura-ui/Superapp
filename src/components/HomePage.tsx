import { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPopularProducts, fetchReviewSliders, type ProductItem, type ReviewSliderItem } from '../lib/productsApi';
import HomeBannerCarousel from './HomeBannerCarousel';
import type { Country } from '../types';
import { useTranslation } from 'react-i18next'; 

interface HomePageProps {
  onExplorePlans: (filterType?: 'country' | 'region') => void;
  onSelectCountry: (country: Country) => void;
}

interface PopularPlan extends Country {
  startingPrice: number;
  typeLabel: 'Country' | 'Region' | 'Global';
  countryCount: number;
  secondaryCoverImage?: string;
  flagImage?: string;
}

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const extractCountryCount = (name: string, description?: string): number => {
  const sourceText = `${name} ${description || ''}`;
  const match = sourceText.match(/(\d+)\s*countries/i) || sourceText.match(/(\d+)\s*နိုင်ငံ/);
  return match ? Number(match[1]) : 0;
};

const normalizeApiType = (rawType: string | undefined): 'local' | 'regional' | 'global' => {
  const type = (rawType || '').trim().toLowerCase();
  if (type === 'region' || type === 'regional') return 'regional';
  if (type === 'global') return 'global';
  return 'local';
};

const toTypeLabel = (rawType: string | undefined): 'Country' | 'Region' | 'Global' => {
  const type = (rawType || '').trim().toLowerCase();
  if (type === 'region' || type === 'regional') return 'Region';
  if (type === 'global') return 'Global';
  return 'Country';
};

export default function HomePage({ onExplorePlans, onSelectCountry }: HomePageProps) {
  const { t, i18n } = useTranslation();

  const [popularPlans, setPopularPlans] = useState<PopularPlan[]>([]);
  const [popularFilter, setPopularFilter] = useState<'country' | 'region'>('country');
  const [loading, setLoading] = useState<boolean>(true);
  
  const [reviewSliders, setReviewSliders] = useState<ReviewSliderItem[]>([]);
  const [reviewsLoading, setReviewLoading] = useState<boolean>(true);

  // Mobile Carousel Ref
  const reviewCarouselRef = useRef<HTMLDivElement>(null);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Desktop Carousel Ref
  const desktopCarouselRef = useRef<HTMLDivElement>(null);

  const scrollReviewCarousel = useCallback((direction: 'left' | 'right') => {
    const container = reviewCarouselRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('[data-review-card]');
    if (!cards.length) return;
    const nextIdx = direction === 'left'
      ? Math.max(0, activeReviewIndex - 1)
      : Math.min(cards.length - 1, activeReviewIndex + 1);
    (cards[nextIdx] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    setActiveReviewIndex(nextIdx);
  }, [activeReviewIndex]);

  const scrollToReviewIndex = useCallback((idx: number) => {
    const container = reviewCarouselRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('[data-review-card]');
    if (idx < 0 || idx >= cards.length) return;
    (cards[idx] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    setActiveReviewIndex(idx);
  }, []);

  const scrollDesktopCarousel = useCallback((direction: 'left' | 'right') => {
    const container = desktopCarouselRef.current;
    if (!container) return;
    const card = container.querySelector('[data-desktop-card]');
    if (!card) return;
    
    const scrollAmount = card.clientWidth + 24; 
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const container = reviewCarouselRef.current;
    if (!container) return;
    const onScroll = () => {
      const cards = container.querySelectorAll('[data-review-card]');
      if (!cards.length) return;
      const containerRect = container.getBoundingClientRect();
      const center = containerRect.left + containerRect.width / 2;
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveReviewIndex(closest);
    };
    container.addEventListener('scrollend', onScroll);
    container.addEventListener('scroll', onScroll);
    return () => {
      container.removeEventListener('scrollend', onScroll);
      container.removeEventListener('scroll', onScroll);
    };
  }, [reviewSliders]);

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

  useEffect(() => {
    setLoading(true);
    
    fetchPopularProducts({ type: popularFilter })
      .then(products => {
        const popular = products.map((target) => {
          const type = normalizeApiType(target.type);

          return {
            id: target.slug,
            name: target.name,
            code: (target.regions?.[0]?.mcc || 'UN').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2) || 'UN',
            flagUrl: target.flag_image, 
            flagImage: target.flag_image,
            secondaryCoverImage: target.secondary_cover_image,
            startingPrice: resolveStartingPrice(target),
            type,
            typeLabel: toTypeLabel(target.type),
            countryCount: extractCountryCount(target.name, target.description),
            popular: true,
          };
        });

        setPopularPlans(popular);
      })
      .catch((error) => {
        console.error('Failed to sync popular targets:', error);
        setPopularPlans([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [popularFilter]);

  useEffect(() => {
    setReviewLoading(true);

    fetchReviewSliders()
      .then(sliders => setReviewSliders(sliders))
      .catch((error) => {
        console.error('Failed to fetch review sliders:', error);
        setReviewSliders([]);
      })
      .finally(() => {
        setReviewLoading(false);
      });
  }, []);

  return (
    <div className="space-y-0 font-['Poppins'] text-slate-900">
      <HomeBannerCarousel onExplorePlans={() => onExplorePlans()} onSelectCountry={onSelectCountry} />

      {/* Trending eSIM plan Section */}
      <section className="pt-2 sm:pt-16 pb-8">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center -mt-4 sm:mt-0 mb-6 sm:mb-10 tracking-tight font-['Poppins']">
            {t('trendingPlans')}
          </h2>
          
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-2xl bg-white border border-slate-200 p-1.5 shadow-[0_8px_25px_rgba(15,23,42,0.06)] transition-all">
              {(['country', 'region'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPopularFilter(tab)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-[13px] sm:text-sm tracking-wide transition-all border-none cursor-pointer font-['Poppins'] ${
                    popularFilter === tab
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200/80 scale-[1.02]'
                      : 'bg-transparent text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'country' ? t('country') : t('region')}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mx-1 sm:mx-0">
                {popularPlans.slice(0, 12).map((plan) => {
                  const isRegion = popularFilter === 'region' || plan.type === 'regional' || plan.type === 'global';
                  const displayName = isRegion && plan.countryCount > 0 && !plan.name.includes('countries')
                    ? `${plan.name} (${t('countriesCount', { count: plan.countryCount })})`
                    : plan.name;

                  // REGION / GLOBAL CARD UI
                  if (isRegion) {
                    return (
                      <div
                        key={plan.id}
                        onClick={() => onSelectCountry(plan)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onSelectCountry(plan);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="group flex flex-col bg-white border border-solid border-slate-200 rounded-[28px] overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_25px_rgba(15,23,42,0.04)] hover:shadow-[0_15px_35px_rgba(15,23,42,0.12)] cursor-pointer"
                      >
                        <div className="w-full h-44 sm:h-48 bg-slate-50 overflow-hidden relative">
                          <img 
                            src={plan.secondaryCoverImage || plan.flagImage} 
                            alt={plan.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>

                        <div className="p-4 flex flex-row items-center gap-3 text-left border-t border-slate-100">
                          <div className="w-9 h-9 rounded-full border border-solid border-slate-200 bg-blue-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {plan.flagImage ? (
                              <img src={plan.flagImage} alt={plan.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <Globe className="w-4 h-4 text-blue-600" />
                            )}
                          </div>

                          <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
                            <span className="font-semibold text-slate-900 text-sm sm:text-[15px] truncate tracking-tight font-['Poppins']">
                              {displayName}
                            </span>
                            
                            {plan.countryCount > 0 ? (
                              <p className="text-[11px] text-slate-800 font-semibold font-['Poppins']">{t('countriesCount', { count: plan.countryCount })}</p>
                            ) : (
                              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-800 whitespace-nowrap font-['Poppins']">
                                {t('startingFrom')} <span className="text-slate-900 font-semibold text-[11px] sm:text-[12px]">Ks {plan.startingPrice.toLocaleString('en-US')}</span>
                              </p>
                            )}
                            
                            <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider pt-0.5 font-['Poppins']">{t('tapToViewDetails')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // COUNTRY / LOCAL CARD UI
                  return (
                    <div
                      key={plan.id}
                      onClick={() => onSelectCountry(plan)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectCountry(plan);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="group flex flex-row items-center bg-white border border-solid border-blue-500 rounded-[20px] p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] hover:border-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.2)] cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-solid border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                          {plan.flagImage ? (
                            <img src={plan.flagImage} alt={plan.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-xl leading-none">{getFlagEmoji(plan.code)}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col min-w-0 flex-1 space-y-0.5 text-left">
                          <span className="font-semibold text-slate-900 text-sm sm:text-[15px] truncate tracking-tight font-['Poppins']">
                            {displayName}
                          </span>
                          
                          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-800 whitespace-nowrap font-['Poppins']">
                            {t('startingFrom')} <span className="font-semibold text-slate-900 text-[10px] sm:text-[11px]">Ks {plan.startingPrice.toLocaleString('en-US')}</span>
                          </p>
                          
                          <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold tracking-wide font-['Poppins']">{t('tapToViewDetails')}</p>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {popularPlans.length > 0 && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => onExplorePlans(popularFilter)}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] sm:text-sm tracking-wide rounded-xl shadow-md shadow-blue-200/50 hover:shadow-blue-300/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer font-['Poppins']"
                  >
                    {popularFilter === 'country' ? t('seeAllCountries') : t('seeAllRegions')}
                  </button>
                </div>
              )}

              {popularPlans.length === 0 && (
                <div className="text-center text-slate-900 font-semibold mt-8 font-['Poppins']">
                  {t('noPopularPlans', { filter: popularFilter })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* How it works Section */}
      <section className="pt-10 pb-0 bg-gradient-to-b from-white to-slate-50/50 overflow-hidden relative selection:bg-cyan-500/10">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-4 relative z-10">
            <h2 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight font-['Poppins']">
              {t('howItWorks')}
            </h2>
            <p className={`text-slate-800 text-[13px] font-semibold uppercase tracking-wider font-['Poppins'] ${i18n.language === 'my' ? 'mt-3' : 'mt-1'}`}>
              {t('fourSimpleSteps')}
            </p>
          </div>
        </div>

        <div className="hidden md:flex justify-center items-center w-full overflow-visible -mt-2 sm:-mt-6 -mb-6 sm:-mb-12 relative z-0 px-4 sm:px-6 lg:px-8">
          <img 
            src="/How_does_Simless_eSIM_work_image.png" 
            alt="How It Works Flow Diagram" 
            className="w-full max-w-6xl h-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.02)] rounded-3xl"
          />
        </div>

        <div className="block md:hidden w-full mt-4 pb-4">
          <img 
            src="/How_does_Simless_eSIM_work_Mobilview_Image.png" 
            alt="How Simless eSIM works mobile view" 
            className="w-full h-auto block object-contain"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="pt-8 sm:pt-6 pb-16 relative z-10">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-3xl font-semibold text-slate-900 mb-6 sm:mb-10 tracking-tight font-['Poppins']">
            {t('whyChoose')}
          </h2>
        </div>
          
        <div className="hidden md:flex justify-center w-full overflow-visible px-4 sm:px-6 lg:px-8">
          <img 
            src="/Why_choose_Simless_eSIM_Image.png" 
            alt="Our Benefits" 
            className="w-full max-w-6xl h-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.03)]"
          />
        </div>

        <div className="block md:hidden w-full mt-4">
          <img 
            src="/image copy 3.png" 
            alt="Our Benefits mobile portrait view" 
            className="w-full max-w-6xl h-auto block object-contain"
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-14 sm:py-16 bg-slate-50/40 select-none">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center tracking-tight font-['Poppins']">
            {t('trustedByTravelers')}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base text-center mt-2 mb-8 sm:mb-10 max-w-lg mx-auto font-['Poppins'] leading-relaxed">
            {t('trustedByTravelersDesc')}
          </p>

          {reviewsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : reviewSliders.length > 0 ? (
            <>
              {/* Mobile: card carousel with side arrows (၁ ပုံစီပြမည်) */}
              <div className="relative sm:hidden">
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => scrollReviewCarousel('left')}
                    className="absolute left-1 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-all cursor-pointer"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div
                    ref={reviewCarouselRef}
                    className="w-full flex overflow-x-auto snap-x snap-mandatory gap-4 pb-1 scrollbar-hide px-10"
                  >
                    {reviewSliders.map((slider) => (
                      <div
                        key={slider.id}
                        data-review-card
                        className="snap-center shrink-0 w-full rounded-2xl overflow-hidden"
                      >
                        <img
                          src={slider.image_url}
                          alt={slider.alt_text || slider.title || `Review by ${slider.customer_name}`}
                          className="w-full h-auto object-cover block"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollReviewCarousel('right')}
                    className="absolute right-1 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-all cursor-pointer"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dot indicators */}
                {reviewSliders.length > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-4">
                    {reviewSliders.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => scrollToReviewIndex(idx)}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                          idx === activeReviewIndex
                            ? 'w-6 h-2 bg-blue-500'
                            : 'w-2 h-2 bg-slate-300'
                        }`}
                        aria-label={`Go to review ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* More Reviews button */}
                <div className="flex justify-center mt-5">
                  <a
                    href="https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full bg-blue-500 text-white text-sm font-medium font-['Poppins'] shadow-sm hover:bg-blue-600 active:scale-95 transition-all cursor-pointer inline-block no-underline"
                  >
                    {t('moreReviews')}
                  </a>
                </div>
              </div>

              {/* 🌟 Desktop: Card Box ကို ဖြုတ်၍ ပုံသီးသန့်သာပြသထားပါသည် 🌟 */}
              <div className="hidden sm:block relative mt-4 group">
                <button
                  type="button"
                  onClick={() => scrollDesktopCarousel('left')}
                  className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 active:scale-90 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div
                  ref={desktopCarouselRef}
                  className="w-full flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide px-2"
                >
                  {reviewSliders.map((slider) => (
                    <div
                      key={slider.id}
                      data-desktop-card
                      className="snap-start shrink-0 w-[calc(50%-0.75rem)] md:w-[calc(33.3333%-1rem)]"
                    >
                      <img
                        src={slider.image_url}
                        alt={slider.alt_text || slider.title || `Review by ${slider.customer_name}`}
                        className="w-full h-auto object-cover block rounded-2xl"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollDesktopCarousel('right')}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 active:scale-90 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* More Reviews button for Desktop */}
                <div className="flex justify-center mt-6">
                  <a
                    href="https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full bg-blue-500 text-white text-sm font-medium font-['Poppins'] shadow-sm hover:bg-blue-600 active:scale-95 transition-all cursor-pointer inline-block no-underline"
                  >
                    {t('moreReviews')}
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-900 font-semibold py-6 font-['Poppins']">
              {t('noReviews')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}