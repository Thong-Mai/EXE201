import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Play, 
  BookOpen, 
  ExternalLink, 
  Award, 
  ChevronRight, 
  Video, 
  BookOpenCheck, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertOctagon,
  Brain,
  Flame,
  Globe,
  MessageSquare,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MyLearning() {
  const { courses, recordLessonRead, userProgress, setCourses, setUserProgress, resetAllProgress, resetCourseProgress, completeCourseQuiz } = useCourses();
  const { addXP, triggerStreak, streak, xp } = useAuth();
  const location = useLocation();
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('courses'); // courses, external_links
  
  // Quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // AI tutor chat state
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Gamified Level calculation
  const xpPerLevel = 250;
  const currentLvl = Math.floor((xp || 0) / xpPerLevel) + 1;

  // Curated financial education course links opening in new tab
  const trustedEducationLinks = [
    { title: 'Học viện TCBS Learn', source: 'Techcom Securities', level: 'Beginner', duration: 'Tự học miễn phí', url: 'https://www.tcbs.com.vn/' },
    { title: 'SSI Học Đầu Tư', source: 'SSI Securities', level: 'Beginner to Intermediate', duration: 'Khóa ngắn hạn', url: 'https://www.ssi.com.vn/' },
    { title: 'Finhay Academy', source: 'Finhay Blog', level: 'Beginner', duration: '5 phút đọc/bài', url: 'https://www.finhay.com.vn/' },
    { title: 'Khan Academy Finance', source: 'Khan Academy', level: 'Beginner', duration: '12 giờ lý thuyết', url: 'https://www.khanacademy.org/college-careers-more/personal-finance' },
    { title: 'Investopedia Finance', source: 'Investopedia Dictionary', level: 'Mọi trình độ', duration: 'Tra cứu nhanh', url: 'https://www.investopedia.com/' },
    { title: 'Coursera Financial Markets', source: 'Yale University', level: 'Intermediate', duration: '20 giờ học', url: 'https://www.coursera.org/learn/financial-markets-global' },
    { title: 'Harvard Financial Literacy', source: 'Harvard University', level: 'Beginner', duration: 'Học liệu công ích', url: 'https://pll.harvard.edu/subject/financial-literacy' }
  ];

  useEffect(() => {
    if (location.state && location.state.startCourseId) {
      const course = courses.find(c => c.id === location.state.startCourseId);
      if (course) {
        startCourse(course);
      }
    }
  }, [location.state, courses]);

  const startCourse = (course) => {
    setSelectedCourse(course);
    setActiveLessonIndex(0);
    setQuizStarted(false);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    const isCompleted = userProgress[course.id]?.quizCompleted || false;
    setQuizFinished(isCompleted);
    setAiExplanation('');
  };

  const handleResetCourse = (courseId, courseTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn đặt lại tiến độ của bài học "${courseTitle}"? Mọi bài đọc và trắc nghiệm của phần này sẽ được xóa.`)) {
      resetCourseProgress(courseId);
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse(null);
      }
      alert(`Đã đặt lại bài học "${courseTitle}"!`);
    }
  };

  const handleLessonComplete = (courseId, lessonId) => {
    recordLessonRead(courseId, lessonId);
    addXP(15); // Add 15 XP for reading
    
    // Auto progress to next lesson or quiz
    if (activeLessonIndex < selectedCourse.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else {
      setQuizStarted(true);
    }
  };

  const handleOptionSelect = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const submitAnswer = () => {
    setIsAnswerSubmitted(true);
    const correctIdx = selectedCourse.quizzes[currentQuizIndex].answerIndex;
    if (selectedOption === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const askAiTutor = (question, correctAnswer, userAnswer, explanation) => {
    setIsAiLoading(true);
    setAiExplanation('');
    setTimeout(() => {
      setAiExplanation(
        `🤖 Cố Vấn Học Tập S+ (AI Mentor):\n` +
        `Bạn đã chọn phương án trả lời: "${userAnswer}". Đáp án chính xác là: "${correctAnswer}".\n\n` +
        `💡 Phân tích chuyên sâu cho người học:\n` +
        `${explanation}\n\n` +
        `🔍 Lời khuyên thực hành quản lý tài chính:\n` +
        `Luôn bắt đầu tích lũy sớm để tận dụng sức mạnh lãi kép. Tránh các dự án lending/staking cam kết lãi suất phi thực tế và hãy giữ gìn an toàn thông tin tài khoản ngân hàng của bạn.`
      );
      setIsAiLoading(false);
    }, 800);
  };

  const nextQuizStep = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAiExplanation('');
    
    if (currentQuizIndex < selectedCourse.quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setQuizFinished(true);
      completeCourseQuiz(selectedCourse.id);
      addXP(50); // bonus 50 XP
      triggerStreak();
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#7C3AED', '#10B981']
      });
    }
  };

  const retryQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
    setAiExplanation('');
  };

  const handleResetProgress = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập? Mọi bài học đã hoàn thành sẽ trở về 0%.")) {
      resetAllProgress();
      setSelectedCourse(null);
      alert("Đã đặt lại tiến trình học tập thành công!");
    }
  };

  // Calculate emotional readiness score base
  const totalQuizzesCount = selectedCourse ? selectedCourse.quizzes.length : 1;
  const quizPercent = Math.round((quizScore / totalQuizzesCount) * 100);

  return (
    <div className="space-y-6 fade-in text-slate-800 dark:text-white font-sans">
      
      {/* TABS CONTROLLER */}
      <div className="flex border-b border-slate-200 dark:border-white/10">
        <button 
          onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}
          className={`pb-3 px-6 font-bold text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'courses' 
              ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Giáo trình trực tuyến
        </button>
        <button 
          onClick={() => setActiveTab('external_links')}
          className={`pb-3 px-6 font-bold text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'external_links' 
              ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Cổng tự học uy tín toàn cầu
        </button>
      </div>

      {activeTab === 'courses' && (
        <>
          {/* COURSE VIEW */}
          {!selectedCourse ? (
            <div className="space-y-6">
              
              {/* Heading, Reset Button and Curiosity banner */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <BookOpen size={24} className="text-purple-600 dark:text-purple-400" />
                    <span>Lộ Trình Tự Học Tài Chính Cá Nhân & Đầu Tư</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lớp học thiết kế ngắn gọn, trực quan, loại bỏ các chỉ số tài chính phức tạp.</p>
                </div>
                
                <div className="flex items-center space-x-3 self-start md:self-center">
                  <button 
                    onClick={handleResetProgress}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.01] shadow-xs"
                    title="Đặt lại toàn bộ tiến trình học tập"
                  >
                    <RotateCcw size={14} />
                    <span>Đặt lại tiến trình</span>
                  </button>
                  
                  {/* Curiosity banner */}
                  <div className="hidden lg:flex bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/15 dark:border-purple-500/20 p-3 rounded-xl items-center space-x-2 shrink-0">
                    <Award size={16} className="text-purple-600 dark:text-purple-400 animate-bounce" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-200">Hoàn thành Level 1 để mở khóa rổ Quỹ ETF</span>
                  </div>
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const courseIndex = courses.findIndex(c => c.id === course.id);
                  const isLocked = courseIndex > 0 && (courses[courseIndex - 1]?.progress || 0) < 100;
                  
                  return (
                    <div 
                      key={course.id} 
                      onClick={() => !isLocked && startCourse(course)}
                      className={`glass-panel rounded-2xl overflow-hidden flex flex-col justify-between hover-scale cursor-pointer ${
                        isLocked ? 'opacity-60 cursor-not-allowed select-none' : ''
                      }`}
                    >
                      <div>
                        {/* Thumbnail overlay */}
                        <div className="relative h-40 bg-slate-900">
                          <img 
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=350&q=80'} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-1 z-10">
                              <Lock size={20} className="text-slate-400" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-4">🔒 Hoàn thành bài học trước để mở khóa</span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex space-x-1">
                            {course.tags?.map(t => (
                              <span key={t} className="px-2 py-0.5 bg-black/75 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-center text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                            <span>Mức: {course.level || 'Beginner'}</span>
                            <span className="flex items-center space-x-0.5">
                              <Clock size={11} />
                              <span>{course.duration || '3 phút đọc'}</span>
                            </span>
                          </div>
                          
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200 line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-light">{course.description}</p>
                        </div>
                      </div>

                      {/* Course progress */}
                      <div className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/60 dark:bg-slate-900/20 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            <span>Tiến độ</span>
                            <span>{course.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-white/5">
                            <div className="bg-purple-600 dark:bg-purple-500 h-full transition-all duration-300" style={{ width: `${course.progress || 0}%` }} />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {course.progress > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetCourse(course.id, course.title);
                              }}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-lg transition-all cursor-pointer hover:scale-102"
                              title="Đặt lại bài học này"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                          <button className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black rounded-lg transition-all flex items-center space-x-0.5 cursor-pointer">
                            <span>{course.progress > 0 ? 'Học tiếp' : 'Bắt đầu'}</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            
            /* DYNAMIC COURSE READER & QUIZ SYSTEM */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Top back button */}
              <div className="lg:col-span-3">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại danh mục</span>
                </button>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2 flex-wrap">
                    <span>{selectedCourse.title}</span>
                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                      Cấp độ: {selectedCourse.level || 'Beginner'}
                    </span>
                  </h2>
                  
                  <button 
                    onClick={() => handleResetCourse(selectedCourse.id, selectedCourse.title)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <RotateCcw size={12} />
                    <span>Đặt lại bài này</span>
                  </button>
                </div>
              </div>

              {/* Left Column: video or reading text */}
              <div className="lg:col-span-2 space-y-6">
                {!quizStarted ? (
                  
                  /* COURSE READ PANEL */
                  <div className="glass-panel p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200 flex items-center space-x-2">
                        <Play size={16} className="text-blue-500" />
                        <span>Bài giảng {activeLessonIndex + 1}: {selectedCourse.lessons[activeLessonIndex]?.title}</span>
                      </h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1">
                        <Clock size={11} />
                        <span>{selectedCourse.duration || '3 phút đọc'}</span>
                      </span>
                    </div>

                    {/* Interactive video simulator frame */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-200/40 dark:border-white/5 shadow-inner">
                      {selectedCourse.lessons[activeLessonIndex]?.videoUrl ? (
                        (() => {
                          const getEmbedUrl = (url) => {
                            if (!url) return '';
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                            const match = url.match(regExp);
                            if (match && match[2].length === 11) {
                              return `https://www.youtube.com/embed/${match[2]}`;
                            }
                            return url;
                          };
                          const embedUrl = getEmbedUrl(selectedCourse.lessons[activeLessonIndex].videoUrl);
                          const isDirectVideo = embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm') || embedUrl.endsWith('.ogg') || (!embedUrl.includes('youtube.com') && !embedUrl.includes('youtu.be'));
                          if (isDirectVideo) {
                            return (
                              <video 
                                src={embedUrl} 
                                controls 
                                className="w-full h-full object-contain"
                              />
                            );
                          } else {
                            return (
                              <iframe 
                                src={embedUrl} 
                                title="SAVE+ Video lecture" 
                                className="w-full h-full object-cover"
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                              ></iframe>
                            );
                          }
                        })()
                      ) : (
                        <div className="flex flex-col items-center space-y-2 text-slate-600">
                          <Video size={40} />
                          <span className="text-xs">Không tìm thấy video bài giảng.</span>
                        </div>
                      )}
                    </div>

                    {/* Reading Content */}
                    <div className="prose max-w-none text-xs text-slate-600 dark:text-slate-350 space-y-3 leading-relaxed border-t border-slate-200 dark:border-white/5 pt-4">
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                        <BookOpen size={14} className="text-purple-600 dark:text-purple-400" />
                        <span>Nội dung chi tiết bài đọc:</span>
                      </h4>
                      <p className="font-light whitespace-pre-line leading-relaxed">{selectedCourse.lessons[activeLessonIndex]?.reading}</p>
                    </div>

                    {/* CTA Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/5">
                      <span className="text-[10px] text-brand-gold font-bold flex items-center space-x-1">
                        <Sparkles size={11} className="fill-brand-gold/10" />
                        <span>Đọc xong nhận ngay +15 XP</span>
                      </span>
                      
                      <button 
                        onClick={() => handleLessonComplete(selectedCourse.id, selectedCourse.lessons[activeLessonIndex].id)}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-black rounded-xl shadow-md flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Hoàn thành bài đọc</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  
                  /* INTERACTIVE SCENARIO QUIZ SCREEN */
                  <div className="glass-panel p-5 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                      <span className="font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 text-slate-950 dark:text-slate-200">
                        <BookOpenCheck size={16} className="text-brand-gold" />
                        <span>Trắc nghiệm kịch bản: Câu {currentQuizIndex + 1} / {selectedCourse.quizzes.length}</span>
                      </span>
                      
                      {/* Quiz progress */}
                      <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-gold h-full transition-all duration-300"
                          style={{ width: `${((currentQuizIndex + 1) / selectedCourse.quizzes.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {!quizFinished ? (
                      <div className="space-y-5">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-white/5">
                          {selectedCourse.quizzes[currentQuizIndex]?.question}
                        </h3>

                        {/* Options mapping with Neon Green / Rose Red indicators */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {selectedCourse.quizzes[currentQuizIndex]?.options.map((opt, oIdx) => {
                            const isSelected = selectedOption === oIdx;
                            const isCorrectAnswer = selectedCourse.quizzes[currentQuizIndex].answerIndex === oIdx;
                            
                            let optionStyle = 'border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700';
                            
                            if (isSelected) {
                              optionStyle = 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-white';
                            }
                            
                            if (isAnswerSubmitted) {
                              if (isCorrectAnswer) {
                                optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                              } else if (isSelected) {
                                optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
                              } else {
                                optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isAnswerSubmitted}
                                onClick={() => handleOptionSelect(oIdx)}
                                className={`w-full p-3.5 text-left rounded-xl border text-xs transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700/60 flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="leading-relaxed font-light">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit Button */}
                        {!isAnswerSubmitted ? (
                          <button 
                            onClick={submitAnswer}
                            disabled={selectedOption === null}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Kiểm tra kết quả
                          </button>
                        ) : (
                          <div className="space-y-4">
                            {/* Explanations */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl space-y-2">
                              <span className="block text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">📝 Phân tích giải nghĩa:</span>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                {selectedCourse.quizzes[currentQuizIndex]?.explanation}
                              </p>
                              
                              <button
                                onClick={() => askAiTutor(
                                  selectedCourse.quizzes[currentQuizIndex].question,
                                  selectedCourse.quizzes[currentQuizIndex].options[selectedCourse.quizzes[currentQuizIndex].answerIndex],
                                  selectedCourse.quizzes[currentQuizIndex].options[selectedOption],
                                  selectedCourse.quizzes[currentQuizIndex].explanation
                                )}
                                className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-450 hover:underline cursor-pointer pt-1"
                              >
                                <Sparkles size={11} className="text-brand-gold fill-brand-gold/10" />
                                <span>Nhờ AI S+ giải thích chuyên sâu (Quy tắc & Kỷ luật vốn)</span>
                              </button>
                            </div>

                            {/* AI chat bubble overlay */}
                            {(isAiLoading || aiExplanation) && (
                              <div className="p-4 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-250 dark:border-white/5 text-left font-mono text-[10.5px] leading-relaxed relative">
                                {isAiLoading ? (
                                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                                    <span>AI Mentor đang tải phân tích...</span>
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-350">
                                    {aiExplanation}
                                  </div>
                                )}
                              </div>
                            )}

                            <button 
                              onClick={nextQuizStep}
                              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                            >
                              {currentQuizIndex < selectedCourse.quizzes.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài trắc nghiệm'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      
                      /* QUIZ FINISHED SPLASH */
                      <div className="text-center py-6 space-y-4">
                        <div className="inline-flex w-16 h-16 bg-amber-500/10 text-brand-gold border border-brand-gold/20 rounded-full items-center justify-center mb-1">
                          <Award size={30} className="fill-brand-gold/10" />
                        </div>
                        
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Thử thách hoàn thành xuất sắc!</h3>
                          
                          {/* Emotional feedback */}
                          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[10.5px] rounded-full border border-emerald-500/20 font-bold">
                            <Brain size={13} />
                            <span>Trực giác tâm lý của bạn vượt trội hơn {quizPercent || 72}% học viên mới!</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light leading-normal">
                          Bạn đã trả lời đúng <strong className="text-blue-600 dark:text-blue-400 font-mono">{quizScore}/{selectedCourse.quizzes.length}</strong> câu hỏi. Nhận ngay <strong className="text-brand-gold font-mono">+50 XP</strong>.
                        </p>
                        
                        <div className="flex space-x-3 max-w-xs mx-auto pt-3">
                          <button 
                            onClick={retryQuiz}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <RotateCcw size={13} />
                            <span>Làm lại</span>
                          </button>
                          
                          <button 
                            onClick={() => setSelectedCourse(null)}
                            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Xác nhận hoàn tất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="glass-panel p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-widest">Danh mục bài đọc</h4>
                  
                  <div className="space-y-2">
                    {selectedCourse.lessons.map((lesson, idx) => {
                      const isRead = userProgress[selectedCourse.id]?.lessonsRead?.includes(lesson.id);
                      const isCurrent = activeLessonIndex === idx && !quizStarted;
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLessonIndex(idx); setQuizStarted(false); }}
                          className={`w-full p-2.5 text-left rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                            isCurrent 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border-blue-500/25 pl-3' 
                              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="line-clamp-1">{idx + 1}. {lesson.title}</span>
                          {isRead && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 flex items-center space-x-0.5">
                              <CheckCircle2 size={11} />
                              <span>Đã đọc</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                    
                    {/* Quiz button */}
                    <button
                      onClick={() => setQuizStarted(true)}
                      className={`w-full p-2.5 text-left rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                        quizStarted 
                          ? 'bg-brand-gold/15 text-brand-gold font-bold border-brand-gold/20 pl-3' 
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>🎯 Mini-Quiz Ôn Tập</span>
                      {quizFinished && (
                        <span className="text-[9px] font-bold text-brand-gold flex items-center space-x-0.5">
                          <Award size={11} className="fill-brand-gold/10" />
                          <span>Đạt</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* EXTERNAL EDUCATIONAL LINKS DIRECTORY */}
      {activeTab === 'external_links' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Globe size={24} className="text-purple-600 dark:text-purple-400" />
              <span>Học viện Tài chính liên kết uy tín</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SAVE+ tổng hợp các liên kết giáo dục công ích miễn phí để bạn mở rộng kiến thức tài chính. Mọi liên kết sẽ mở ở tab mới.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trustedEducationLinks.map((lnk) => (
              <div 
                key={lnk.title} 
                className="glass-panel p-4 rounded-2xl flex flex-col justify-between space-y-3 hover-scale"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">{lnk.source}</span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-200">{lnk.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light">Trình độ: {lnk.level} • Hỗ trợ: {lnk.duration}</p>
                </div>
                
                <a 
                  href={lnk.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-slate-100 hover:bg-brand-teal hover:text-white dark:bg-slate-900 dark:hover:bg-brand-teal border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-350 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center space-x-1"
                >
                  <span>Go Learn</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
