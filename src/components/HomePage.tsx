import { useState, useEffect, useRef } from 'react';
import { Globe, Star, CheckCircle2, Quote, ChevronDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPopularProducts, type ProductItem } from '../lib/productsApi';
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

interface InfoItem {
  id: string | number;
  question: string;
  answer: string;
  isHtml: boolean;
}

interface CategoryData {
  name: string;
  items: InfoItem[];
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

  // Mobile Review Infinite Carousel States & Refs
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // FAQ States
  const [faqCategories, setFaqCategories] = useState<CategoryData[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('FAQs');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [isFaqLoading, setIsFaqLoading] = useState<boolean>(true);
  const [faqError, setFaqError] = useState<string | null>(null);

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
        if (popularFilter === 'region') {
          const customOrder = ['sg-my-th-3', 'sea-5', 'europe-33', 'asia-11'];
          
          products.sort((a, b) => {
            const indexA = customOrder.indexOf(a.slug);
            const indexB = customOrder.indexOf(b.slug);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
          });
        } 
        else if (popularFilter === 'country') {
          const countryOrderSlugs = [
            'china',
            'thailand',
            'japan',
            'vietnam',
            'singapore',
            'malaysia',
            'south-korea',
            'indonesia',
            'taiwan-china',
            'macau-china',
            'turkey',
            'russia'
          ];

          products.sort((a, b) => {
            const indexA = countryOrderSlugs.indexOf(a.slug);
            const indexB = countryOrderSlugs.indexOf(b.slug);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
          });
        }

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

  // Fetch FAQ Data with Anti-Cache Pattern
  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        setIsFaqLoading(true);
        setFaqError(null);
        
        let baseUrl = null;
        
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PRODUCTS_API_BASE_URL) {
          baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
        } 
        else if (typeof process !== 'undefined' && process.env) {
          baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
        }

        if (!baseUrl) {
          throw new Error("API Base URL is not defined in the environment variables.");
        }

