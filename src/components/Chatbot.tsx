import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import faqData from '../lib/faqData';

interface ChatbotProps {
  onClose: () => void;
  initialQuestion?: string | null;
  initialAnswer?: string | null;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  meta?: string | null;
}

export default function Chatbot({ onClose, initialQuestion = null, initialAnswer = null }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Thunn, your travel eSIM assistant.  How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    },
    { id: '2', text: 'Or contact to our support team at +959943229667, +959251167248,', 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If FAQ opened a question, inject that Q/A into the chat on mount
  useEffect(() => {
    if (initialQuestion) {
      const userMessage: Message = {
        id: `faq-user-${Date.now()}`,
        text: initialQuestion,
        sender: 'user',
        timestamp: new Date()
      };

      const botReplyText = initialAnswer ?? getBotResponse(initialQuestion).text;
      const botMessage: Message = {
        id: `faq-bot-${Date.now()+1}`,
        text: botReplyText,
        sender: 'bot',
        timestamp: new Date(),
      };

      // append with small delay to simulate typing
      setTimeout(() => setMessages(prev => [...prev, userMessage, botMessage]), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const resp = getBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: resp.text,
        sender: 'bot',
        timestamp: new Date(),
        meta: resp.meta || null,
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBestFAQMatch = (text: string) => {
    const normalize = (s: string) => s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const stopWords = new Set([
      'a', 'an', 'the', 'to', 'of', 'for', 'in', 'on', 'at', 'is', 'are', 'am', 'i', 'my', 'me', 'we', 'our',
      'you', 'your', 'it', 'this', 'that', 'can', 'could', 'do', 'does', 'did', 'how', 'what', 'when', 'where',
      'why', 'with', 'and', 'or', 'if', 'after', 'before', 'from', 'by', 'be', 'have', 'has', 'had'
    ]);

    const keywordGroups: Record<string, string[]> = {
      install: ['install', 'setup', 'scan', 'qr', 'download', 'add', 'cellular', 'plan'],
      activate: ['activate', 'activation', 'active', 'enable', 'start', 'roaming'],
      network: ['network', 'signal', 'connect', 'connection', 'coverage', 'apn', 'operator'],
      transfer: ['transfer', 'move', 'change', 'another', 'phone', 'device', 'switch'],
      data: ['data', 'balance', 'remaining', 'usage', 'check', 'left'],
      purchase: ['buy', 'purchase', 'paid', 'payment', 'trip', 'before', 'immediately'],
      refund: ['refund', 'exchange', 'cancel', 'cancelled', 'return', 'money', 'policy']
    };

    const tokenize = (s: string) => {
      const base = normalize(s).split(' ').filter(Boolean);
      const expanded = new Set<string>();

      for (const token of base) {
        if (stopWords.has(token)) continue;
        expanded.add(token);

        if (token.endsWith('ing') && token.length > 5) expanded.add(token.slice(0, -3));
        if (token.endsWith('ed') && token.length > 4) expanded.add(token.slice(0, -2));
        if (token.endsWith('s') && token.length > 3) expanded.add(token.slice(0, -1));

        for (const groupTokens of Object.values(keywordGroups)) {
          if (groupTokens.includes(token)) {
            for (const alias of groupTokens) expanded.add(alias);
          }
        }
      }

      return [...expanded];
    };

    const levenshtein = (s: string, t: string) => {
      const m = s.length;
      const n = t.length;
      if (m === 0) return n;
      if (n === 0) return m;
      const v0 = new Array(n + 1).fill(0);
      const v1 = new Array(n + 1).fill(0);
      for (let j = 0; j <= n; j++) v0[j] = j;
      for (let i = 0; i < m; i++) {
        v1[0] = i + 1;
        for (let j = 0; j < n; j++) {
          const cost = s[i] === t[j] ? 0 : 1;
          v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
        for (let j = 0; j <= n; j++) v0[j] = v1[j];
      }
      return v1[n];
    };

    const userText = normalize(text);
    const userTokens = tokenize(text);
    if (!userText || userTokens.length === 0) return null;

    const userTokenSet = new Set(userTokens);

    let best: { item: typeof faqData[number]['items'][number]; score: number } | null = null;

    for (const cat of faqData) {
      for (const item of cat.items) {
        const questionText = normalize(item.question);
        const answerText = normalize(item.answer);
        const questionTokens = tokenize(item.question);
        const answerTokens = tokenize(item.answer).slice(0, 30);
        const faqTokenSet = new Set([...questionTokens, ...answerTokens]);

        let overlapCount = 0;
        userTokenSet.forEach((token) => {
          if (faqTokenSet.has(token)) overlapCount += 1;
        });
        const unionCount = new Set([...userTokenSet, ...faqTokenSet]).size || 1;
        const tokenOverlapScore = overlapCount / unionCount;

        const qDist = levenshtein(userText, questionText);
        const qMaxLen = Math.max(userText.length, questionText.length) || 1;
        const qSimilarity = 1 - qDist / qMaxLen;

        const containsBoost = questionText.includes(userText) || userText.includes(questionText) ? 0.2 : 0;

        const answerBoost = userTokens.some((token) => answerText.includes(token)) ? 0.08 : 0;

        const score = (tokenOverlapScore * 0.6) + (qSimilarity * 0.32) + containsBoost + answerBoost;

        if (!best || score > best.score) {
          best = { item, score };
        }
      }
    }

    if (best && best.score >= 0.3) return best.item;
    return null;
  };

  const getBotResponse = (userInput: string): { text: string; meta?: string | null } => {
    const input = userInput || '';

    const faqMatch = getBestFAQMatch(input);
    if (faqMatch) {
      return { text: faqMatch.answer };
    }

    const low = input.toLowerCase();
    if (low.includes('website') || low.includes('web') || low.includes('site') || low.includes('simless') || low.includes('provider') || low.includes('company') || low.includes('page')) {
      return { text: 'You can visit our official website at https://simless-mm.com/ for more information about our services, plans, and support.' };
    }
    if (low.includes('install') || low.includes('setup')) {
      return { text: 'To install your eSIM, go to Settings > Cellular > Add eSIM, then scan your QR code or enter details manually. Need step-by-step instructions?' };
    }
    if (low.includes('activate') || low.includes('activation')) {
      return { text: 'Your eSIM will activate automatically when you arrive at your destination. Make sure to turn on Data Roaming for your eSIM line.' };
    }
    if (low.includes('data') || low.includes('usage')) {
      return { text: 'You can check your data usage in the "My Data" section of the app. It shows your remaining data, validity period, and usage history.' };
    }
    if (low.includes('apn') || low.includes('network')) {
      return { text: 'If you\'re having connectivity issues, try these APN settings: Name: eSIM, APN: internet. You can find detailed APN settings in the Help Center.' };
    }
    if (low.includes('price') || low.includes('cost') || low.includes('buy')) {
      return { text: 'Prices vary by country and data amount. Select your destination from the home screen to see available plans and pricing.' };
    }
    if (low.includes('support') || low.includes('help') || low.includes('contact')) {
      return { text: 'You can reach our support team at +959943229667, +959251167248,(Mon-Fri, 9:00-5:00). Or continue chatting with me!' };
    }
    if (low.includes('thank')) {
      return { text: 'You\'re welcome! Is there anything else I can help you with?' };
    }

    return { text: 'I\'m here to help with eSIM installation, activation, data plans, and troubleshooting. What would you like to know more about?' };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md h-[80vh] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-slide-up">
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-t-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Thunn</h2>
                <p className="text-sm text-white/90 font-semibold">Your eSIM Assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-orange-50/30 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                    : 'bg-white border-2 border-orange-100 text-gray-800'
                }`}
              >
                    <p className="text-sm font-semibold">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t-2 border-orange-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-full border-2 border-orange-200 focus:border-orange-400 focus:outline-none text-sm font-semibold"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
