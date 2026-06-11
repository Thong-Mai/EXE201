import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Send, Bot, User, Compass, HelpCircle } from 'lucide-react';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AIMentor() {
  const { user, balance, riskProfile, xp, streak, goals } = useAuth();
  const userName = user?.name || 'Lâm';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Xin chào ${userName}! Tôi là Cố vấn học tập AI của SAVE+. \n\nTôi ở đây để giải thích mọi thuật ngữ tài chính, gợi ý lộ trình học tập, hoặc cùng bạn làm rõ các khái niệm như lãi suất kép, đa dạng hóa danh mục và ETF. \n\n*Lưu ý: Tôi chỉ cung cấp kiến thức giáo dục và không đưa ra lời khuyên mua bán chứng khoán.*`
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const presetPrompts = [
    'Nên gửi tiết kiệm hay đầu tư?',
    'Quỹ ETF là gì?',
    'Giải thích về Đa dạng hóa danh mục',
    'Làm thế nào để tránh bẫy lừa đảo Ponzi?'
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
          chatType: 'mentor',
          userContext: {
            name: user?.name,
            balance,
            riskProfile,
            xp,
            streak,
            goals,
            subscription: user?.subscription || 'Free'
          }
        })
      });

      const data = await res.json();
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response || 'Tôi chưa nhận được phản hồi tốt từ hệ thống, hãy thử hỏi lại nhé!'
      }]);
    } catch (err) {
      console.error('Chat API error:', err);
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Có lỗi kết nối đến máy chủ AI. Vui lòng thử lại sau.'
      }]);
    }
  };

  return (
    <div className="h-[calc(100vh-150px)] flex flex-col justify-between space-y-4 fade-in">
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/40 shrink-0">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <Compass size={22} className="text-brand-teal" />
            <span>AI Mentor Học Tập S+</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Người bạn đồng hành giải đáp thắc mắc tài chính 24/7 theo phương pháp gợi mở Socratic.</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-brand-teal text-xs font-bold flex items-center space-x-1">
          <Bot size={14} />
          <span>Trực tuyến • Gemini 2.5</span>
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start space-x-3.5 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar icon */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'bot' ? 'bg-gradient-to-tr from-brand-teal to-brand-green text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line border ${msg.sender === 'bot' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs' : 'bg-brand-teal text-white border-brand-teal shadow-md shadow-teal-500/5'}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing bubble */}
        {typing && (
          <div className="flex items-start space-x-3.5 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-teal to-brand-green text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts list */}
      <div className="space-y-2 shrink-0">
        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center space-x-1">
          <HelpCircle size={12} className="text-brand-teal" />
          <span>Gợi ý câu hỏi bắt đầu:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presetPrompts.map(p => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-brand-teal/10 dark:bg-slate-900/60 dark:hover:bg-brand-teal/15 border border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Text inputs */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
        className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm shrink-0"
      >
        <input 
          type="text" 
          placeholder="Hỏi AI Mentor về lãi kép, ETF hoặc quản lý ngân sách..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-white"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="p-2.5 bg-brand-teal text-white rounded-xl disabled:opacity-50 hover:bg-brand-teal/95 shadow-md transition-all cursor-pointer shrink-0 border-none flex items-center justify-center"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
