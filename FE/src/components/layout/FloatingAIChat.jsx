import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, User, HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  
export default function FloatingAIChat() {
  const { user, balance, riskProfile, xp, streak, goals } = useAuth();
  const location = useLocation();
  const userName = user?.name || 'Bạn';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Xin chào ${userName}! Tôi là Cố vấn học tập AI của SAVE+. Bạn cần tôi giải thích hay tư vấn gì về tài chính không?`
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, isOpen]);

  const presetPrompts = [
    'Lãi kép là gì?',
    'Nên chọn ETF nào?',
    'Đa dạng hóa danh mục'
  ];

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          chatType: 'chatbox',
          userContext: {
            name: user?.name,
            balance,
            riskProfile,
            xp,
            streak,
            goals,
            subscription: user?.subscription || 'Free',
            route_context: location.pathname
          }
        })
      });

      const data = await res.json();
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response || 'Tôi không nhận được phản hồi, vui lòng thử lại.'
      }]);
    } catch (err) {
      console.error('Floating Chat API error:', err);
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Lỗi kết nối đến máy chủ AI.'
      }]);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-teal to-brand-green text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold">AI Mentor Trợ Lý S+</h3>
                <span className="text-[10px] text-teal-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Đang hoạt động • Gemini 2.5
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-slate-950/20 min-h-0">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] ${msg.sender === 'bot' ? 'bg-gradient-to-tr from-brand-teal to-brand-green text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {msg.sender === 'bot' ? <Bot size={12} /> : <User size={12} />}
                </div>
                <div className={`p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs' : 'bg-brand-teal text-white shadow-xs'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-teal to-brand-green text-white flex items-center justify-center shrink-0">
                  <Bot size={12} />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 rounded-2xl text-[11px] flex items-center gap-1 shadow-xs">
                  <Loader2 size={12} className="animate-spin text-brand-teal" />
                  <span>AI đang soạn câu trả lời...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Preset options */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {presetPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="py-1 px-2.5 bg-slate-50 hover:bg-brand-teal/5 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded-full transition-all cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center shrink-0"
          >
            <input 
              type="text" 
              placeholder="Nhập câu hỏi tại đây..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-teal text-slate-800 dark:text-white"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="p-2 bg-brand-teal text-white rounded-xl disabled:opacity-40 hover:bg-brand-teal/95 transition-all cursor-pointer border-none shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-brand-teal to-brand-green text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
    </div>
  );
}
