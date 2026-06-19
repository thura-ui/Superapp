import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import faqData from '../lib/faqData';

interface FAQProps {
  onBack: () => void;
  initialCategory?: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  items: FAQItem[];
}

const sectionHeadingRegex = /^\d+\.\s/;
const numberedItemRegex = /^\d+\.\d+\.\s/;

// faqData moved to src/lib/faqData.ts

export default function FAQ({ onBack, initialCategory }: FAQProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Network');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!initialCategory) {
      return;
    }

    const category = faqData.find((cat) => cat.name === initialCategory);
    if (!category) {
      return;
    }

    setActiveCategory(category.name);
    setExpandedId(category.items[0]?.id ?? null);
  }, [initialCategory]);

  const currentCategoryData = faqData.find(cat => cat.name === activeCategory);

  const toggleExpand = (id: number) => {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative sticky top-0 z-10 bg-white/70 backdrop-blur-2xl border-b-2 border-white/60 shadow-xl">
        <div className="relative flex items-center justify-center px-4 py-3 sm:px-5 sm:py-5">
          <button
            onClick={onBack}
            className="absolute left-4 sm:left-5 p-2 sm:p-2.5 hover:bg-white/60 rounded-2xl transition-all backdrop-blur-sm shadow-lg group"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-gray-800 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-lg sm:text-2xl font-black text-gray-900">❓ FAQ</h1>
        </div>
      </div>

      <div className="relative bg-white/50 backdrop-blur-xl border-b-2 border-white/60">
        <div className="flex overflow-x-auto">
          {faqData.map((category) => (
            <button
              key={category.name}
              onClick={() => {
                setActiveCategory(category.name);
                setExpandedId(null);
              }}
              className={`flex-1 min-w-[110px] py-4 sm:py-5 text-sm sm:text-base font-black transition-all relative ${
                activeCategory === category.name
                  ? 'text-purple-600 bg-white/60'
                  : 'text-gray-600 hover:bg-white/30'
              }`}
            >
              {category.name}
              {activeCategory === category.name && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-500 rounded-t-xl shadow-md"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="relative px-4 sm:px-5 py-4 max-w-3xl mx-auto">
        <div className="space-y-4">
            {currentCategoryData?.items.map((item, index) => {
            const isTermsAndConditionsCategory = activeCategory === 'Terms & Conditions';

            return (
            <div key={item.id} className="relative overflow-hidden rounded-3xl shadow-lg">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                index % 4 === 0 ? 'from-purple-400/20 to-pink-500/20' :
                index % 4 === 1 ? 'from-blue-400/20 to-cyan-500/20' :
                index % 4 === 2 ? 'from-green-400/20 to-emerald-500/20' :
                'from-orange-400/20 to-amber-500/20'
              }`} />
              <div className="absolute inset-0 bg-white/40" />

              <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/60">
                <button
                  onClick={() => {
                    toggleExpand(item.id);
                  }}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-white/40 active:bg-white/50 transition-all"
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 text-left">
                    <span className={`font-black flex-shrink-0 text-base sm:text-lg w-6 h-6 rounded-full flex items-center justify-center ${
                      index % 4 === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white' :
                      index % 4 === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                      index % 4 === 2 ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                      'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
                    } shadow-lg`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-900 text-sm sm:text-base leading-relaxed font-bold">
                      {item.question}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0 ml-3 transition-transform ${
                      expandedId === item.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

              {expandedId === item.id && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2">
                  <div className="ml-8 sm:ml-10 relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-gray-100/50" />
                    <div className="relative bg-white/60 backdrop-blur-xl border-2 border-white/60 p-4 sm:p-5">
                      {isTermsAndConditionsCategory ? (
                        <div className="text-gray-800 text-sm sm:text-base font-medium text-justify">
                          {item.answer.split('\n').map((line, lineIndex) => {
                            const trimmedLine = line.trim();

                            if (!trimmedLine) {
                              return <div key={`line-${item.id}-${lineIndex}`} className="h-3" />;
                            }

                            const isSectionHeading = sectionHeadingRegex.test(trimmedLine);
                            const isNumberedItem = numberedItemRegex.test(trimmedLine);
                            const sectionHeadingMatch = trimmedLine.match(/^(\d+\.)\s(.+)$/);

                            return (
                              <p
                                key={`line-${item.id}-${lineIndex}`}
                                className={`leading-7 ${isSectionHeading ? 'mt-4 mb-2 font-bold' : ''} ${isNumberedItem ? 'mb-2.5' : 'mb-1.5'}`}
                              >
                                {isSectionHeading && sectionHeadingMatch ? (
                                  <>
                                    <span className="font-black">{sectionHeadingMatch[1]}</span>{' '}
                                    <span className="font-bold">{sectionHeadingMatch[2]}</span>
                                  </>
                                ) : (
                                  trimmedLine
                                )}
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        item.answer.split('\n\n').map((paragraph, pIdx) => (
                          <p
                            key={pIdx}
                            className={`whitespace-pre-line mb-4 last:mb-0 text-justify ${
                              pIdx < 2
                                ? 'text-gray-900 text-sm sm:text-base leading-7 font-semibold'
                                : 'text-gray-700 text-sm sm:text-base leading-7 font-medium'
                            }`}
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
    </div>
  );
}
