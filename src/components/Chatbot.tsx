import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
}

export default function Chatbot({ onClose, initialQuestion = null, initialAnswer = null }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Simless travel eSIM assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    },
    { 
      id: '2', 
      text: 'Or contact our support team directly at +959943229667, +959251167248.', 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Initial Question/Answer if provided from props
  useEffect(() => {
    if (initialQuestion && initialAnswer) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: initialQuestion,
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          text: initialAnswer,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [initialQuestion, initialAnswer]);

  // Safe Link Renderer
  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const isViber = part.includes('viber');
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={
              isViber
                ? "inline-flex items-center gap-1 mt-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all no-underline"
                : "text-blue-600 underline font-medium break-all"
            }
          >
            {isViber ? '💬 Open Viber Chat' : part}
          </a>
        );
      }
      return part;
    });
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userQuery = inputText.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userQuery,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Calling Supabase Edge Function named 'chat'
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userQuery }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data?.reply || "I am having trouble processing your request.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot Error:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I am currently offline. Please contact support on Viber: https://viber.click/959943229667",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    /* 🔴 mobile-typography-fix class ကို ထည့်သွင်း၍ index.css ရှိ mobile CSS နှင့် ချိတ်ဆက်ပေးထားပါသည် 🔴 */
    <div className="mobile-typography-fix fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 w-full sm:w-[380px] h-[85vh] sm:h-[550px] sm:max-h-[85vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col border border-blue-100 font-['Poppins'] animate-slide-up overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-t-3xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white leading-tight">Simless Assistant</h2>
            <p className="text-[11px] text-white/90 font-medium">Online | eSIM Support</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50/30 to-white">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-br-none shadow-sm'
                : 'bg-white border border-blue-100 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              <div className="text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-wrap">
                {renderMessageContent(message.text)}
              </div>
              <p className={`text-[9px] mt-1 text-right ${message.sender === 'user' ? 'text-white/80' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-none px-3.5 py-2 text-gray-500 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-3 bg-white border-t border-blue-100 rounded-b-3xl">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about eSIM..."
            className="flex-1 px-4 py-2.5 rounded-full border border-blue-200 focus:border-blue-500 focus:outline-none text-xs sm:text-sm font-normal bg-blue-50/20"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:from-blue-700 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-none cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}