import { ArrowLeft, ChevronDown, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FAQProps {
  onBack: () => void;
  initialCategory?: string;
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

export default function FAQ({ onBack, initialCategory }: FAQProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('FAQs');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let baseUrl = null;
        
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PRODUCTS_API_BASE_URL) {
          // @ts-ignore
          baseUrl = import.meta.env.VITE_PRODUCTS_API_BASE_URL;
        } 
        else if (typeof process !== 'undefined' && process.env) {
          baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
        }

        if (!baseUrl) {
          throw new Error("API Base URL is not defined in the environment variables.");
        }

        const [faqsRes, termsRes, privacyRes] = await Promise.all([
          fetch(`${baseUrl}/faqs`),
          fetch(`${baseUrl}/terms`),
          fetch(`${baseUrl}/privacy`)
        ]);

        if (!faqsRes.ok || !termsRes.ok || !privacyRes.ok) {
          throw new Error("Network response was not ok");
        }

        const faqsData = await faqsRes.json();
        const termsData = await termsRes.json();
        const privacyData = await privacyRes.json();

        // FAQs Data
        const faqList = Array.isArray(faqsData) ? faqsData : (faqsData?.data || []);
        const formattedFaqs: InfoItem[] = faqList.map((item: any) => ({
          id: `faq-${item.id}`,
          question: item.question || item.title || 'Untitled FAQ',
          answer: item.answer || item.content || 'No content available.',
          isHtml: true 
        }));

        // Categories သတ်မှတ်ခြင်း
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

        setCategories(fetchedCategories);

        const defaultCategory = initialCategory || 'FAQs';
        setActiveCategory(defaultCategory);

        // စာမျက်နှာစဝင်ချိန်တွင် အလိုအလျောက် ပွင့်မနေစေရန် null ထားသည်
        setExpandedId(null);

      } catch (err: any) {
        console.error("Failed to fetch API data:", err);
        setError(err.message === "API Base URL is not defined in the environment variables." 
          ? "Configuration error: API Base URL is missing. Please check your .env file." 
          : "Unable to load data. Please check your network connection or try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [initialCategory]);

  const currentCategoryData = categories.find(cat => cat.name === activeCategory);

  const toggleExpand = (id: string | number) => {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
  };

  return (
    <div className="w-full bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfb_100%)] relative overflow-hidden pb-12 min-h-screen font-['Poppins']">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[12%] -left-[6%] w-[44%] h-[44%] bg-cyan-400/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-[8%] -right-[10%] w-[40%] h-[40%] bg-emerald-400/12 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-6 md:pb-10">
        <div className="flex items-center gap-2.5 text-left">
          {/* 🔴 User Guide မိုဘိုင်းလ် Back Button စတိုင်လ်အတိုင်း ပြင်ဆင်ထားပါသည် 🔴 */}
          <button
            onClick={onBack}
            type="button"
            className="p-1.5 md:hidden rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-3xl font-semibold text-slate-900 tracking-tight leading-none m-0 truncate">
              Frequently asked questions
            </h3>
            <p className="text-xs md:text-sm font-semibold text-slate-500 mt-2">
              Find instant answers, terms, and policies regarding Simless travel eSIM.
            </p>
          </div>
        </div>
      </div>

      {/* Loading UI */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 relative z-10 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-slate-500 font-semibold text-sm">Loading data...</p>
        </div>
      ) : error ? (
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 text-red-600">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="space-y-4">
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
                        <span className={`text-sm sm:text-base leading-snug font-semibold tracking-tight transition-colors ${
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

                    {isExpanded && (
                      <div className="overflow-hidden px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
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
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}