        const timestamp = new Date().getTime();
        const appendAntiCache = (url: string) => `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
        
        const antiCacheHeaders = {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };

        const [faqsRes, termsRes, privacyRes] = await Promise.all([
          fetch(appendAntiCache(`${baseUrl}/faqs`), { headers: antiCacheHeaders }),
          fetch(appendAntiCache(`${baseUrl}/terms`), { headers: antiCacheHeaders }),
          fetch(appendAntiCache(`${baseUrl}/privacy`), { headers: antiCacheHeaders })
        ]);

        if (!faqsRes.ok || !termsRes.ok || !privacyRes.ok) {
          throw new Error("Network response was not ok");
        }

        const faqsData = await faqsRes.json();
        const termsData = await termsRes.json();
        const privacyData = await privacyRes.json();

        const faqList = Array.isArray(faqsData) ? faqsData : (faqsData?.data || []);
        const formattedFaqs: InfoItem[] = faqList.map((item: any) => ({
          id: `faq-${item.id}`,
          question: item.question || item.title || 'Untitled FAQ',
          answer: item.answer || item.content || 'No content available.',
          isHtml: true 
        }));

        const fetchedCategories: CategoryData[] = [
          {
            name: 'FAQs',
            items: formattedFaqs.length > 0 ? formattedFaqs : [
              { id: 'no-faq', question: 'FAQs', answer: 'No frequently asked questions available at the moment.', isHtml: false }
            ]
          },
          {
            name: 'Terms & Conditions',
            items: [
              {
                id: `terms-${termsData?.id || '1'}`,
                question: termsData?.title || 'Terms & Conditions',
                answer: termsData?.content || 'Terms and Conditions content is not available.',
                isHtml: true
              }
            ]
          },
          {
            name: 'Privacy Policy',
            items: [
              {
                id: `privacy-${privacyData?.id || '1'}`,
                question: privacyData?.title || 'Privacy Policy',
                answer: privacyData?.content || 'Privacy Policy content is not available.',
                isHtml: true
              }
            ]
          }
        ];

        setFaqCategories(fetchedCategories);
        setActiveCategory('FAQs');
        
        setExpandedId(null);

      } catch (err: any) {
        console.error("Failed to fetch FAQ API data:", err);
        setFaqError(err.message === "API Base URL is not defined in the environment variables." 
          ? "Configuration error: API Base URL is missing. Please check your .env file." 
          : "Unable to load FAQs. Please check your network connection or try again later.");
      } finally {
        setIsFaqLoading(false);
      }
    };

    fetchFaqData();
  }, []);

  const currentCategoryData = faqCategories.find(cat => cat.name === activeCategory);

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const stepBanners = [
    { id: 1, src: '/steps-banner1.png', alt: 'Check Compatibility' },
    { id: 2, src: '/steps-banner2.png', alt: 'Select a Plan' },
    { id: 3, src: '/steps-banner3.png', alt: 'Download eSIM' },
    { id: 4, src: '/steps-banner4.png', alt: 'Stay Connected' },
  ];

  const benefitCards = [
    { 
      id: 1, 
      engImg: '/benefits-cards ENG/benefits-cards01.png', 
      burmeseImg: '/benefits-cards BURMESE/benefits-cards01.png', 
      alt: 'Instant Activation'
    },
    { 
      id: 2, 
      engImg: '/benefits-cards ENG/benefits-cards02.png', 
      burmeseImg: '/benefits-cards BURMESE/benefits-cards02.png', 
      alt: 'High Speed'
    },
    { 
      id: 3, 
      engImg: '/benefits-cards ENG/benefits-cards03.png', 
      burmeseImg: '/benefits-cards BURMESE/benefits-cards03.png', 
      alt: 'Roaming Free'
    },
    { 
      id: 4, 
      engImg: '/benefits-cards ENG/benefits-cards04.png', 
      burmeseImg: '/benefits-cards BURMESE/benefits-cards04.png', 
      alt: 'Reliable Support'
    },
    { 
      id: 5, 
      engImg: '/benefits-cards ENG/benefits-cards05.png', 
      burmeseImg: '/benefits-cards BURMESE/benefits-cards05.png', 
      alt: '100% Refund Guarantee'
    },
    { 
      id: 6, 
      engImg: '/benefits-cards ENG/benefits-cards06.png', 
      burmeseImg: '/benefits-cards BURMESE/benefits-cards06.png', 
      alt: 'Shareable Data'
    },
  ];

  const userReviews = [
    {
      id: 1,
      name: "Eaint Twaltar Oo",
      handle: "@twaltar",
      avatar: "/eaint-twaltar-oo.png",
      rating: 5,
      tag: "Verified Traveler",
      text: "အရမ်း အဆင်ပြေခဲ့သော e sim လေးပါ ' လိုင်းလဲ အရမ်းမြန်တယ် ဈေးလဲ သက်သာတယ် ဘယ်နိုင်ငံ သွားသွား သူပဲ ဝယ်သွားတော့မှာပါ touch down / cellular data on you have ur internet... very nice and perfect .😍",
      fbUrl: "https://www.facebook.com/1200678941/posts/10236846034309578/?mibextid=wwXIfr&rdid=hHsMyuC4CG7cWBVg&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JRSKasphZ%2F%3Fmibextid%3DwwXIfr#",
    },
    {
      id: 2,
      name: "Kaung Htun",
      handle: "@drakehtun",
      avatar: "/kaung-htuun.png",
      rating: 5,
      tag: "Thailand eSIM",
      text: "I bought one week eSIM package for Thailand in June. It was very easy and instant activation when you arrived at the airport. The speed is very good too. 100% satisfaction and highly recommended!!!",
      fbUrl: "https://www.facebook.com/500344966/posts/10151935256144967/?mibextid=wwXIfr&rdid=J4AOTiSTCw3woMdZ#",
    },
    {
      id: 3,
      name: "Lyn Yupar",
      handle: "@lynyupar",
      avatar: "/lynn-yupar.png",
      rating: 5,
      tag: "Malaysia & Indonesia",
      text: "Malaysia, Indonesia ခရီးစဉ်တစ်လျှောက်လုံး Simless သုံးရတာအရမ်းအဆင်ပြေလို့ highly recommend ပါရှင်။ လိုင်းဆွဲအားလည်း ရှယ်ပဲ။",
      fbUrl: "https://www.facebook.com/100003759931295/posts/3781009872034307/?mibextid=wwXIfr&rdid=oLGWmvnMrc1maR6Q#",
    },
    {
      id: 4,
      name: "Noe Noe",
      handle: "@aye.myatnoe.98",
      avatar: "/noe-noe.png",
      rating: 5,
      tag: "Japan 10 Days Trip",
      text: "Japan Trip 10ရက်လုံး Simless က Travel Esim နဲ့ အရမ်းကိုအဆင်ပြေခဲ့ရပါတယ်ရှင် ၊တကယ်ကို လွယ်လွယ်ကူကူမြန်မြန်ဆန်ဆန်နဲ့ ခရီးစဉ် တောက်လျှောက် သုံးရတာတကယ်ကို ကျေနပ်ခဲ့ရပါတယ် 🤩",
      fbUrl: "https://www.facebook.com/100009889364769/posts/2685392058467080/?mibextid=wwXIfr&rdid=mJURtm0cjLejfmLn#",
    },
    {
      id: 5,
      name: "Than Wynn",
      handle: "@than.wynn",
      avatar: "/Than-wynn.png",
      rating: 5,
      tag: "China 15GB Package",
      text: "eSIM 15GB/7Days package ဝယ်ပြီး တရုတ်နိုင်ငံ ချုံချင်း-ရူလုံ-ကျန်ကျားကျဲ မြို့တွေမှာ အင်တာနက်သုံးခဲ့တာ လိုင်းလည်းကောင်း၊ သုံးရတာလည်း လွယ်ကူလို့ အရမ်းကို အဆင်ပြေတယ်ဗျာ။",
      fbUrl: "https://www.facebook.com/100001446523025/posts/27571425092489004/?mibextid=wwXIfr&rdid=fquBsMsKbKdqwVLS#",
    },
    {
      id: 6,
      name: "Exodus Nhkum",
      handle: "@exodusnhkum",
      avatar: "/exodus.png",
      rating: 5,
      tag: "Global Traveler",
      text: "Simless ရဲ့ data packages တွေရွေးချယ်ဝယ်ယူရတာကော မေးရင်လဲချက်ချင်းပြန်ဖြေပေးတာကော အရမ်းအဆင်ပြေလို့ ခရီးသွားတိုင်းသုံးဖြစ်တယ်။",
      fbUrl: "https://www.facebook.com/100004128363817/posts/3623527474461496/?mibextid=wwXIfr&rdid=R2EsF8b2y6FKYL9H#",
    }
  ];

  const extendedReviews = [...userReviews, userReviews[0], userReviews[1]];
  const totalOriginal = userReviews.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setReviewIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reviewIndex === totalOriginal) {
      const resetTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setReviewIndex(0);
      }, 700);

      return () => clearTimeout(resetTimeout);
    }
  }, [reviewIndex, totalOriginal]);

  const handleReviewTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleReviewTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleReviewTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (diff > swipeThreshold) {
      setIsTransitioning(true);
      setReviewIndex((prev) => prev + 1);
    } else if (diff < -swipeThreshold) {
      setIsTransitioning(true);
      setReviewIndex((prev) => (prev === 0 ? totalOriginal - 1 : prev - 1));
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="mobile-typography-fix space-y-0 font-['Poppins'] text-slate-900">
      <HomeBannerCarousel onExplorePlans={() => onExplorePlans()} onSelectCountry={onSelectCountry} />

    {/* 🟢 Trending eSIM Plans & What is eSIM Combined Section 🟢 */}
      <section className="pt-2 sm:pt-16 pb-6 sm:pb-10 transform-gpu relative z-10 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <motion.h3 
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            style={{ willChange: "transform, opacity" }}
            className="text-lg sm:text-2xl font-semibold text-slate-900 text-center -mt-2 sm:mt-0 mb-5 sm:mb-8 tracking-tight font-['Poppins'] whitespace-nowrap leading-none"
          >
            {t('trendingPlans')}
          </motion.h3>
          
          {/* Filter Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            style={{ willChange: "transform, opacity" }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex rounded-2xl bg-white border border-slate-200 p-1.5 shadow-[0_8px_25px_rgba(15,23,42,0.06)] transition-all">
              {(['country', 'region'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPopularFilter(tab)}
                  className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all border-none cursor-pointer font-['Poppins'] whitespace-nowrap ${
                    popularFilter === tab
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200/80 scale-[1.02]'
                      : 'bg-transparent text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('country') === 'Country' && tab === 'country' ? 'Country' : t('region') === 'Region' && tab === 'region' ? 'Region' : tab === 'country' ? t('country') : t('region')}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Product Cards Grid */}
              <div className={`grid grid-cols-1 ${popularFilter === 'region' ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'} mx-1 sm:mx-0`}>
                {popularPlans.slice(0, 12).map((plan, index) => {
                  const isRegion = popularFilter === 'region' || plan.type === 'regional' || plan.type === 'global';
                  let rawDisplayName = isRegion && plan.countryCount > 0 && !plan.name.includes('countries')
                    ? `${plan.name} (${t('countriesCount', { count: plan.countryCount })})`
                    : plan.name;

                  const displayName = rawDisplayName
                    .replace(/\+/g, '+\u200B')
                    .replace(/\(\s*(\d+)\s+(countries|နိုင်ငံ)\s*\)/gi, '($1\u00A0$2)');

                  if (isRegion) {
                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: (index % 4) * 0.1,
                          ease: [0.16, 1, 0.3, 1] 
                        }}
                        viewport={{ once: false, amount: 0.15 }}
                        style={{ willChange: "transform, opacity" }}
                        onClick={() => onSelectCountry(plan)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onSelectCountry(plan);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="group overflow-hidden bg-white border border-solid border-blue-500 rounded-[28px] transition-all duration-300 hover:scale-[1.02] hover:border-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.2)] flex flex-col cursor-pointer w-full transform-gpu"
                      >
                        <div className="w-full h-44 sm:h-44 bg-slate-50 overflow-hidden relative shrink-0">
                          <img 
                            src={plan.secondaryCoverImage || plan.flagImage} 
                            alt={plan.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>

                        <div className="p-4 sm:p-5 flex-grow bg-gradient-to-b from-sky-50/20 to-white flex flex-col justify-between">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-solid border-slate-200 bg-blue-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              {plan.flagImage ? (
                                <img src={plan.flagImage} alt={plan.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <Globe className="w-4 h-4 text-blue-600" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1 text-left">
                              <h5 className="text-[11px] sm:text-sm font-semibold text-slate-900 mb-0.5 truncate tracking-tight font-['Poppins'] m-0">
                                {displayName}
                              </h5>
                              
                              {plan.startingPrice > 0 ? (
                                <p className="text-[9px] sm:text-[11px] font-semibold text-slate-800 font-['Poppins'] whitespace-nowrap m-0">
                                  {t('startingFrom')} <span className="text-slate-900 font-semibold text-[10px] sm:text-[12px]">MMK {plan.startingPrice.toLocaleString('en-US')}</span>
                                </p>
                              ) : plan.countryCount > 0 ? (
                                <p className="text-slate-800 text-[10px] sm:text-[11px] font-semibold font-['Poppins'] m-0">{plan.countryCount} {t('countriesCovered')}</p>
                              ) : null}
                            </div>
                          </div>
                          
                          <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold text-left mt-1 font-['Poppins'] m-0">{t('tapToViewPlanDetails')}</p>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: (index % 4) * 0.1,
                        ease: [0.16, 1, 0.3, 1] 
                      }}
                      viewport={{ once: false, amount: 0.15 }}
                      style={{ willChange: "transform, opacity" }}
                      onClick={() => onSelectCountry(plan)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectCountry(plan);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="group flex flex-row items-center bg-white border border-solid border-blue-500 rounded-[20px] p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] hover:border-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.2)] cursor-pointer transform-gpu"
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
                          <span className="font-semibold text-slate-900 text-sm sm:text-[15px] truncate tracking-tight font-['Poppins'] leading-tight whitespace-nowrap block">
                            {displayName}
                          </span>
                          
                          <p className="text-[9px] sm:text-[11px] font-semibold text-slate-800 font-['Poppins'] whitespace-nowrap m-0">
                            {t('startingFrom')} <span className="text-slate-900 font-semibold text-[10px] sm:text-[12px] whitespace-nowrap">MMK {plan.startingPrice.toLocaleString('en-US')}</span>
                          </p>
                          
                          <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold tracking-wide font-['Poppins'] m-0">{t('tapToViewPlanDetails')}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 🟢 1. See All Button (ကတ်များ၏ အောက်တွင် ထားရှိပါသည်) 🟢 */}
              {popularPlans.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  viewport={{ once: false, amount: 0.2 }}
                  className="flex justify-center mt-6 sm:mt-10 mb-6 sm:mb-8"
                >
                  <button
                    onClick={() => onExplorePlans(popularFilter)}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm tracking-wide rounded-xl shadow-md shadow-blue-200/50 hover:shadow-blue-300/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer font-['Poppins'] whitespace-nowrap"
                  >
                    {popularFilter === 'country' ? t('seeAllCountries') : t('seeAllRegions')}
                  </button>
                </motion.div>
              )}

              {popularPlans.length === 0 && (
                <div className="text-center text-slate-900 font-semibold mt-8 mb-6 font-['Poppins']">
                  {t('noPopularPlans', { filter: popularFilter })}
                </div>
              )}
            </>
          )}

          {/* 🟢 2. What is eSIM Banner (See All Button ၏ အောက်ဘက်သို့ ရွှေ့ထားပါသည်) 🟢 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: false, amount: 0.2 }}
            className="w-full relative overflow-hidden mt-2 sm:mt-4"
          >
            {/* Desktop View */}
            <div className="hidden md:flex w-full justify-center">
              <img 
                src={i18n.language === 'my' ? "/whatiseSIM-web-burmese.jpg" : "/whatiseSIM-web-english.jpg"} 
                alt={i18n.language === 'my' ? "eSIM ဆိုတာဘာလဲ" : "What is eSIM"} 
                className="w-full h-auto object-contain rounded-2xl shadow-sm"
              />
            </div>

            {/* Mobile View */}
            <div className="flex md:hidden w-full justify-center px-0 py-0 overflow-hidden">
              <img 
                src={i18n.language === 'my' ? "/whatis-eSIM-mobile-myan.png" : "/whatis-eSIM-mobile-eng1.png"} 
                alt={i18n.language === 'my' ? "eSIM ဆိုတာဘာလဲ" : "What is eSIM"} 
                className="w-full h-auto object-contain rounded-xl block"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* How it works Section */}
      <section 
        id="how-it-works-section"
        className="py-12 sm:py-16 bg-cover bg-center bg-no-repeat overflow-hidden relative transform-gpu"
        style={{ backgroundImage: "url('/steps-BG.jpg')" }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            style={{ willChange: "transform, opacity" }}
            className="text-center mb-8"
          >
            <h3 className="text-lg sm:text-3xl font-semibold text-slate-900 tracking-tight font-['Poppins'] whitespace-nowrap leading-none m-0">
              {t('howItWorks')}
            </h3>
            <p className={`text-slate-800 text-xs sm:text-[13px] font-semibold uppercase tracking-wider font-['Poppins'] ${i18n.language === 'my' ? 'mt-3' : 'mt-1'}`}>
              {t('fourSimpleSteps')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-8">
            {stepBanners.map((step, index) => (
              <motion.div 
                key={step.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                viewport={{ once: false, amount: 0.2 }}
                style={{ willChange: "transform, opacity" }}
                className="flex flex-col items-center justify-center cursor-pointer group transform-gpu"
              >
                <div className="w-full flex items-center justify-center transition-transform duration-300 ease-out group-hover:-translate-y-2">
                  <img 
                    src={step.src} 
                    alt={step.alt} 
                    className="w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(15,23,42,0.08)] group-hover:drop-shadow-[0_18px_35px_rgba(37,99,235,0.25)] transition-all duration-300 ease-out group-hover:scale-[1.04]"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Simless Section */}
      <section className="py-10 sm:py-14 w-full relative z-10 transform-gpu">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h3 
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            style={{ willChange: "transform, opacity" }}
            className="text-lg sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-10 text-center tracking-tight font-['Poppins'] leading-none whitespace-nowrap m-0"
          >
            {t('whyChoose', 'Why choose Simless ?')}
          </motion.h3>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {benefitCards.map((card) => {
              const isBurmese = i18n.language?.startsWith('my');
              const cardSrc = isBurmese ? card.burmeseImg : card.engImg;

              return (
                <motion.div 
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: false, amount: 0.2 }}
                  className="rounded-2xl sm:rounded-[24px] overflow-hidden border border-blue-200/80 bg-white transition-all duration-300 hover:scale-[1.03] hover:border-blue-400 shadow-[0_4px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.2)] cursor-pointer h-full w-full flex items-center justify-center"
                >
                  <img 
                    src={cardSrc} 
                    alt={card.alt} 
                    className="w-full h-full object-cover block rounded-2xl sm:rounded-[24px]"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Review Section */}
      <section className="py-20 sm:py-28 w-full bg-gradient-to-b from-[#f0f7ff] via-[#e2effe] to-[#f8fafc] select-none relative overflow-hidden transform-gpu">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-300/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-sky-200/80 shadow-sm mb-4">
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 tracking-wide font-['Poppins'] !whitespace-normal">
                {t('reviewRatingBadge', '4.9 / 5.0 Rating by 10,000+ Travelers')}
              </span>
            </div>

            <h3 className="text-lg sm:text-3xl font-semibold text-slate-900 mb-4 tracking-tight font-['Poppins'] leading-snug m-0">
              {t('trustedByTravelers', 'Check out what fellow travelers are saying about Simless!')}
            </h3>

            <p className="text-slate-600 text-xs sm:text-sm lg:text-base mt-3 max-w-xl mx-auto font-medium font-['Poppins'] opacity-90 leading-relaxed">
              {t('trustedByTravelersDesc', 'Trusted connectivity solutions worldwide with instant activation and high-speed data.')}
            </p>
          </motion.div>

          <div className="block md:hidden w-full overflow-hidden relative">
            <div 
              onTouchStart={handleReviewTouchStart}
              onTouchMove={handleReviewTouchMove}
              onTouchEnd={handleReviewTouchEnd}
              className="flex"
              style={{ 
                transform: `translateX(-${reviewIndex * 100}%)`,
                transition: isTransitioning ? 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
              }}
            >
              {extendedReviews.map((review, idx) => (
                <div key={`${review.id}-${idx}`} className="min-w-full px-2">
                  <div 
                    onClick={() => window.open(review.fbUrl, '_blank', 'noopener,noreferrer')}
                    className="bg-white/90 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] border border-sky-100 hover:border-blue-300 transition-all duration-300 group overflow-hidden cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors">{review.name}</h4>
                          <span className="text-[11px] text-blue-600 font-semibold truncate block">{review.handle}</span>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">f</div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 break-words">
                      {review.text}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <div className="flex text-amber-400 gap-0.5 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 min-w-0 truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {review.tag}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-6">
              {userReviews.map((_, index) => {
                const isActive = reviewIndex % totalOriginal === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setIsTransitioning(true);
                      setReviewIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 border-none cursor-pointer ${
                      isActive ? 'w-6 bg-blue-600' : 'w-2 bg-blue-200'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="hidden md:block columns-2 lg:columns-3 gap-6 space-y-6 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -60, y: 40 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              onClick={() => window.open(userReviews[0].fbUrl, '_blank', 'noopener,noreferrer')}
              className="break-inside-avoid-column bg-white/90 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] border border-sky-100 hover:border-blue-300 hover:shadow-[0_18px_35px_rgba(37,99,235,0.12)] transition-all duration-300 group hover:-translate-y-1 overflow-hidden cursor-pointer transform-gpu"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={userReviews[0].avatar} alt={userReviews[0].name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors">{userReviews[0].name}</h4>
                    <span className="text-[11px] text-blue-600 font-semibold truncate block">{userReviews[0].handle}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:scale-110 transition-transform">f</div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 break-words">
                {userReviews[0].text}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 min-w-0 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {userReviews[0].tag}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -70 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              onClick={() => window.open(userReviews[1].fbUrl, '_blank', 'noopener,noreferrer')}
              className="break-inside-avoid-column bg-white/90 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] border border-sky-100 hover:border-blue-300 hover:shadow-[0_18px_35px_rgba(37,99,235,0.12)] transition-all duration-300 group hover:-translate-y-1 overflow-hidden cursor-pointer transform-gpu"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={userReviews[1].avatar} alt={userReviews[1].name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors">{userReviews[1].name}</h4>
                    <span className="text-[11px] text-blue-600 font-semibold truncate block">{userReviews[1].handle}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:scale-110 transition-transform">f</div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 break-words">
                {userReviews[1].text}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 min-w-0 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {userReviews[1].tag}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              className="break-inside-avoid-column bg-gradient-to-br from-white via-blue-50/50 to-sky-50/80 rounded-[28px] p-7 sm:p-8 shadow-[0_15px_35px_rgba(37,99,235,0.1)] border-2 border-blue-500/30 flex flex-col justify-between hover:shadow-[0_22px_45px_rgba(37,99,235,0.18)] transition-all duration-300 group hover:scale-[1.02] relative overflow-hidden min-h-[380px] sm:min-h-[420px] transform-gpu"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex-1 flex flex-col">
                <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-80 shrink-0" />
                <p className="!text-base sm:!text-lg text-slate-900 !font-semibold !leading-relaxed tracking-tight mb-8 font-['Poppins'] break-words flex-1">
                  Simless is an affordable, easy-to-use, and sustainable eSIM service that gives reliable mobile and internet connections from anywhere in the world. That's why travelers choose Simless as their trusted eSIM partner.
                </p>
              </div>

              <div className="pt-4 border-t border-blue-200/60 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span className="!font-semibold !text-xs sm:!text-sm text-blue-600 tracking-wide font-['Poppins'] truncate">
                    SIMLESS
                  </span>
                </div>
                <span className="bg-blue-600 text-white !text-[10px] sm:!text-[11px] !font-semibold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 whitespace-nowrap shadow-sm">
                  {t('topChoice', 'Top Choice')}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 70 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              onClick={() => window.open(userReviews[2].fbUrl, '_blank', 'noopener,noreferrer')}
              className="break-inside-avoid-column bg-white/90 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] border border-sky-100 hover:border-blue-300 hover:shadow-[0_18px_35px_rgba(37,99,235,0.12)] transition-all duration-300 group hover:-translate-y-1 overflow-hidden cursor-pointer transform-gpu"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={userReviews[2].avatar} alt={userReviews[2].name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors">{userReviews[2].name}</h4>
                    <span className="text-[11px] text-blue-600 font-semibold truncate block">{userReviews[2].handle}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:scale-110 transition-transform">f</div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 break-words">
                {userReviews[2].text}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 min-w-0 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {userReviews[2].tag}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -50, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              onClick={() => window.open(userReviews[3].fbUrl, '_blank', 'noopener,noreferrer')}
              className="break-inside-avoid-column bg-white/90 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] border border-sky-100 hover:border-blue-300 hover:shadow-[0_18px_35px_rgba(37,99,235,0.12)] transition-all duration-300 group hover:-translate-y-1 overflow-hidden cursor-pointer transform-gpu"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={userReviews[3].avatar} alt={userReviews[3].name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors">{userReviews[3].name}</h4>
                    <span className="text-[11px] text-blue-600 font-semibold truncate block">{userReviews[3].handle}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:scale-110 transition-transform">f</div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 break-words">
                {userReviews[3].text}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 min-w-0 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {userReviews[3].tag}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              onClick={() => window.open(userReviews[4].fbUrl, '_blank', 'noopener,noreferrer')}
              className="break-inside-avoid-column bg-white/90 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] border border-sky-100 hover:border-blue-300 hover:shadow-[0_18px_35px_rgba(37,99,235,0.12)] transition-all duration-300 group hover:-translate-y-1 overflow-hidden cursor-pointer transform-gpu"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={userReviews[4].avatar} alt={userReviews[4].name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors">{userReviews[4].name}</h4>
                    <span className="text-[11px] text-blue-600 font-semibold truncate block">{userReviews[4].handle}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:scale-110 transition-transform">f</div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 break-words">
                {userReviews[4].text}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 min-w-0 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {userReviews[4].tag}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, y: 40 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              onClick={() => window.open(userReviews[5].fbUrl, '_blank', 'noopener,noreferrer')}
              className="break-inside-avoid-column bg-white/90 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_30px_rgba(37,99,235,0.06)] border border-sky-100 hover:border-blue-300 hover:shadow-[0_18px_35px_rgba(37,99,235,0.12)] transition-all duration-300 group hover:-translate-y-1 overflow-hidden cursor-pointer transform-gpu"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={userReviews[5].avatar} alt={userReviews[5].name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors">{userReviews[5].name}</h4>
                    <span className="text-[11px] text-blue-600 font-semibold truncate block">{userReviews[5].handle}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:scale-110 transition-transform">f</div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 break-words">
                {userReviews[5].text}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 min-w-0 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {userReviews[5].tag}
                </span>
              </div>
            </motion.div>

          </div>

          <div className="flex justify-center mt-14 sm:mt-16">
            <a
              href="https://www.facebook.com/share/19F8GUa43Q/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-9 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs sm:text-sm font-semibold font-['Poppins'] shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.5)] active:scale-95 transition-all cursor-pointer inline-block no-underline text-center whitespace-nowrap"
            >
              {t('moreReviews', 'See More Facebook Reviews')}
            </a>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 w-full bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfb_100%)] relative overflow-hidden font-['Poppins']">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[12%] -left-[6%] w-[44%] h-[44%] bg-blue-400/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[8%] -right-[10%] w-[40%] h-[40%] bg-sky-400/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h3 className="text-lg sm:text-3xl font-semibold text-slate-900 tracking-tight leading-none whitespace-nowrap m-0">
              Frequently asked questions
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
              Find instant answers, terms, and policies regarding Simless travel eSIM.
            </p>
          </div>

          {isFaqLoading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-t-transparent" />
              <p className="text-slate-500 font-semibold text-sm">Loading data...</p>
            </div>
          ) : faqError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 text-red-600">
              <AlertCircle className="w-7 h-7 flex-shrink-0" />
              <p className="font-semibold text-sm">{faqError}</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentCategoryData?.items.map((item) => {
                const isExpanded = expandedId === item.id;

                return (
                  <div 
                    key={item.id} 
                    className={`relative overflow-hidden rounded-[24px] bg-white/60 backdrop-blur-md border transition-all duration-300 group cursor-pointer ${
                      isExpanded 
                        ? 'border-blue-500/50 shadow-[0_12px_35px_rgba(37,99,235,0.18)] bg-white/80' 
                        : 'border-blue-500/10 hover:border-blue-500/40 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.15)]'
                    }`}
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-white/40 active:bg-white/50 transition-all text-left border-0 cursor-pointer bg-transparent outline-none select-none"
                      >
                        <div className="flex items-center flex-1 text-left">
                          <span className={`text-xs sm:text-base leading-snug font-semibold tracking-tight transition-colors ${
                            isExpanded ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                          }`}>
                            {item.question}
                          </span>
                        </div>
                        
                        <ChevronDown
                          className={`w-5 h-5 text-slate-500 flex-shrink-0 ml-3 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-blue-600' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden px-5 sm:px-6 pb-5 sm:pb-6 pt-1"
                          >
                            <div className="relative overflow-hidden rounded-2xl">
                              <div className="absolute inset-0 bg-white/90 backdrop-blur-md" />
                              <div className="relative border border-solid border-blue-100 p-4 sm:p-5 rounded-2xl shadow-inner">
                                {item.isHtml ? (
                                  <div 
                                    className="text-slate-700 text-xs sm:text-sm font-normal text-left 
                                                [&>p]:mb-3 [&>p]:leading-relaxed [&>p:last-child]:mb-0
                                                [&>p>strong]:font-bold [&>p>strong]:text-slate-900 [&>p>strong]:block [&>p>strong]:mt-3 [&>p>strong]:mb-1
                                                [&_br]:my-1
                                                [&_a]:text-blue-600 [&_a]:underline"
                                    dangerouslySetInnerHTML={{ __html: item.answer }}
                                  />
                                ) : (
                                  item.answer.split('\n\n').map((paragraph, pIdx) => (
                                    <p
                                      key={pIdx}
                                      className="whitespace-pre-line mb-3 last:mb-0 text-left text-slate-700 text-xs sm:text-sm leading-relaxed font-normal"
                                    >
                                      {paragraph}
                                    </p>
                                  ))
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}