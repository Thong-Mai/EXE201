import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  AlertOctagon, 
  AlertTriangle, 
  Heart, 
  ShieldAlert, 
  User, 
  Flag, 
  Sparkles 
} from 'lucide-react';

const INITIAL_POSTS = [
  {
    id: 'P1',
    author: 'Trần Minh Hải',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    category: 'newbie',
    time: '2 giờ trước',
    title: 'Tại sao mua ETF VN30 lại an toàn hơn mua cổ phiếu đơn lẻ?',
    content: 'Mình mới tích lũy được 5 triệu đồng nhàn rỗi. Đang phân vân giữa việc mua mã cổ phiếu bất động sản đang hot trên mạng xã hội với việc mua chứng chỉ quỹ ETF VN30. Mong các bạn tư vấn giúp mình lý do ETF ít rủi ro hơn.',
    likes: 12,
    commentsCount: 5,
    flagged: false,
    flagReason: ''
  },
  {
    id: 'P2',
    author: 'Nguyễn Văn Đạt (Đạt Stock)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    category: 'expert',
    time: '5 giờ trước',
    title: '🚨 KÈO THƠM X10 TÀI SẢN MÃ CRYPTO ABC - VÀO GẤP KHÔNG LỠ TÀU! 🚀',
    content: 'Cơ hội đổi đời duy nhất năm 2026! Mã coin ABC đang có dòng tiền cá mập gom hàng, cam kết tăng trưởng ít nhất 1000% trong tuần tới. Bấm vào link dưới đây để nạp tiền vào sàn lướt sóng bao lỗ nhé anh em ơi...',
    likes: 1,
    commentsCount: 0,
    flagged: true,
    flagReason: 'Pump-and-dump / Dụ dỗ đầu tư mạo hiểm'
  },
  {
    id: 'P3',
    author: 'Phạm Thị Mỹ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    category: 'general',
    time: '1 ngày trước',
    title: 'Tự lập ngân sách 50/30/20 sau 3 tháng đầu tiên: Kết quả bất ngờ',
    content: 'Trước đây mình làm nhiêu tiêu sạch bấy nhiêu. Nhờ áp dụng công cụ chia ví tiết kiệm trên ứng dụng SAVE+, mình đã gom được quỹ dự phòng khẩn cấp trị giá 12 triệu đồng. Cảm giác có tấm đệm tài chính giúp mình tự tin hơn hẳn khi đi làm!',
    likes: 24,
    commentsCount: 9,
    flagged: false,
    flagReason: ''
  }
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  
  // Create post states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('newbie');
  const [activeFilter, setActiveFilter] = useState('all'); // all, newbie, general, expert

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const freshPost = {
      id: 'P' + Date.now(),
      author: user?.name || 'Lâm Nguyễn',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      category: newCategory,
      time: 'Vừa xong',
      title: newTitle,
      content: newContent,
      likes: 0,
      commentsCount: 0,
      flagged: false,
      flagReason: ''
    };

    // Filter pump-and-dump keyword detection before posting
    const scamKeywords = ['bao lỗ', 'x10 tài sản', 'lãi ngày', 'cam kết 100%', 'phím mã', 'crypto rác', '1%/ngày'];
    const hasScam = scamKeywords.some(w => newContent.toLowerCase().includes(w) || newTitle.toLowerCase().includes(w));
    
    if (hasScam) {
      freshPost.flagged = true;
      freshPost.flagReason = 'Tự động phát hiện ngôn từ dụ dỗ đầu cơ (Pump-and-dump)';
    }

    setPosts([freshPost, ...posts]);
    setNewTitle('');
    setNewContent('');
  };

  const handleReportPost = (id, reason) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          flagged: true,
          flagReason: reason
        };
      }
      return p;
    }));
  };

  const handleLike = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const filteredPosts = posts.filter(p => activeFilter === 'all' || p.category === activeFilter);

  return (
    <div className="space-y-6 fade-in">
      
      {/* 1. Header & Community Policy Banner */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
          <MessageSquare size={24} className="text-brand-teal" />
          <span>Cộng Đồng Học Tập & Thảo Luận Lành Mạnh</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Cùng chia sẻ kinh nghiệm tích lũy tài chính, học tập, đặt câu hỏi cho các chuyên gia và học viên khác.</p>
      </div>

      {/* Security Rule Warning */}
      <div className="p-4 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3">
        <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="block text-xs font-bold text-slate-800 dark:text-rose-400">Chính sách bảo vệ người học (Chống Pump-and-Dump)</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Để bảo vệ những nhà đầu tư mới bắt đầu khỏi rủi ro lừa đảo, <strong>SAVE+ nghiêm cấm mọi hành vi hô hào mua cổ phiếu lướt sóng, phím mã, kêu gọi vốn ảo, đa cấp.</strong> Hệ thống AI và đội ngũ điều trị viên sẽ tự động gắn cờ cảnh báo đối với bài viết có biểu hiện nghi ngờ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Feed & Create post */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post Form */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Tạo chủ đề thảo luận mới</h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <input 
                  type="text" 
                  placeholder="Tiêu đề bài viết học tập..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal text-slate-850 dark:text-white"
                  required
                />
              </div>

              <div>
                <textarea 
                  rows={3}
                  placeholder="Hãy chia sẻ câu hỏi hoặc kiến thức của bạn. Tránh đề cập các lời khuyên mua bán cổ phiếu cụ thể..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal text-slate-850 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Chuyên mục:</span>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[10px] text-slate-500 focus:outline-none"
                  >
                    <option value="newbie">Hỏi đáp người mới</option>
                    <option value="general">Thảo luận tài chính</option>
                    <option value="expert">Góc chuyên gia</option>
                  </select>
                </div>
                
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-brand-teal hover:bg-brand-teal/95 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Send size={12} />
                  <span>Đăng bài</span>
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed list */}
          <div className="space-y-4">
            
            {/* Filter buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Tất cả bài viết
              </button>
              <button 
                onClick={() => setActiveFilter('newbie')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'newbie' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Hỏi đáp Người mới
              </button>
              <button 
                onClick={() => setActiveFilter('general')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'general' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Kinh nghiệm tích lũy
              </button>
            </div>

            {/* List */}
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className={`glass-panel p-5 rounded-2xl border transition-all ${post.flagged ? 'border-red-500/40 bg-red-500/5' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {/* Author row */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={post.avatar} 
                      alt={post.author} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{post.author}</span>
                      <span className="block text-[9px] text-slate-400">{post.time}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-400 uppercase">
                    {post.category === 'newbie' ? 'Người mới' : post.category === 'expert' ? 'Chuyên gia' : 'Kinh nghiệm'}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">{post.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{post.content}</p>
                </div>

                {/* Spam Warning Overlay */}
                {post.flagged && (
                  <div className="mt-3.5 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] rounded-xl flex items-start space-x-2">
                    <AlertOctagon size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <strong>Cảnh báo kiểm duyệt AI:</strong> Bài viết này đã bị cắm cờ đỏ cảnh báo! Lý do: {post.flagReason || 'Nghi ngờ phím hàng ảo / dụ dỗ người mới góp vốn trái phép.'}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center text-xs">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Heart size={14} className="hover:fill-rose-500" />
                    <span>Hữu ích ({post.likes})</span>
                  </button>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleReportPost(post.id, 'Phím mã lướt sóng / Pump and Dump')}
                      className="text-slate-400 hover:text-red-500 flex items-center space-x-1 transition-colors"
                    >
                      <Flag size={13} />
                      <span>Báo cáo dụ dỗ (Pump-and-dump)</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right side widgets: Community Guidelines */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center space-x-1">
              <ShieldAlert size={14} className="text-brand-teal" />
              <span>Nguyên tắc ứng xử</span>
            </h3>
            
            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <div className="flex items-start space-x-2">
                <span className="text-brand-teal mt-0.5">•</span>
                <span>Không bàn luận mã cổ phiếu đơn lẻ mang tính lôi kéo.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-brand-teal mt-0.5">•</span>
                <span>Nghiêm cấm chia sẻ link sàn forex, tiền ảo bao lỗ.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-brand-teal mt-0.5">•</span>
                <span>Luôn tôn trọng, trợ giúp thắc mắc của người mới học tài chính.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-brand-teal mt-0.5">•</span>
                <span>Khuyến khích đăng bài lập ngân sách và kinh nghiệm tích lũy thành công.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
