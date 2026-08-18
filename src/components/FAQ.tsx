import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
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

        // Active Category သတ်မှတ်ခြင်း
        const defaultCategory = initialCategory || 'FAQs';
        setActiveCategory(defaultCategory);

        // Auto-expand the first item of the selected category
        const activeCatData = fetchedCategories.find(c => c.name === defaultCategory);
        if (activeCatData && activeCatData.items.length > 0) {
          setExpandedId(activeCatData.items[0].id);
        }

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
      <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex items-center gap-3 text-left">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors -ml-2 md:hidden cursor-pointer border-0 bg-transparent"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="min-w-0">
            {/* 🌟 Font weight ကို Navbar အတိုင်း font-semibold သို့ ပြောင်းလဲထားပါသည် */}
            <h1 className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tight">
              Help Center
            </h1>
            {/* 🌟 Subtitle ကို font-semibold ပြောင်းလဲထားပါသည် */}
            <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">
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
        <>
          {/* Categories / Tabs */}
          <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex flex-wrap gap-2.5 sm:gap-3 border-b border-solid border-slate-200/60 pb-4">
              {categories.map((category) => {
                const isActive = activeCategory === category.name;
                return (
                  <button
                    key={category.name}
                    onClick={() => {
                      setActiveCategory(category.name);
                      setExpandedId(category.items[0]?.id || null);
                    }}
                    /* 🌟 Tab Button များတွင် font-semibold သို့ ပြောင်းလဲထားပါသည် */
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm sm:text-[14px] transition-all duration-300 border border-solid cursor-pointer whitespace-nowrap active:scale-95 shadow-sm ${
                      isActive
                        ? 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : 'bg-white/70 border-slate-200/80 text-slate-700 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-600'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Cards Section */}
          <div className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              {currentCategoryData?.items.map((item, index) => (
                <div key={item.id} className="relative overflow-hidden rounded-[28px] shadow-[0_18px_50px_rgba(15,23,42,0.06)] border border-solid border-white/80">
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    index % 4 === 0 ? 'from-purple-400/10 to-pink-500/10' :
                    index % 4 === 1 ? 'from-blue-400/10 to-cyan-500/10' :
                    index % 4 === 2 ? 'from-green-400/10 to-emerald-500/10' :
                    'from-orange-400/10 to-amber-500/10'
                  }`} />
                  <div className="absolute inset-0 bg-white/65 backdrop-blur-xl" />

                  <div className="relative">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/40 active:bg-white/50 transition-all text-left border-0 cursor-pointer bg-transparent"
                    >
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 text-left">
                        {/* 🌟 Badge Number ကို font-semibold ပြောင်းလဲထားပါသည် */}
                        <span className={`font-semibold flex-shrink-0 text-base sm:text-lg w-6 h-6 rounded-full flex items-center justify-center ${
                          index % 4 === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white' :
                          index % 4 === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                          index % 4 === 2 ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                          'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
                        } shadow-md`}>
                          {index + 1}
                        </span>
                        {/* 🌟 Question Text ကို font-semibold ပြောင်းလဲထားပါသည် */}
                        <span className="text-slate-900 text-base leading-snug font-semibold tracking-tight mt-0.5">
                          {item.question}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-500 flex-shrink-0 ml-3 transition-transform ${
                          expandedId === item.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {expandedId === item.id && (
                      <div className="px-6 pb-6 pt-1">
                        <div className="ml-0 sm:ml-10 relative overflow-hidden rounded-2xl">
                          <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />
                          <div className="relative border border-solid border-white/80 p-5 rounded-2xl">
                            
                            {/* HTML tags များကို မှန်ကန်စွာ Render လုပ်ပေးမည့်အပိုင်း */}
                            {item.isHtml ? (
                              <div 
                                className="text-slate-700 text-sm sm:text-base font-semibold text-justify 
                                           [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:text-slate-900
                                           [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-slate-900
                                           [&>h4]:text-md [&>h4]:font-semibold [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:text-slate-900
                                           [&>p]:mb-3 [&>p]:leading-7 [&>p:last-child]:mb-0
                                           [&>ol]:list-decimal [&>ol]:ml-6 [&>ol>li]:mb-2 [&>ol>li>p]:mb-0
                                           [&>ul]:list-disc [&>ul]:ml-6 [&>ul>li]:mb-2 [&>ul>li>p]:mb-0
                                           [&>hr]:my-6 [&>hr]:border-slate-300
                                           [&_a]:text-cyan-600 [&_a]:underline
                                           [&_strong]:font-semibold [&_strong]:text-slate-900"
                                dangerouslySetInnerHTML={{ __html: item.answer }}
                              />
                            ) : (
                              item.answer.split('\n\n').map((paragraph, pIdx) => (
                                <p
                                  key={pIdx}
                                  className="whitespace-pre-line mb-4 last:mb-0 text-justify text-slate-700 text-sm sm:text-base leading-7 font-semibold"
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
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}