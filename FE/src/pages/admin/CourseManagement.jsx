import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CourseManagement() {
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses();

  const [editorMode, setEditorMode] = useState('list'); // list, create, edit
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal Finance Basics');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80');
  const [duration, setDuration] = useState('45 phút');
  const [level, setLevel] = useState('Newbie');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [tags, setTags] = useState('Tài chính, Tích lũy');
  const [description, setDescription] = useState('');

  // Lessons lists
  const [lessons, setLessons] = useState([
    { title: 'Chương 1: Khởi động ngân sách', videoUrl: 'https://www.youtube.com/embed/i8EsBpEezBc', reading: 'Bài học mẫu...' }
  ]);

  // Quizzes list
  const [quizzes, setQuizzes] = useState([
    { question: 'Câu hỏi mẫu?', options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'], answerIndex: 0, explanation: 'Gợi ý giải thích...' }
  ]);

  const handleOpenCreate = () => {
    setTitle('');
    setCategory('Personal Finance Basics');
    setThumbnail('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80');
    setDuration('45 phút');
    setLevel('Newbie');
    setDifficulty('Dễ');
    setTags('Tài chính, Tích lũy');
    setDescription('');
    setLessons([{ title: 'Chương 1: Bài học nhập môn', videoUrl: 'https://www.youtube.com/embed/i8EsBpEezBc', reading: 'Nội dung đọc hiểu...' }]);
    setQuizzes([{ question: 'Câu hỏi trắc nghiệm?', options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'], answerIndex: 0, explanation: 'Mô tả giải nghĩa của cố vấn học tập...' }]);
    setEditorMode('create');
  };

  const handleOpenEdit = (course) => {
    setActiveCourseId(course.id);
    setTitle(course.title);
    setCategory(course.category);
    setThumbnail(course.thumbnail);
    setDuration(course.duration);
    setLevel(course.level);
    setDifficulty(course.difficulty);
    setTags(course.tags.join(', '));
    setDescription(course.description);
    setLessons(course.lessons || []);
    setQuizzes(course.quizzes || []);
    setEditorMode('edit');
  };

  const handleAddLessonField = () => {
    setLessons([...lessons, { title: '', videoUrl: 'https://www.youtube.com/embed/i8EsBpEezBc', reading: '' }]);
  };

  const handleRemoveLessonField = (index) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleLessonChange = (index, field, value) => {
    setLessons(lessons.map((lesson, i) => i === index ? { ...lesson, [field]: value } : lesson));
  };

  const handleAddQuizField = () => {
    setQuizzes([...quizzes, { question: '', options: ['', '', '', ''], answerIndex: 0, explanation: '' }]);
  };

  const handleRemoveQuizField = (index) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  const handleQuizChange = (index, field, value, optIdx = null) => {
    setQuizzes(quizzes.map((quiz, i) => {
      if (i === index) {
        if (field === 'options' && optIdx !== null) {
          const nextOpts = [...quiz.options];
          nextOpts[optIdx] = value;
          return { ...quiz, options: nextOpts };
        }
        return { ...quiz, [field]: value };
      }
      return quiz;
    }));
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();

    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      title,
      category,
      thumbnail,
      duration,
      level,
      difficulty,
      tags: tagArray,
      description,
      lessons,
      quizzes
    };

    if (editorMode === 'create') {
      addCourse(payload);
    } else {
      updateCourse({ id: activeCourseId, ...payload });
    }

    setEditorMode('list');

    // Success alert and confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 fade-in text-slate-850 dark:text-white">

      {/* 1. Editor mode LIST */}
      {editorMode === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
                <BookOpen size={24} className="text-brand-teal" />
                <span>Quản Lý Khóa Học E-Learning</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Tạo mới, biên tập nội dung bài học, tải lên video minh họa và gắn các câu hỏi mini-quiz trắc nghiệm.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-brand-teal hover:bg-brand-teal/95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus size={16} />
              <span>Tạo khóa học mới</span>
            </button>
          </div>

          {/* Courses list table */}
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Khóa Học</th>
                    <th className="p-3">Danh Mục</th>
                    <th className="p-3 text-center">Độ Khó</th>
                    <th className="p-3 text-center">Số Chương</th>
                    <th className="p-3 text-center">Số Câu Quizzes</th>
                    <th className="p-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img src={c.thumbnail} alt={c.title} className="w-12 h-8 rounded-lg object-cover" />
                          <span className="font-bold text-slate-900 dark:text-slate-200">{c.title}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-medium">{c.category}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/10 text-brand-teal uppercase tracking-widest">{c.difficulty}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-350">{c.lessons.length}</td>
                      <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-350">{c.quizzes.length}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-350 transition-colors"
                          title="Chỉnh sửa nội dung học tập"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setCourseToDelete(c)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                          title="Xóa khóa học"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Editor modes CREATE or EDIT */}
      {(editorMode === 'create' || editorMode === 'edit') && (
        <form onSubmit={handleSaveCourse} className="space-y-6">

          {/* Top Panel Actions */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditorMode('list')}
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Quay lại</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-brand-teal to-brand-green text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>Lưu khóa học</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left side details */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Thông tin tổng quan</h3>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">Tiêu đề khóa học</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal text-slate-850 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">Danh mục học tập</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-500"
                  >
                    <option value="Personal Finance Basics">Personal Finance Basics</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Compound Interest">Compound Interest</option>
                    <option value="ETF Investing">ETF Investing</option>
                    <option value="Scam Detection">Scam Detection</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1.5">Ước tính (Phút)</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1.5">Độ khó</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-500"
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Vừa">Vừa</option>
                      <option value="Nâng cao">Nâng cao</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">Mô tả tóm tắt</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal text-slate-850 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right side lessons details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Lessons details */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800/40">
                  <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Cấu trúc chương học ({lessons.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddLessonField}
                    className="text-xs text-brand-teal hover:underline inline-flex items-center space-x-1"
                  >
                    <PlusCircle size={14} />
                    <span>Thêm chương mới</span>
                  </button>
                </div>

                {lessons.map((lesson, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/50 dark:border-slate-800/40 rounded-xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveLessonField(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tên chương {idx + 1}</label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => handleLessonChange(idx, 'title', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-850 dark:text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Đường dẫn Video mô phỏng</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={lesson.videoUrl}
                            onChange={(e) => handleLessonChange(idx, 'videoUrl', e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewVideo(lesson.videoUrl)}
                            disabled={!lesson.videoUrl}
                            className="px-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                          >
                            Xem trước
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Nội dung bài đọc (Markdown / Text)</label>
                      <textarea
                        rows={2}
                        value={lesson.reading}
                        onChange={(e) => handleLessonChange(idx, 'reading', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-850 dark:text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quizzes details */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800/40">
                  <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Bộ trắc nghiệm ôn tập ({quizzes.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddQuizField}
                    className="text-xs text-brand-teal hover:underline inline-flex items-center space-x-1"
                  >
                    <PlusCircle size={14} />
                    <span>Thêm câu hỏi mới</span>
                  </button>
                </div>

                {quizzes.map((quiz, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/50 dark:border-slate-800/40 rounded-xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveQuizField(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Câu hỏi trắc nghiệm {idx + 1}</label>
                      <input
                        type="text"
                        value={quiz.question}
                        onChange={(e) => handleQuizChange(idx, 'question', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-850 dark:text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {quiz.options.map((opt, oIdx) => (
                        <div key={oIdx}>
                          <label className="block text-[9px] text-slate-400 mb-0.5">Phương án {String.fromCharCode(65 + oIdx)}</label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleQuizChange(idx, 'options', e.target.value, oIdx)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[11px] focus:outline-none"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Số thứ tự đáp án đúng (0-3)</label>
                        <input
                          type="number"
                          min={0}
                          max={3}
                          value={quiz.answerIndex}
                          onChange={(e) => handleQuizChange(idx, 'answerIndex', parseInt(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2.5 text-xs focus:outline-none font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Giải nghĩa chi tiết từ AI Mentor</label>
                        <input
                          type="text"
                          value={quiz.explanation}
                          onChange={(e) => handleQuizChange(idx, 'explanation', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-850 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </form>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl relative fade-in border border-slate-800">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                <Sparkles size={16} className="text-brand-teal" />
                <span>Xem trước Video Bài Giảng</span>
              </h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {(() => {
                const getEmbedUrl = (url) => {
                  if (!url) return '';
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  const match = url.match(regExp);
                  if (match && match[2].length === 11) {
                    return `https://www.youtube.com/embed/${match[2]}`;
                  }
                  return url;
                };
                const embedUrl = getEmbedUrl(previewVideo);
                const isDirectVideo = embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm') || embedUrl.endsWith('.ogg') || (!embedUrl.includes('youtube.com') && !embedUrl.includes('youtu.be'));
                if (isDirectVideo) {
                  return (
                    <video
                      src={embedUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                } else {
                  return (
                    <iframe
                      src={embedUrl}
                      title="Xem trước Video Bài Giảng"
                      className="w-full h-full object-cover"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* DELETE COURSE CONFIRMATION MODAL */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative text-slate-850 dark:text-white">
            <button 
              onClick={() => setCourseToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:scale-105 transition-transform"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Xác nhận xóa khóa học</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bạn có chắc chắn muốn xóa khóa học <strong>{courseToDelete.title}</strong>? 
                  Hành động này sẽ xóa vĩnh viễn khóa học và tất cả bài học, câu hỏi liên quan, không thể hoàn tác.
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCourseToDelete(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold text-xs rounded-xl transition-all cursor-pointer border-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteCourse(courseToDelete.id);
                    setCourseToDelete(null);
                  }}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border-none"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
