import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { 
  sequelize, 
  User, 
  Watchlist, 
  Portfolio, 
  Goal, 
  Course, 
  CourseProgress, 
  PaymentRequest, 
  Notification 
} from './db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'saveplus_jwt_secret_key_2026';

app.use(cors());
app.use(express.json());
app.use(authRoutes);

// Helper to generate unique IDs
const genId = (prefix = 'R') => prefix + Date.now() + Math.floor(Math.random() * 1000);

// --- EMAIL / OTP SETUP ---
const otpStore = {}; // { email: { otp, expiresAt, type } }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendOTPEmail = async (toEmail, otp, type = 'register') => {
  const isRegister = type === 'register';
  const subject = isRegister ? '🔐 Mã xác nhận đăng ký SAVE+' : '🔑 Mã xác nhận đặt lại mật khẩu SAVE+';
  const title = isRegister ? 'Xác nhận tài khoản của bạn' : 'Đặt lại mật khẩu';
  const desc = isRegister
    ? 'Cảm ơn bạn đã đăng ký SAVE+! Hãy dùng mã OTP dưới đây để hoàn tất xác minh email:'
    : 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu. Dùng mã OTP dưới đây:';

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#0d9488;font-size:28px;margin:0">SAVE+</h1>
      <p style="color:#64748b;font-size:13px;margin:4px 0 0">Nền tảng giáo dục tài chính</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
      <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">${title}</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 24px">${desc}</p>
      <div style="background:#f0fdfa;border:2px dashed #0d9488;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px">
        <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#0d9488">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin:0">⏳ Mã OTP có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
    </div>
    <p style="text-align:center;color:#cbd5e1;font-size:11px;margin-top:20px">© 2026 SAVE+ · Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
  </div>`;

  await transporter.sendMail({
    from: `"SAVE+ Platform" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html
  });
};

// --- OTP ROUTES ---


// 3. Quên mật khẩu - Xác minh email tồn tại
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Thiếu email.' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });

    res.json({ message: 'Email hợp lệ. Vui lòng đặt mật khẩu mới.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Lỗi xác minh email. Vui lòng thử lại.' });
  }
});

// 4. Đặt lại mật khẩu (không cần OTP)
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Lỗi đặt lại mật khẩu.' });
  }
});


// --- AUTH MIDDLEWARE ---
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa bởi admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho Admin.' });
  }
};

const isStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối. Dành cho Admin hoặc Staff.' });
  }
};

// --- AUTH ROUTERS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, idNumber, dob, gender, address, idIssueDate } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại trên hệ thống.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate simple sequential user ID (e.g. U001, U002...)
    const usersList = await User.findAll();
    let nextNum = 1;
    usersList.forEach(u => {
      if (u.id && u.id.startsWith('U')) {
        const numStr = u.id.substring(1);
        if (/^\d+$/.test(numStr) && numStr.length <= 4) {
          const num = parseInt(numStr);
          if (num >= nextNum) {
            nextNum = num + 1;
          }
        }
      }
    });
    const userId = 'U' + nextNum.toString().padStart(3, '0');
    
    const newUser = await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      subscription: 'Free',
      status: idNumber ? 'Pending KYC' : 'Active', // Set to Pending KYC if ID provided, else Active
      idNumber: idNumber || null,
      dob: dob || null,
      gender: gender || null,
      address: address || null,
      idIssueDate: idIssueDate || null,
      balance: 100000000,
      xp: 150,
      streak: 3
    });

    // Seed initial notifications
    await Notification.create({
      id: genId('N'),
      userId: userId,
      title: 'Chào mừng thành viên mới! 🎉',
      message: 'Chào mừng bạn đến với SAVE+. Hãy hoàn thành bảng khảo sát onboarding để nhận gợi ý lộ trình phù hợp!',
      read: false,
      time: 'Vừa xong'
    });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subscription: newUser.subscription,
        status: newUser.status,
        idNumber: newUser.idNumber,
        dob: newUser.dob,
        gender: newUser.gender,
        address: newUser.address,
        idIssueDate: newUser.idIssueDate,
        balance: newUser.balance,
        xp: newUser.xp,
        streak: newUser.streak
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đăng ký tài khoản.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ email và mật khẩu.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại.' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Tài khoản này đã bị khóa.' });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        status: user.status,
        idNumber: user.idNumber,
        balance: user.balance,
        xp: user.xp,
        streak: user.streak,
        riskProfile: user.riskProfile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đăng nhập.' });
  }
});

// Get profile & detailed state
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch associated data
    const watchlists = await Watchlist.findAll({ where: { userId: user.id } });
    const portfolios = await Portfolio.findAll({ where: { userId: user.id } });
    const goals = await Goal.findAll({ where: { userId: user.id } });
    const notifications = await Notification.findAll({ 
      where: { userId: user.id }, 
      order: [['createdAt', 'DESC']]
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        status: user.status,
        idNumber: user.idNumber,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        idIssueDate: user.idIssueDate,
        balance: user.balance,
        xp: user.xp,
        streak: user.streak,
        riskProfile: user.riskProfile,
        onboardingAnswers: user.onboardingAnswers ? JSON.parse(user.onboardingAnswers) : null
      },
      watchlist: watchlists.map(w => w.symbol),
      portfolio: portfolios.map(p => ({ symbol: p.symbol, shares: p.shares, buyPrice: p.buyPrice })),
      goals: goals.map(g => ({
        id: g.id,
        name: g.name,
        target: g.target,
        current: g.current,
        category: g.category,
        monthlyContribution: g.monthlyContribution
      })),
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        time: n.time
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải hồ sơ người dùng.' });
  }
});

// Save Onboarding Answers
app.post('/api/users/onboarding', authenticateToken, async (req, res) => {
  const { answers } = req.body;
  if (!answers) {
    return res.status(400).json({ message: 'Thiếu kết quả khảo sát.' });
  }

  try {
    let profile = 'Balanced';
    if (answers.riskTolerance === 'Conservative' || answers.experience === 'Chưa có kinh nghiệm') {
      profile = 'Conservative';
    } else if (answers.riskTolerance === 'Aggressive' && answers.knowledge === 'Nâng cao') {
      profile = 'Aggressive';
    }

    req.user.onboardingAnswers = JSON.stringify(answers);
    req.user.riskProfile = profile;
    await req.user.save();

    res.json({
      riskProfile: profile,
      onboardingAnswers: answers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lưu khảo sát onboarding.' });
  }
});

// Update Balance
app.put('/api/financials/balance', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (amount === undefined) {
    return res.status(400).json({ message: 'Thiếu số dư mới.' });
  }

  try {
    req.user.balance = parseFloat(amount);
    await req.user.save();
    res.json({ balance: req.user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật số dư.' });
  }
});

// Add XP
app.post('/api/users/xp', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ message: 'Thiếu số lượng XP.' });

  try {
    req.user.xp = req.user.xp + parseInt(amount);
    await req.user.save();
    res.json({ xp: req.user.xp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cộng XP.' });
  }
});

// Trigger Streak
app.post('/api/users/streak', authenticateToken, async (req, res) => {
  try {
    req.user.streak = req.user.streak + 1;
    await req.user.save();
    res.json({ streak: req.user.streak });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tăng streak.' });
  }
});

// Watchlist Toggle
app.post('/api/financials/watchlist', authenticateToken, async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ message: 'Thiếu mã cổ phiếu.' });

  try {
    const existing = await Watchlist.findOne({
      where: { userId: req.user.id, symbol }
    });

    if (existing) {
      await existing.destroy();
    } else {
      await Watchlist.create({ userId: req.user.id, symbol });
    }

    const currentList = await Watchlist.findAll({ where: { userId: req.user.id } });
    res.json({ watchlist: currentList.map(w => w.symbol) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đồng bộ danh mục theo dõi.' });
  }
});

// Portfolio Bulk Update (Simulation Sync)
app.put('/api/financials/portfolio', authenticateToken, async (req, res) => {
  const { portfolio } = req.body; // Array of { symbol, shares, buyPrice }
  if (!portfolio || !Array.isArray(portfolio)) {
    return res.status(400).json({ message: 'Dữ liệu danh mục đầu tư không hợp lệ.' });
  }

  try {
    // Transaction-like delete and recreate for simplicity
    await Portfolio.destroy({ where: { userId: req.user.id } });
    
    const creations = portfolio.map(item => ({
      userId: req.user.id,
      symbol: item.symbol,
      shares: parseFloat(item.shares),
      buyPrice: parseFloat(item.buyPrice)
    }));

    await Portfolio.bulkCreate(creations);
    
    res.json({ portfolio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đồng bộ danh mục đầu tư.' });
  }
});

// --- GOAL ROUTERS ---

// Get goals
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const list = await Goal.findAll({ where: { userId: req.user.id } });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lấy danh sách mục tiêu.' });
  }
});

// Create goal
app.post('/api/goals', authenticateToken, async (req, res) => {
  const { name, target, category, monthlyContribution } = req.body;
  if (!name || !target || !category) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin mục tiêu.' });
  }

  try {
    const goalId = 'G' + Math.floor(Math.random() * 1000);
    const newGoal = await Goal.create({
      id: goalId,
      userId: req.user.id,
      name,
      target: parseFloat(target),
      current: 0,
      category,
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : 0
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tạo mục tiêu mới.' });
  }
});

// Contribute to goal
app.post('/api/goals/:id/contribute', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Số tiền đóng góp phải lớn hơn 0.' });
  }

  try {
    const goal = await Goal.findOne({ where: { id, userId: req.user.id } });
    if (!goal) {
      return res.status(404).json({ message: 'Mục tiêu không tồn tại.' });
    }

    const contribution = parseFloat(amount);
    if (req.user.balance < contribution) {
      return res.status(400).json({ message: 'Số dư tài khoản không đủ để thực hiện đóng góp.' });
    }

    // Update balance & goal current
    req.user.balance = req.user.balance - contribution;
    await req.user.save();

    goal.current = Math.min(goal.target, goal.current + contribution);
    await goal.save();

    res.json({
      goal,
      balance: req.user.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đóng góp mục tiêu.' });
  }
});

// --- COURSE ROUTERS ---

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const list = await Course.findAll({ order: [['id', 'ASC']] });
    
    // Map list to parse JSON stringified arrays
    const formatted = list.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      thumbnail: c.thumbnail,
      duration: c.duration,
      level: c.level,
      difficulty: c.difficulty,
      timeEstimated: c.timeEstimated,
      tags: c.tags ? JSON.parse(c.tags) : [],
      description: c.description,
      lessons: c.lessons ? JSON.parse(c.lessons) : [],
      quizzes: c.quizzes ? JSON.parse(c.quizzes) : []
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải danh sách khóa học.' });
  }
});

// Get user progress
app.get('/api/courses/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await CourseProgress.findAll({ where: { userId: req.user.id } });
    const formatted = {};
    progress.forEach(p => {
      formatted[p.courseId] = {
        lessonsRead: p.lessonsRead ? JSON.parse(p.lessonsRead) : [],
        quizCompleted: p.quizCompleted,
        progressPercent: p.progressPercent
      };
    });
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải tiến độ học tập.' });
  }
});

// Record Lesson Read
app.post('/api/courses/:id/lessons/:lessonId', authenticateToken, async (req, res) => {
  const { id: courseId, lessonId } = req.params;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại.' });
    }

    let progress = await CourseProgress.findOne({ where: { userId: req.user.id, courseId } });
    if (!progress) {
      progress = await CourseProgress.create({
        userId: req.user.id,
        courseId,
        lessonsRead: '[]',
        quizCompleted: false,
        progressPercent: 0
      });
    }

    const lessonsRead = JSON.parse(progress.lessonsRead);
    if (!lessonsRead.includes(lessonId)) {
      lessonsRead.push(lessonId);
    }
    progress.lessonsRead = JSON.stringify(lessonsRead);

    // Calculate progressPercent
    const totalLessons = JSON.parse(course.lessons).length;
    const lessonsProgress = Math.round((lessonsRead.length / totalLessons) * 50);
    const quizProgress = progress.quizCompleted ? 50 : 0;
    progress.progressPercent = Math.min(100, lessonsProgress + quizProgress);

    await progress.save();

    res.json({
      courseId,
      lessonsRead,
      quizCompleted: progress.quizCompleted,
      progressPercent: progress.progressPercent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật tiến trình bài học.' });
  }
});

// Complete Course Quiz
app.post('/api/courses/:id/quiz', authenticateToken, async (req, res) => {
  const { id: courseId } = req.params;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại.' });
    }

    let progress = await CourseProgress.findOne({ where: { userId: req.user.id, courseId } });
    if (!progress) {
      progress = await CourseProgress.create({
        userId: req.user.id,
        courseId,
        lessonsRead: '[]',
        quizCompleted: false,
        progressPercent: 0
      });
    }

    progress.quizCompleted = true;

    // Calculate progressPercent
    const totalLessons = JSON.parse(course.lessons).length;
    const lessonsRead = JSON.parse(progress.lessonsRead);
    const lessonsProgress = Math.round((lessonsRead.length / totalLessons) * 50);
    progress.progressPercent = Math.min(100, lessonsProgress + 50);

    await progress.save();

    res.json({
      courseId,
      lessonsRead,
      quizCompleted: true,
      progressPercent: progress.progressPercent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi hoàn thành bài trắc nghiệm.' });
  }
});

// Reset progress for single course
app.post('/api/courses/:id/reset', authenticateToken, async (req, res) => {
  const { id: courseId } = req.params;
  try {
    await CourseProgress.destroy({ where: { userId: req.user.id, courseId } });
    res.json({ success: true, courseId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đặt lại tiến độ học.' });
  }
});

// Reset all progress
app.post('/api/courses/reset-all', authenticateToken, async (req, res) => {
  try {
    await CourseProgress.destroy({ where: { userId: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đặt lại toàn bộ tiến độ.' });
  }
});

// Admin add/edit/delete courses (Endpoints for staff and admin)
app.post('/api/courses/manage', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const newCourse = req.body;
  if (!newCourse.title || !newCourse.category) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc khóa học.' });
  }

  try {
    const listCount = await Course.count();
    const courseId = 'C' + (listCount + 1).toString().padStart(2, '0');
    
    const freshCourse = await Course.create({
      id: courseId,
      title: newCourse.title,
      category: newCourse.category,
      thumbnail: newCourse.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
      duration: newCourse.duration || '5 phút',
      level: newCourse.level || 'Cơ bản',
      difficulty: newCourse.difficulty || 'Dễ',
      timeEstimated: newCourse.timeEstimated || '5 phút',
      tags: JSON.stringify(newCourse.tags || []),
      description: newCourse.description || '',
      lessons: JSON.stringify(newCourse.lessons || []),
      quizzes: JSON.stringify(newCourse.quizzes || [])
    });

    res.status(201).json(freshCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi thêm khóa học.' });
  }
});

app.put('/api/courses/manage/:id', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  try {
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });

    if (updated.title) course.title = updated.title;
    if (updated.category) course.category = updated.category;
    if (updated.thumbnail) course.thumbnail = updated.thumbnail;
    if (updated.duration) course.duration = updated.duration;
    if (updated.level) course.level = updated.level;
    if (updated.difficulty) course.difficulty = updated.difficulty;
    if (updated.timeEstimated) course.timeEstimated = updated.timeEstimated;
    if (updated.description) course.description = updated.description;
    if (updated.tags) course.tags = JSON.stringify(updated.tags);
    if (updated.lessons) course.lessons = JSON.stringify(updated.lessons);
    if (updated.quizzes) course.quizzes = JSON.stringify(updated.quizzes);

    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật khóa học.' });
  }
});

app.delete('/api/courses/manage/:id', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });

    await course.destroy();
    res.json({ message: 'Xóa khóa học thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi xóa khóa học.' });
  }
});

// --- PAYMENT UPGRADE ROUTERS ---

// Get requests (Users see their own, Admin/Staff see all)
app.get('/api/payments/requests', authenticateToken, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      requests = await PaymentRequest.findAll({ order: [['createdAt', 'DESC']] });
    } else {
      requests = await PaymentRequest.findAll({ 
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
    }
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải danh sách thanh toán.' });
  }
});

// Submit request (Requires Admin approval)
app.post('/api/payments/requests', authenticateToken, async (req, res) => {
  const { targetTier, paymentCode, amount, email } = req.body;
  if (!targetTier || !paymentCode || !amount || !email) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin thanh toán.' });
  }

  try {
    // Search user by the provided email (case-insensitive)
    const targetUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email đã nhập.' });
    }

    const requestId = genId('PAY');
    
    // Create request in Pending state
    const request = await PaymentRequest.create({
      id: requestId,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      targetTier,
      paymentCode: paymentCode.trim(), // The User ID is passed as paymentCode
      amount: parseFloat(amount),
      status: 'Pending'
    });

    // Create user notification
    await Notification.create({
      id: genId('N'),
      userId: targetUser.id,
      title: '⏳ Yêu cầu nâng cấp đang chờ xét duyệt',
      message: `Yêu cầu nâng cấp lên gói ${targetTier} (Mã xác nhận: ${paymentCode}) đã được ghi nhận. Admin/Staff sẽ duyệt trong thời gian sớm nhất!`,
      read: false,
      time: 'Vừa xong'
    });

    res.status(201).json({
      request,
      user: null // Will remain Free until Admin approves
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi gửi yêu cầu nâng cấp.' });
  }
});

// Admin/Staff Approve
app.put('/api/payments/requests/:id/approve', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const request = await PaymentRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Yêu cầu không tồn tại.' });
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý từ trước.' });
    }

    request.status = 'Approved';
    request.resolvedAt = new Date();
    await request.save();

    // Upgrade the target user
    const targetUser = await User.findByPk(request.userId);
    if (targetUser) {
      targetUser.subscription = request.targetTier;
      await targetUser.save();

      // Create notification for target user
      await Notification.create({
        id: genId('N'),
        userId: targetUser.id,
        title: '✅ Yêu cầu nâng cấp đã được DUYỆT!',
        message: `Tài khoản ${targetUser.email} đã được nâng cấp lên gói ${request.targetTier}. Khám phá ngay đặc quyền mới!`,
        read: false,
        time: 'Vừa xong'
      });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi duyệt nâng cấp gói.' });
  }
});

// Admin/Staff Reject
app.put('/api/payments/requests/:id/reject', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const request = await PaymentRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Yêu cầu không tồn tại.' });
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý từ trước.' });
    }

    request.status = 'Rejected';
    request.note = reason || '';
    request.resolvedAt = new Date();
    await request.save();

    // Notify the target user
    await Notification.create({
      id: genId('N'),
      userId: request.userId,
      title: '❌ Yêu cầu nâng cấp bị từ chối',
      message: `Yêu cầu nâng cấp lên gói ${request.targetTier} của ${request.userEmail} đã bị từ chối.${reason ? ` Lý do: ${reason}` : ''} Vui lòng liên hệ hỗ trợ.`,
      read: false,
      time: 'Vừa xong'
    });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi từ chối nâng cấp gói.' });
  }
});

// --- ADMIN USERS MANAGEMENTS ---

// Get all users
app.get('/api/admin/users', authenticateToken, isStaffOrAdmin, async (req, res) => {
  try {
    const list = await User.findAll({ 
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // We can compute learning progress average for each user in db
    const progresses = await CourseProgress.findAll();
    const usersFormatted = list.map(u => {
      const uProgs = progresses.filter(p => p.userId === u.id);
      const totalProg = uProgs.reduce((acc, curr) => acc + curr.progressPercent, 0);
      const avgProgress = uProgs.length ? Math.round(totalProg / 11) : 0; // Out of 11 courses

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        subscription: u.subscription,
        status: u.status,
        idNumber: u.idNumber,
        dob: u.dob,
        gender: u.gender,
        address: u.address,
        idIssueDate: u.idIssueDate,
        riskProfile: u.riskProfile,
        learningProgress: Math.min(100, avgProgress),
        createdAt: u.createdAt
      };
    });

    res.json(usersFormatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải danh sách người dùng.' });
  }
});

// Toggle block/unblock user
app.put('/api/admin/users/:id/block', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự khóa tài khoản của chính mình.' });
  }

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    target.status = target.status === 'Blocked' ? 'Active' : 'Blocked';
    await target.save();
    res.json({ id: target.id, status: target.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi thay đổi trạng thái khóa tài khoản.' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự xóa chính mình.' });
  }

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    await target.destroy();
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi xóa người dùng.' });
  }
});

// Approve/Reject KYC
app.put('/api/admin/users/:id/kyc', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    target.status = isApproved ? 'Active' : 'Rejected KYC';
    await target.save();

    await Notification.create({
      id: genId('N'),
      userId: target.id,
      title: isApproved ? '🎉 Hồ sơ KYC đã được chấp nhận!' : '❌ Hồ sơ KYC bị từ chối',
      message: isApproved 
        ? 'Tài khoản của bạn đã được xác minh danh tính thành công. Bây giờ bạn có thể trải nghiệm đầy đủ các chức năng!'
        : 'Hình ảnh CCCD/CMND không rõ ràng hoặc không hợp lệ. Vui lòng cập nhật lại hoặc liên hệ staff hỗ trợ.',
      read: false,
      time: 'Vừa xong'
    });

    res.json({ id: target.id, status: target.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi phê duyệt KYC.' });
  }
});

// Direct verify/upgrade subscription via Admin
app.put('/api/admin/users/:id/verify', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    target.subscription = target.subscription === 'Free' ? 'Premium' : 'Mentor+';
    await target.save();
    res.json({ id: target.id, subscription: target.subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi nâng cấp nhanh người dùng.' });
  }
});

// Admin update user details
app.put('/api/admin/users/:id', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, subscription, riskProfile } = req.body;

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    if (name !== undefined) target.name = name;
    if (subscription !== undefined) target.subscription = subscription;
    if (riskProfile !== undefined) target.riskProfile = riskProfile === 'None' ? null : riskProfile;

    await target.save();
    res.json({
      id: target.id,
      name: target.name,
      subscription: target.subscription,
      riskProfile: target.riskProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật thông tin người dùng.' });
  }
});

// --- NOTIFICATION ROUTERS ---

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const list = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải thông báo.' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Notification.findOne({ where: { id, userId: req.user.id } });
    if (item) {
      item.read = true;
      await item.save();
    }
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đọc thông báo.' });
  }
});

// --- CHAT AI MENTOR ROUTER ---
app.post('/api/chat', async (req, res) => {
  const { message, history, userContext } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Thiếu tin nhắn.' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const vnTime = new Date(utc + (3600000 * 7));
      
      const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayOfWeek = weekdays[vnTime.getDay()];
      const date = String(vnTime.getDate()).padStart(2, '0');
      const month = String(vnTime.getMonth() + 1).padStart(2, '0');
      const year = vnTime.getFullYear();
      const hours = String(vnTime.getHours()).padStart(2, '0');
      const minutes = String(vnTime.getMinutes()).padStart(2, '0');
      const seconds = String(vnTime.getSeconds()).padStart(2, '0');

      const currentDateString = `${hours}:${minutes}:${seconds} - ${dayOfWeek}, ngày ${date} tháng ${month} năm ${year}`;

      // Fetch Real-time Crypto Prices (Binance) & Stock Prices (Yahoo Finance) if refers to market data
      let realTimeMarketData = '';
      const lowerMsg = message.toLowerCase();
      const needsMarketData = lowerMsg.includes('bitcoin') || lowerMsg.includes('btc') || 
                              lowerMsg.includes('ethereum') || lowerMsg.includes('eth') || 
                              lowerMsg.includes('giá coin') || lowerMsg.includes('tiền số') || 
                              lowerMsg.includes('crypto') || lowerMsg.includes('cổ phiếu') || 
                              lowerMsg.includes('giá cổ phiếu') || lowerMsg.includes('fpt') || 
                              lowerMsg.includes('vcb') || lowerMsg.includes('hpg') || 
                              lowerMsg.includes('tsla') || lowerMsg.includes('aapl') ||
                              lowerMsg.includes('thị trường') || lowerMsg.includes('chứng khoán') ||
                              lowerMsg.includes('số liệu') || lowerMsg.includes('giá trị') ||
                              lowerMsg.includes('tỷ giá') || lowerMsg.includes('usd') ||
                              lowerMsg.includes('vnd') || lowerMsg.includes('đô la') ||
                              lowerMsg.includes('bao nhiêu') || lowerMsg.includes('giá');

      const fetchWithTimeout = async (url, options = {}, timeout = 2500) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
          const res = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(timer);
          return res;
        } catch (e) {
          clearTimeout(timer);
          throw e;
        }
      };

      if (needsMarketData) {
        try {
          // Dynamic Crypto Ticker Fetch
          const cryptoSymbols = ['btc', 'eth', 'sol', 'bnb', 'doge', 'ada', 'xrp', 'trx', 'link', 'avax', 'dot', 'shib', 'near', 'pepe', 'uni', 'ltc'];
          const foundCryptos = cryptoSymbols.filter(sym => lowerMsg.includes(sym));

          // Dynamic Stock Ticker Fetch
          const knownVietStocks = ['fpt', 'vcb', 'hpg', 'vnm', 'mwg', 'vic', 'msn', 'vre', 'hdb', 'mbb', 'acb', 'gas', 'ssi', 'tcb', 'vhm', 'sab', 'vnd', 'dig', 'nlg', 'pdr'];
          const knownUSStocks = ['tsla', 'aapl', 'msft', 'nvda', 'amzn', 'googl', 'meta', 'nflx', 'amd', 'intc', 'coin', 'baba'];

          const foundVietStocks = knownVietStocks.filter(sym => lowerMsg.includes(sym));
          const foundUSStocks = knownUSStocks.filter(sym => lowerMsg.includes(sym));

          const fetchedData = [];

          // 1. Fetch Crypto Tickers
          const cryptosToFetch = foundCryptos.length > 0 ? foundCryptos : (lowerMsg.includes('coin') || lowerMsg.includes('crypto') || lowerMsg.includes('tiền số') ? ['btc', 'eth'] : []);
          for (const coin of cryptosToFetch) {
            const sym = coin.toUpperCase();
            try {
              const res = await fetchWithTimeout(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}USDT`);
              if (res.ok) {
                const data = await res.json();
                fetchedData.push(`   - Giá ${sym} (Crypto): $${parseFloat(data.price).toLocaleString('en-US')} USD`);
              }
            } catch (e) {
              console.error(`Binance fetch error for ${sym}:`, e.message);
            }
          }

          // 2. Fetch Vietnamese Stocks
          const vietStocksToFetch = foundVietStocks.length > 0 ? foundVietStocks : (lowerMsg.includes('cổ phiếu') || lowerMsg.includes('chứng khoán') || lowerMsg.includes('thị trường') ? ['fpt', 'vcb', 'hpg'] : []);
          for (const stock of vietStocksToFetch) {
            const sym = stock.toUpperCase();
            try {
              const res = await fetchWithTimeout(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}.VN?interval=1d&range=1d`, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
              }, 2000);
              if (res.ok) {
                const data = await res.json();
                const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
                if (price) {
                  fetchedData.push(`   - Cổ phiếu ${sym} (Việt Nam): ${price.toLocaleString('vi-VN')} VND`);
                }
              }
            } catch (e) {
              console.error(`Yahoo Finance fetch error for ${sym}:`, e.message);
            }
          }

          // 3. Fetch US Stocks
          const usStocksToFetch = foundUSStocks.length > 0 ? foundUSStocks : (lowerMsg.includes('cổ phiếu') || lowerMsg.includes('chứng khoán') || lowerMsg.includes('thị trường') ? ['tsla', 'aapl'] : []);
          for (const stock of usStocksToFetch) {
            const sym = stock.toUpperCase();
            try {
              const res = await fetchWithTimeout(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
              }, 2000);
              if (res.ok) {
                const data = await res.json();
                const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
                if (price) {
                  fetchedData.push(`   - Cổ phiếu ${sym} (Mỹ): $${price.toLocaleString('en-US')} USD`);
                }
              }
            } catch (e) {
              console.error(`Yahoo Finance fetch error for ${sym}:`, e.message);
            }
          }

          // 4. Fetch USD/VND Exchange Rate
          const needsExchangeRate = lowerMsg.includes('tỷ giá') || lowerMsg.includes('usd') || lowerMsg.includes('đô la') || lowerMsg.includes('ngoại tệ') || lowerMsg.includes('vnd');
          if (needsExchangeRate) {
            try {
              const res = await fetchWithTimeout('https://query1.finance.yahoo.com/v8/finance/chart/USDVND=X?interval=1d&range=1d', {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
              }, 2000);
              if (res.ok) {
                const data = await res.json();
                const rate = data.chart?.result?.[0]?.meta?.regularMarketPrice;
                if (rate) {
                  fetchedData.push(`   - Tỷ giá USD/VND: 1 USD = ${rate.toLocaleString('vi-VN')} VND`);
                }
              }
            } catch (e) {
              console.error('Exchange rate fetch error:', e.message);
            }
          }

          if (fetchedData.length > 0) {
            realTimeMarketData = `
DỮ LIỆU THỊ TRƯỜNG THỜI GIAN THỰC (REAL-TIME MARKET DATA):
${fetchedData.join('\n')}
`;
          }
        } catch (e) {
          console.error('Dynamic market data fetch error:', e);
        }
      }

      let userContextPrompt = '';
      if (userContext) {
        userContextPrompt = `
DỮ LIỆU CÁ NHÂN CỦA NGƯỜI DÙNG HIỆN TẠI (Hãy sử dụng để trả lời cá nhân hóa thông minh):
- Tên người dùng: ${userContext.name || 'N/A'}
- Số dư tài khoản giả lập: ${userContext.balance ? userContext.balance.toLocaleString('vi-VN') + ' VND' : 'N/A'}
- Hồ sơ rủi ro đầu tư (Risk Profile): ${userContext.riskProfile || 'Chưa thực hiện khảo sát'}
- Điểm học tập tích lũy (XP): ${userContext.xp || 0} XP
- Chuỗi ngày hoạt động liên tục (Streak): ${userContext.streak || 0} ngày
- Các mục tiêu tài chính của họ: ${userContext.goals && Array.isArray(userContext.goals) ? userContext.goals.map(g => `\n  * ${g.name} (Mục tiêu: ${g.target.toLocaleString('vi-VN')} VND, Hiện có: ${g.current.toLocaleString('vi-VN')} VND)`).join('') : 'Chưa thiết lập'}
`;
      }

      const financialKnowledgePrompt = `
CƠ SỞ DỮ LIỆU TÀI CHÍNH CHUYÊN NGHIỆP BỔ TRỢ (Hãy tham chiếu khi tư vấn & đào tạo người dùng):

1. QUẢN LÝ TÀI CHÍNH CÁ NHÂN & LẬP NGÂN SÁCH:
   - Quy tắc 50/30/20: Phân bổ thu nhập vào 3 phần: 50% Cho các nhu cầu thiết yếu (nhà ở, ăn uống, hóa đơn, đi lại); 30% Cho sở thích cá nhân và nhu cầu linh hoạt; 20% Cho các mục tiêu tích lũy, đầu tư và trả nợ.
   - Quy tắc 6 Chiếc Lọ (6 Jars Method): 
     * Lọ 1 (NEC - Thiết yếu): 55%
     * Lọ 2 (LTSS - Tiết kiệm dài hạn): 10%
     * Lọ 3 (EDU - Giáo dục/Học tập): 10%
     * Lọ 4 (FFA - Tự do tài chính/Đầu tư): 10%
     * Lọ 5 (PLAY - Hưởng thụ/Giải trí): 10%
     * Lọ 6 (GIVE - Từ thiện/Giúp đỡ): 5%
   - Quỹ Dự phòng Khẩn cấp (Emergency Fund): Khoản tiền mặt an toàn bằng 3-6 tháng chi phí sinh hoạt thiết yếu của cá nhân hoặc gia đình, dùng để ứng phó đột xuất (bệnh tật, mất việc) mà không cần đi vay mượn hay thanh lý tài sản đầu tư.

2. CÁC NGUYÊN TẮC VÀ CHIẾN LƯỢC ĐẦU TƯ:
   - Lãi Kép (Compound Interest) & Quy tắc 72: Lãi kép được ví như kỳ quan thứ 8. Công thức: A = P * (1 + r/n)^(n*t). Quy tắc 72 giúp ước lượng thời gian gấp đôi tài sản: Số năm gấp đôi = 72 / (Lãi suất hàng năm %).
   - Trung Bình Giá (DCA - Dollar Cost Averaging): Mua đều đặn định kỳ một lượng tài sản cố định bằng tiền (ví dụ mỗi tháng 2 triệu mua chứng chỉ quỹ) bất kể giá cao hay thấp. Giúp tối ưu hóa giá vốn dài hạn, giảm thiểu ảnh hưởng của cảm xúc và biến động ngắn hạn.
   - Phân Bổ Tài Sản (Asset Allocation): Phân chia tiền vào các lớp tài sản khác nhau (Cổ phiếu, Trái phiếu, Tiền gửi, Vàng, Bất động sản) tùy thuộc vào độ tuổi và khẩu vị rủi ro để giảm tương quan biến động.
   - Đa Dạng Hóa (Diversification): Tránh bỏ tất cả trứng vào một giỏ để giảm rủi ro phi hệ thống của từng cổ phiếu hay tài sản riêng lẻ.

3. CHI TIẾT CÁC KÊNH ĐẦU TƯ TẠI VIỆT NAM:
   - Tiền Gửi Tiết Kiệm: Kênh an toàn nhất, thanh khoản cao, bảo vệ vốn gốc tốt, lãi suất dao động từ 4% - 7%/năm tùy kỳ hạn và ngân hàng.
   - Vàng (Gold): Tài sản trú ẩn an toàn truyền thống chống lạm phát và bất ổn vĩ mô. Tuy nhiên không tạo dòng tiền thụ động (lãi suất).
   - Chứng Chỉ Quỹ Mở (Mutual Funds): Quản lý bởi các công ty quản lý quỹ chuyên nghiệp (Dragon Capital, VinaCapital, SSIAM...). Phân loại: Quỹ mở cổ phiếu (tăng trưởng cao, rủi ro cao), Quỹ mở trái phiếu (an toàn hơn, lợi nhuận ổn định hơn tiết kiệm), Quỹ cân bằng (kết hợp cả hai).
   - Chứng chỉ Quỹ ETF (Exchange Traded Fund): Niêm yết và giao dịch trực tiếp trên sàn chứng khoán giống cổ phiếu. Lệ phí quản lý cực thấp. Các quỹ nổi bật:
     * FUEVFVND (ETF DCVFMVN DIAMOND): Mô phỏng rổ chỉ số VN DIAMOND, tập trung các cổ phiếu hết room ngoại lớn có các chỉ số cơ bản cực tốt.
     * E1VFVN30: Mô phỏng chỉ số VN30, gồm 30 doanh nghiệp lớn nhất sàn HSX.
     * FUESSVFL (ETF SSVAM VNFIN LEAD): Tập trung ngành tài chính (ngân hàng, chứng khoán).
   - Cổ Phiếu Riêng Lẻ (Stocks): Lợi nhuận cao đi kèm rủi ro lớn nhất. Đòi hỏi kiến thức phân tích cơ bản (doanh thu, lợi nhuận, P/E, P/B) và phân tích kỹ thuật.
   - Bất Động Sản (Real Estate): Tiềm năng sinh lời lớn dài hạn, có thể thế chấp để đòn bẩy. Tuy nhiên thanh khoản thấp, yêu cầu số vốn ban đầu lớn.

4. HIỂU BIẾT VỀ NỢ VÀ TÍN DỤNG:
   - Nợ Tốt (Good Debt): Khoản nợ giúp gia tăng tài sản hoặc tạo ra dòng tiền trong tương lai (ví dụ: vay học tập đầu tư bản thân, vay mua nhà trả góp hợp lý, vay kinh doanh).
   - Nợ Xấu (Bad Debt): Khoản nợ tiêu dùng cho các tài sản mất giá nhanh chóng theo thời gian (ví dụ: vay mua xe sang vượt quá khả năng, vay thẻ tín dụng mua sắm quần áo thời trang, mua trả góp đồ công nghệ giải trí).
   - Chỉ số DTI (Debt-to-Income): Tỷ lệ tổng nợ phải trả hàng tháng trên tổng thu nhập gộp. Nên giữ DTI dưới 36% để đảm bảo an toàn tài chính.

5. PHÒNG NGỪA RỦI RO & BẪY LỪA ĐẢO TÀI CHÍNH:
   - Dấu Hiệu Ponzi/Đa Cấp Biến Tướng: Cam kết lãi suất cố định cực cao và phi thực tế (10-30%/tháng), hoàn tiền nhanh, bắt buộc giới thiệu người mới để hưởng hoa hồng, thiếu sản phẩm hoặc dịch vụ thực tế, pháp lý mập mờ hoặc đăng ký ở thiên đường thuế nước ngoài.
   - Tín Dụng Đen / App Vay Tiền Nhanh: Lãi suất thực tế cắt cổ (có thể lên tới vài trăm %/năm), đe dọa đòi nợ khủng bố tinh thần.
   - Nguyên tắc cốt lõi phòng tránh lừa đảo: "High Risk, High Return" - Lợi nhuận cao luôn đi đôi với rủi ro cao. Không có bất kỳ kênh đầu tư hợp pháp nào mang lại lãi suất cao vượt trội mà lại "hoàn toàn không có rủi ro".
`;

      let systemInstruction = '';
      const chatType = req.body.chatType || 'mentor';

      if (chatType === 'chatbox') {
        systemInstruction = `Bạn là AI Trợ lý SAVE+, một trợ lý học tập tài chính thân thiện, chính xác và có khả năng giải đáp mọi thắc mắc của người dùng.

Mục tiêu:
- Giải đáp và trả lời đầy đủ, thông minh và chính xác TẤT CẢ các câu hỏi của người dùng đưa ra, bao gồm cả các câu hỏi thuộc mọi lĩnh vực khác ngoài tài chính (như lịch sử, khoa học, lập trình, đời sống, sức khỏe, giải trí, v.v.). Tuyệt đối không từ chối trả lời bất cứ câu hỏi nào.
- QUY TẮC BẮT BUỘC: Bạn được quyền và PHẢI trả lời tất cả các câu hỏi thuộc mọi chủ đề ngoài tài chính (ví dụ: toán học, lịch sử, văn hóa, khoa học, lập trình, địa lý, ngoại ngữ, mẹo vặt cuộc sống, v.v.). Tuyệt đối KHÔNG ĐƯỢC từ chối hay nói rằng bạn là trợ lý tài chính nên không thể trả lời.
- Trả lời nhanh các câu hỏi phổ thông về tài chính cá nhân, tiết kiệm, đầu tư cơ bản, ETF, lãi kép, đa dạng hóa, lập ngân sách và tránh lừa đảo tài chính.
- Trả lời hoàn toàn bằng tiếng Việt.
- Chỉ cung cấp kiến thức giáo dục đối với các câu hỏi về tài chính, không đưa ra khuyến nghị mua/bán chứng khoán cụ thể.
- Giữ câu trả lời ngắn gọn, dễ hiểu, đi thẳng vào ý chính.
- Bạn hoạt động trên nền tảng mô hình Gemini 2.5 mới nhất của Google. Nếu người dùng hỏi về mô hình, công nghệ hay phiên bản AI của bạn, hãy tự hào trả lời bạn là trợ lý SAVE+ sử dụng mô hình Gemini 2.5.

Ngữ cảnh cần dùng:
- Trang hiện tại của người dùng: ${userContext?.route_context || '/'}
- Gói dịch vụ: ${userContext?.subscription || 'Free'}
- Khẩu vị rủi ro: ${userContext?.riskProfile || 'Chưa khảo sát'}
- Ngày hiện tại: ${currentDateString} (Giờ Việt Nam)
${realTimeMarketData}

Quy tắc phản hồi:
- Free hoặc Mentor: trả lời rất ngắn, khoảng 80 từ (trừ các câu hỏi đặc thù cần nhiều thông tin chi tiết hơn).
- Premium: trả lời chi tiết hơn, có thể dùng bullet points.
- Mentor+: trả lời sâu hơn, nhưng vẫn rõ ràng và thực tế.
- Nếu câu hỏi liên quan đến đầu tư, ưu tiên giải thích khái niệm, rủi ro, nguyên tắc quản lý vốn và tư duy dài hạn.
- Nếu người dùng cần phân tích chuyên sâu hơn, khuyến khích họ sang trang AI Mentor.
- Không nhắc đến giới hạn kỹ thuật nội bộ của hệ thống.
- Luôn giữ giọng điệu hiện đại, tự nhiên, chuyên nghiệp.`;
      } else {
        systemInstruction = `Bạn là AI Mentor học tập tài chính của SAVE+, đóng vai một cố vấn giáo dục tài chính chuyên sâu và là một người bạn đồng hành giải đáp mọi tri thức cho người dùng.

Mục tiêu:
- Trả lời thông minh, đầy đủ, có chiều sâu và chính xác TẤT CẢ các câu hỏi của người dùng đưa ra thuộc bất kỳ lĩnh vực nào (bao gồm khoa học, lập trình, công nghệ, lịch sử, văn hóa, giải trí, v.v.). Không từ chối hay hạn chế câu trả lời đối với các câu hỏi ngoài ngành tài chính.
- QUY TẮC BẮT BUỘC: Bạn được quyền và PHẢI trả lời tất cả các câu hỏi thuộc mọi chủ đề ngoài tài chính (ví dụ: toán học, lịch sử, văn hóa, khoa học, lập trình, địa lý, ngoại ngữ, mẹo vặt cuộc sống, v.v.). Tuyệt đối KHÔNG ĐƯỢC từ chối hay nói rằng bạn là trợ lý tài chính nên không thể trả lời.
- Giải thích rõ các khái niệm tài chính từ cơ bản đến nâng cao.
- Hỗ trợ người dùng xây dựng tư duy đầu tư, quản lý tài sản, kiểm soát rủi ro và lập kế hoạch tài chính cá nhân.
- Trả lời hoàn toàn bằng tiếng Việt.
- Chỉ cung cấp nội dung giáo dục đối với các câu hỏi về tài chính, không đưa ra lời khuyên mua/bán chứng khoán cụ thể.
- Phân tích có chiều sâu, có cấu trúc, dễ theo dõi.
- Bạn hoạt động trên nền tảng mô hình Gemini 2.5 mới nhất của Google. Nếu người dùng hỏi về mô hình, công nghệ hay phiên bản AI của bạn, hãy tự hào trả lời bạn là AI Mentor của SAVE+ sử dụng mô hình Gemini 2.5.

Ngữ cảnh cần dùng:
- Gói dịch vụ: ${userContext?.subscription || 'Free'}
- Khẩu vị rủi ro: ${userContext?.riskProfile || 'Chưa khảo sát'}
- Ngày hiện tại: ${currentDateString} (Giờ Việt Nam)
${userContextPrompt}
${financialKnowledgePrompt}
${realTimeMarketData}

Quy tắc phản hồi:
- Free hoặc Mentor: trả lời ngắn gọn, dưới 100 từ, rõ ý, dễ hiểu (trừ các câu hỏi cần giải trình chi tiết hoặc hướng dẫn cụ thể).
- Nếu người dùng Premium: trả lời đầy đủ hơn, có bullet points, cá nhân hóa theo khẩu vị rủi ro.
- Nếu người dùng Mentor+: trả lời chuyên sâu, có phân tích đa chiều, so sánh lựa chọn, lưu ý rủi ro và chiến lược.
- Nếu người dùng hỏi về tiết kiệm, đầu tư, ETF, lãi kép, phân bổ tài sản, Ponzi hoặc lừa đảo tài chính, hãy giải thích kỹ nhưng vẫn thực tế.
- Không hỏi lan man, không vòng vo.
- Không nhắc đến giới hạn nội bộ của hệ thống.
- Giữ giọng điệu chuyên nghiệp, thẳng vào vấn đề, giống một chuyên gia tư vấn tài chính giáo dục.`;
      }

      // Build contents array for Gemini
      const contents = [];
      if (history && Array.isArray(history)) {
        // Filter out initial bot messages or format appropriately
        history.forEach(h => {
          if (h.sender === 'user' || h.sender === 'bot') {
            contents.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            });
          }
        });
      }
      // Add current message with explicit realtime timestamp context
      contents.push({
        role: 'user',
        parts: [{ text: `[Lưu ý hệ thống: Thời gian thực tế hiện tại là ${currentDateString}. Hãy dựa vào đây để trả lời chính xác các câu hỏi realtime.]\n\n${message}` }]
      });

      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-3.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-pro-exp'
      ];

      let generatedReply = '';
      for (const model of candidateModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              }
            })
          });

          const data = await response.json();
          if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            generatedReply = data.candidates[0].content.parts[0].text;
            break; // Found a working model!
          } else {
            console.warn(`Model ${model} failed with status ${response.status}:`, data.error?.message || data);
          }
        } catch (err) {
          console.error(`Fetch error for model ${model}:`, err);
        }
      }

      if (generatedReply) {
        return res.json({ response: generatedReply });
      }
    } catch (err) {
      console.error('Gemini main pipeline error:', err);
    }
  }

  // Fallback to rule-based response if Gemini API key is missing or failed
  let replyText = '';
  const lower = message.toLowerCase();
  if (lower.includes('tiết kiệm') || lower.includes('đầu tư')) {
    replyText = `🤔 Nên gửi tiết kiệm hay đầu tư? Đây là câu hỏi rất hay cho người mới bắt đầu!\n\n` +
      `• Gửi tiết kiệm: Thích hợp cho Quỹ khẩn cấp (3-6 tháng chi phí). An toàn cao, lãi suất cố định (~5-6%/năm tại VN). Bạn có thể rút bất kỳ lúc nào.\n` +
      `• Đầu tư: Thích hợp cho dòng tiền nhàn rỗi dài hạn (>3 năm). Lợi nhuận kỳ vọng cao hơn (10-15%/năm) qua các quỹ chỉ số ETF hoặc cổ phiếu doanh nghiệp, nhưng giá trị có thể dao động ngắn hạn.\n\n` +
      `💡 Lời khuyên Socratic của tôi: Bạn đã xây dựng xong Quỹ khẩn cấp cho bản thân chưa? Bạn cảm thấy thế nào nếu số tiền đầu tư tạm thời giảm 5% vào tuần tới?`;
  } else if (lower.includes('etf')) {
    replyText = `📊 Quỹ ETF (Exchange Traded Fund) hoạt động giống như một chiếc giỏ chứa hàng chục cổ phiếu khác nhau niêm yết trên sàn.\n\n` +
      `Ví dụ: Thay vì bạn mua riêng lẻ FPT, VCB, HPG; bạn chỉ cần mua 1 chứng chỉ quỹ ETF VN30. \n\n` +
      `Lợi thế lớn nhất là: Đa dạng hóa tự động với chi phí cực thấp, tránh rủi ro "mất trắng" nếu một công ty cụ thể gặp sự cố. Bạn thấy mô hình này có thuận lợi hơn tự mua cổ phiếu lẻ không?`;
  } else if (lower.includes('đa dạng hóa')) {
    replyText = `🥚 Đa dạng hóa chính là nguyên tắc kinh điển: "Đừng bao giờ bỏ tất cả trứng vào một giỏ".\n\n` +
      `Trong tài chính, điều này nghĩa là phân bổ tiền của bạn vào nhiều lớp tài sản khác nhau:\n` +
      `1. Tiền mặt tích lũy (Quỹ khẩn cấp)\n` +
      `2. Trái phiếu (Thu nhập cố định, rủi ro thấp)\n` +
      `3. Cổ phiếu/ETF (Tăng trưởng dài hạn, rủi ro cao hơn)\n\n` +
      `Nếu một giỏ trứng bị rơi (ví dụ cổ phiếu giảm giá), các giỏ còn lại (tiết kiệm, trái phiếu) vẫn nâng đỡ tài sản của bạn không bị ảnh hưởng nặng nề. Bạn hiện đang phân bổ dòng tiền nhàn rỗi của mình thế nào?`;
  } else if (lower.includes('lừa đảo') || lower.includes('ponzi')) {
    replyText = `🚨 Bẫy lừa đảo tài chính Ponzi thường núp bóng các dự án đầu tư công nghệ mới, cam kết lợi nhuận phi thực tế.\n\n` +
      `Dấu hiệu nhận biết cốt lõi:\n` +
      `1. Lợi nhuận siêu cao & cam kết KHÔNG RỦI RO (ví dụ: lãi 1%/ngày, 30%/tháng).\n` +
      `2. Trả hoa hồng cao khi lôi kéo thêm người tham gia (Đa cấp biến tướng).\n` +
      `3. Pháp lý mập mờ, nạp rút tiền qua các cổng trung gian không có giấy phép của Nhà nước Việt Nam.\n\n` +
      `Nguyên tắc bất di bất dịch: Lợi nhuận cao luôn đi đôi với rủi ro cao. Bạn đã bao giờ bắt gặp lời mời chào đầu tư nào có các biểu hiện trên chưa?`;
  } else {
    replyText = `Cảm ơn câu hỏi của bạn. Để hiểu rõ hơn dưới góc nhìn học tập:\n\n` +
      `Mục tiêu của SAVE+ là trang bị tư duy tài chính dài hạn. Với câu hỏi "${message}", hãy cùng phân tích xem: \n` +
      `• Đâu là phần rủi ro lớn nhất bạn muốn tránh?\n` +
      `• Kế hoạch sử dụng số vốn đó là trong ngắn hạn hay dài hạn?\n\n` +
      `Hãy chia sẻ thêm suy nghĩ của bạn, tôi sẽ giúp bạn mổ xẻ chi tiết từng khái niệm học thuật!`;
  }

  res.json({ response: replyText });
});

// --- SEED DATABASE ON START ---

const INITIAL_COURSES = [
  {
    id: 'C01',
    title: 'Phần 1: ETF & Chứng chỉ quỹ',
    category: 'ETF',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '5 phút',
    description: 'ETF & Chứng chỉ quỹ cho người mới bắt đầu. Tiết kiệm thời gian, đa dạng hóa tối đa.',
    tags: ['ETF', 'Cơ bản'],
    lessons: [
      {
        id: 'L1.1',
        title: 'ETF & Chứng chỉ quỹ cho người mới',
        videoUrl: 'https://www.youtube.com/embed/BLaWYP4-1N4',
        reading: 'Nội dung bài học:\nETF (Exchange-Traded Fund) là một loại quỹ đầu tư được giao dịch trên sàn chứng khoán giống như cổ phiếu. Thay vì mua riêng lẻ từng cổ phiếu, nhà đầu tư có thể mua một ETF để sở hữu nhiều loại tài sản cùng lúc.\n\nVí dụ:\nMột ETF có thể bao gồm cổ phiếu của Apple, Microsoft, Google và Amazon. Khi mua ETF, người dùng đang đầu tư vào cả danh mục thay vì một công ty duy nhất.\n\nLợi ích của ETF:\n- Đa dạng hóa danh mục đầu tư\n- Giảm rủi ro hơn so với mua một cổ phiếu riêng lẻ\n- Chi phí thấp hơn nhiều quỹ truyền thống\n- Phù hợp với người mới bắt đầu\n\nRủi ro cần biết:\n- ETF vẫn chịu ảnh hưởng bởi biến động thị trường\n- Không đảm bảo lợi nhuận\n- Một số ETF có phí quản lý\n\nVí dụ thực tế:\nNếu một người chỉ mua cổ phiếu của 1 công ty và công ty đó giảm mạnh, họ có thể lỗ nhiều. Nhưng ETF giúp chia tiền vào nhiều công ty khác nhau nên rủi ro thấp hơn.\n\nNguồn tham khảo:\n- Investopedia – ETF Definition\n- SEC Investor.gov – ETF Basics'
      }
    ],
    quizzes: [
      {
        question: 'ETF là gì?',
        options: ['A. Ví điện tử', 'B. Quỹ đầu tư giao dịch trên sàn', 'C. Tiền điện tử', 'D. Tài khoản tiết kiệm'],
        answerIndex: 1,
        explanation: 'ETF (Exchange-Traded Fund) là quỹ đầu tư được giao dịch trên sàn chứng khoán tương tự như một mã cổ phiếu thông thường.'
      },
      {
        question: 'Ưu điểm lớn của ETF là gì?',
        options: ['A. Không có rủi ro', 'B. Đảm bảo lợi nhuận', 'C. Đa dạng hóa đầu tư', 'D. Giá luôn tăng'],
        answerIndex: 2,
        explanation: 'Ưu điểm lớn nhất của ETF là đa dạng hóa. Sở hữu chứng chỉ quỹ giúp phân bổ vốn vào hàng chục doanh nghiệp lớn cùng lúc.'
      },
      {
        question: 'ETF thường phù hợp với đối tượng nào?',
        options: ['A. Chỉ chuyên gia tài chính', 'B. Người mới bắt đầu đầu tư', 'C. Chỉ doanh nghiệp lớn', 'D. Người không muốn học tài chính'],
        answerIndex: 1,
        explanation: 'ETF rất thích hợp với người mới bắt đầu vì nó không yêu cầu quá nhiều kỹ năng phân tích báo cáo tài chính từng mã cổ phiếu đơn lẻ.'
      },
      {
        question: 'Khi mua chứng chỉ quỹ ETF, nhà đầu tư đang thực hiện việc gì?',
        options: ['A. Đầu tư tập trung vào một cổ phiếu duy nhất', 'B. Đầu tư gián tiếp vào toàn bộ danh mục cổ phiếu trong rổ chỉ số', 'C. Gửi tiết kiệm lấy lãi cố định', 'D. Mua các hợp đồng phái sinh đòn bẩy'],
        answerIndex: 1,
        explanation: 'Sở hữu chứng chỉ quỹ ETF tương đương việc bạn đầu tư gián tiếp vào toàn bộ các doanh nghiệp có trong danh mục cơ cấu của quỹ đó.'
      },
      {
        question: 'Một rủi ro tiềm ẩn của quỹ ETF là gì?',
        options: ['A. ETF không thể giao dịch trên sàn chứng khoán', 'B. Giá chứng chỉ quỹ ETF có thể biến động giảm theo xu hướng chung của thị trường', 'C. Phí quản lý luôn cao hơn quỹ chủ động', 'D. Không bao giờ nhận được cổ tức'],
        answerIndex: 1,
        explanation: 'Dù đa dạng hóa tốt, ETF vẫn chịu rủi ro hệ thống của thị trường chung. Khi thị trường giảm, giá chứng chỉ quỹ cũng giảm.'
      }
    ]
  },
  {
    id: 'C02',
    title: 'Phần 2: Lãi kép',
    category: 'Savings',
    thumbnail: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '5 phút',
    description: 'Khám phá sức mạnh của lãi kép và lý do tại sao bắt đầu tích lũy sớm tạo ra sự khác biệt khổng lồ.',
    tags: ['Lãi kép', 'Cơ bản'],
    lessons: [
      {
        id: 'L2.1',
        title: 'Sức mạnh của lãi kép',
        videoUrl: 'https://www.youtube.com/embed/_CbicTTCkjg',
        reading: 'Nội dung bài học:\nLãi kép là quá trình mà tiền lãi bạn kiếm được tiếp tục tạo ra thêm tiền lãi mới theo thời gian. Đây được xem là một trong những yếu tố quan trọng nhất trong đầu tư dài hạn.\n\nVí dụ:\nBạn đầu tư 1 triệu đồng với lợi nhuận 10%/năm.\n- Sau năm đầu tiên, bạn có 1.100.000 đồng.\n- Năm tiếp theo, lợi nhuận sẽ được tính trên 1.100.000 đồng chứ không còn là 1 triệu đồng ban đầu.'
      }
    ],
    quizzes: [
      {
        question: 'Lãi kép hoạt động như thế nào?',
        options: ['A. Chỉ tính lãi trên số tiền ban đầu', 'B. Lãi tiếp tục sinh ra thêm lãi mới', 'C. Không liên quan đến đầu tư', 'D. Chỉ áp dụng cho ngân hàng'],
        answerIndex: 1,
        explanation: 'Lãi kép sinh ra do lãi thu được của chu kỳ trước được gộp chung vào vốn để tiếp tục sinh lãi ở các chu kỳ sau.'
      },
      {
        question: 'Yếu tố nào sau đây đóng vai trò quyết định nhất đến sức mạnh của lãi kép trong dài hạn?',
        options: ['A. Tần suất giao dịch liên tục mỗi ngày', 'B. Thời gian tích lũy dài hạn', 'C. Chọn các mã cổ phiếu giá rẻ', 'D. Số tiền vốn ban đầu cực lớn'],
        answerIndex: 1,
        explanation: 'Thời gian chính là yếu tố nhân cấp số mũ cho lãi kép. Bắt đầu càng sớm và duy trì càng lâu, tài sản sinh lời càng vượt bậc.'
      },
      {
        question: 'Công thức tính lãi kép cơ bản là gì? (Với P là vốn gốc, r là lãi suất năm, n là số lần ghép lãi/năm, t là số năm)',
        options: ['A. A = P * (1 + r * t)', 'B. A = P * (1 + r/n)^(n*t)', 'C. A = P / (1 + r)^t', 'D. A = P + r * t'],
        answerIndex: 1,
        explanation: 'Công thức tính giá trị tương lai với lãi kép là A = P * (1 + r/n)^(n*t).'
      },
      {
        question: 'Quy tắc 72 trong tài chính được dùng để làm gì?',
        options: ['A. Tính số tiền thuế phải nộp', 'B. Ước lượng số năm để số tiền đầu tư tăng gấp đôi với lãi suất cố định', 'C. Xác định tỷ lệ lạm phát hàng năm', 'D. Tính toán phí quản lý quỹ'],
        answerIndex: 1,
        explanation: 'Quy tắc 72 giúp ước lượng nhanh số năm để tài sản nhân đôi: Số năm = 72 / (Lãi suất hàng năm %).'
      },
      {
        question: 'If you receive interest from a savings account and spend it all immediately, what happens?',
        options: ['A. Bạn vẫn đang tận dụng lãi kép', 'B. Bạn chỉ nhận được lãi đơn ở chu kỳ tiếp theo', 'C. Tài khoản của bạn sẽ tự động bị khóa', 'D. Bạn sẽ phải trả thêm phí phạt rút lãi'],
        answerIndex: 1,
        explanation: 'Nếu tiêu hết tiền lãi, chu kỳ tiếp theo bạn chỉ nhận lãi trên phần vốn gốc ban đầu, tức là lãi đơn, không tận dụng được hiệu ứng lãi chồng lãi.'
      }
    ]
  },
  {
    id: 'C03',
    title: 'Phần 3: Đa dạng hóa danh mục',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Trung bình',
    difficulty: 'Trung bình',
    timeEstimated: '5 phút',
    description: 'Đa dạng hóa là chiến lược phân bổ tiền đầu tư vào nhiều loại tài sản khác nhau nhằm giảm rủi ro.',
    tags: ['Rủi ro', 'Đa dạng hóa'],
    lessons: [
      {
        id: 'L3.1',
        title: 'Đừng bỏ tất cả trứng vào một giỏ',
        videoUrl: 'https://www.youtube.com/embed/Qx3Gt8z6jCY',
        reading: 'Nội dung bài học:\nĐa dạng hóa là chiến lược phân bổ tiền đầu tư vào nhiều loại tài sản khác nhau nhằm giảm rủi ro.'
      }
    ],
    quizzes: [
      {
        question: 'Mục tiêu chính của đa dạng hóa là gì?',
        options: ['A. Tăng rủi ro', 'B. Giảm rủi ro đầu tư', 'C. Tránh đóng thuế', 'D. Đầu tư nhanh hơn'],
        answerIndex: 1,
        explanation: 'Đa dạng hóa giúp giảm thiểu thiệt hại lớn khi một trong các kênh đầu tư riêng lẻ bị biến động bất lợi.'
      },
      {
        question: 'Phương pháp nào thể hiện sự đa dạng hóa danh mục đầu tư đúng đắn?',
        options: ['A. Đầu tư toàn bộ tiền vào 1 mã cổ phiếu duy nhất', 'B. Phân bổ vốn vào nhiều lớp tài sản (tiết kiệm, trái phiếu, cổ phiếu, chứng chỉ quỹ) khác nhau', 'C. Mua 10 mã cổ phiếu khác nhau nhưng đều thuộc cùng một ngành bất động sản', 'D. Vay nợ tối đa để mua vàng'],
        answerIndex: 1,
        explanation: 'Đa dạng hóa đúng đắn yêu cầu phân bổ vốn vào các lớp tài sản hoặc các ngành nghề ít có sự tương quan đồng biến với nhau.'
      },
      {
        question: 'Câu thành ngữ kinh điển nào mô tả nguyên lý của đa dạng hóa danh mục?',
        options: ['A. Tích tiểu thành đại', 'B. Đừng bỏ tất cả trứng vào một giỏ', 'C. High risk, high return', 'D. Buôn có bạn, bán có phường'],
        answerIndex: 1,
        explanation: '"Đừng bỏ tất cả trứng vào một giỏ" khuyên nhà đầu tư phân tán rủi ro để nếu một giỏ bị rơi (một khoản đầu tư thua lỗ), các khoản khác vẫn an toàn.'
      },
      {
        question: 'Đa dạng hóa danh mục đầu tư giúp triệt tiêu loại rủi ro nào?',
        options: ['A. Rủi ro hệ thống (như khủng hoảng kinh tế toàn cầu)', 'B. Rủi ro phi hệ thống (rủi ro riêng lẻ của từng doanh nghiệp)', 'C. Mọi rủi ro thua lỗ trên thị trường', 'D. Rủi ro lạm phát tiền tệ'],
        answerIndex: 1,
        explanation: 'Đa dạng hóa giúp giảm thiểu tối đa rủi ro phi hệ thống (rủi ro từ sự cố riêng lẻ của một doanh nghiệp hoặc ngành cụ thể).'
      },
      {
        question: 'Điều nào sau đây KHÔNG phải là đa dạng hóa danh mục?',
        options: ['A. Sở hữu một chứng chỉ quỹ ETF VN30', 'B. Mua cả cổ phiếu, trái phiếu và gửi tiết kiệm', 'C. Gom toàn bộ tiền mua cổ phiếu của một công ty duy nhất đang tăng nóng', 'D. Đầu tư vào các doanh nghiệp thuộc nhiều ngành nghề khác nhau'],
        answerIndex: 2,
        explanation: 'Mua cổ phiếu của một công ty duy nhất là đầu tư tập trung rủi ro cao, hoàn toàn trái ngược với đa dạng hóa.'
      }
    ]
  },
  {
    id: 'C04',
    title: 'Phần 4: Tâm lý đầu tư',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    duration: '4 phút',
    level: 'Trung bình',
    difficulty: 'Trung bình',
    timeEstimated: '4 phút',
    description: 'Cảm xúc ảnh hưởng lớn đến quyết định đầu tư. Học cách kiểm soát cảm xúc, FOMO và hoảng loạn.',
    tags: ['Tâm lý', 'Trung bình'],
    lessons: [
      {
        id: 'L4.1',
        title: 'Kiểm soát cảm xúc khi đầu tư',
        videoUrl: 'https://www.youtube.com/embed/3QzJx3kK1oo',
        reading: 'Nội dung bài học:\nCảm xúc là một trong những yếu tố ảnh hưởng lớn đến quyết định đầu tư.'
      }
    ],
    quizzes: [
      {
        question: 'FOMO trong đầu tư là gì?',
        options: ['A. Một loại cổ phiếu', 'B. Sợ bỏ lỡ cơ hội đầu tư', 'C. Một quỹ ETF', 'D. Một loại thuế'],
        answerIndex: 1,
        explanation: 'FOMO (Fear of Missing Out) là tâm lý sợ bỏ lỡ cơ hội kiếm lợi nhuận khi thấy đám đông đang hào hứng.'
      },
      {
        question: 'Khi thấy thị trường giảm mạnh và đám đông hoảng loạn bán tháo, một nhà đầu tư kỷ luật nên làm gì?',
        options: ['A. Bán tháo theo đám đông bằng mọi giá', 'B. Bình tĩnh đánh giá lại giá trị cốt lõi của tài sản và tuân thủ kế hoạch dài hạn', 'C. Vay nóng để bắt đáy mà không cần phân tích', 'D. Xóa app và không bao giờ đầu tư nữa'],
        answerIndex: 1,
        explanation: 'Nhà đầu tư kỷ luật cần tránh tâm lý hoảng loạn bầy đàn, kiên định với kế hoạch phân bổ tài sản dài hạn đã lập.'
      },
      {
        question: 'Thiên kiến tâm lý "Loss Aversion" (Sợ thua lỗ) ảnh hưởng thế nào đến quyết định đầu tư?',
        options: ['A. Giúp nhà đầu tư cắt lỗ cực nhanh', 'B. Khiến nhà đầu tư gồng lỗ quá lâu và chốt lời non vì sợ mất lợi nhuận hiện có', 'C. Làm tăng lòng tham của nhà đầu tư', 'D. Giúp đưa ra quyết định lý trí hoàn hảo'],
        answerIndex: 1,
        explanation: 'Nghiên cứu cho thấy nỗi đau mất tiền lớn gấp đôi niềm vui kiếm tiền, dẫn đến xu hướng gồng lỗ vô kỷ luật để trốn tránh thực tế.'
      },
      {
        question: 'Hành vi mua tài sản liên tục dựa trên tin đồn không kiểm chứng từ các hội nhóm mạng xã hội được gọi là gì?',
        options: ['A. Đầu tư giá trị dài hạn', 'B. Tâm lý bầy đàn (Herd Mentality)', 'C. Phân tích cơ bản chuyên sâu', 'D. Phòng vệ rủi ro chủ động'],
        answerIndex: 1,
        explanation: 'Tâm lý bầy đàn khiến nhà đầu tư làm theo đám đông mà không tự nghiên cứu, phân tích, dễ rơi vào các bẫy xả hàng.'
      },
      {
        question: 'Cách tốt nhất để giảm thiểu tác động của cảm xúc (FOMO và Hoảng loạn) khi đầu tư là gì?',
        options: ['A. Giao dịch liên tục trong ngày theo biến động giá', 'B. Lập kế hoạch đầu tư rõ ràng, định kỳ mua tích lũy (DCA) và tuân thủ kỷ luật', 'C. Nghe theo mọi lời khuyên của người nổi tiếng trên mạng', 'D. Chỉ đầu tư khi thị trường đang tăng cực mạnh'],
        answerIndex: 1,
        explanation: 'Chiến lược tích lũy định kỳ (DCA) kết hợp kế hoạch dài hạn là công cụ hữu hiệu nhất giúp loại bỏ cảm xúc ngắn hạn ra khỏi quyết định đầu tư.'
      }
    ]
  },
  {
    id: 'C05',
    title: 'Phần 5: Lạm phát',
    category: 'Inflation',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    duration: '4 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '4 phút',
    description: 'Lạm phát là hiện tượng giá hàng hóa tăng dần, làm giảm sức mua của tiền mặt theo thời gian.',
    tags: ['Lạm phát', 'Cơ bản'],
    lessons: [
      {
        id: 'L5.1',
        title: 'Tiền mất giá theo thời gian',
        videoUrl: 'https://www.youtube.com/embed/DHdEAtes8H8',
        reading: 'Nội dung bài học:\nLạm phát là hiện tượng giá hàng hóa và dịch vụ tăng theo thời gian.'
      }
    ],
    quizzes: [
      {
        question: 'Lạm phát ảnh hưởng như thế nào đến tiền?',
        options: ['A. Tăng sức mua', 'B. Giảm sức mua theo thời gian', 'C. Không thay đổi gì', 'D. Tăng lương tự động'],
        answerIndex: 1,
        explanation: 'Lạm phát làm tăng mức giá chung của hàng hóa dịch vụ, khiến cùng một lượng tiền mua được ít đồ hơn.'
      },
      {
        question: 'Khi lạm phát tăng cao, lớp tài sản nào thường mất giá trị thực tế nhanh nhất nếu để yên?',
        options: ['A. Bất động sản', 'B. Tiền mặt không sinh lãi', 'C. Cổ phiếu của các doanh nghiệp đầu ngành', 'D. Vàng vật chất'],
        answerIndex: 1,
        explanation: 'Tiền mặt để yên sẽ mất sức mua trực tiếp khi giá cả hàng hóa leo thang do lạm phát.'
      },
      {
        question: '"Lạm phát kỳ vọng" có thể dẫn đến hành vi nào ở người tiêu dùng?',
        options: ['A. Tiết kiệm nhiều tiền mặt hơn', 'B. Trì hoãn việc mua sắm hàng hóa', 'C. Đẩy nhanh việc mua sắm hoặc đầu tư để tránh tiền mất giá', 'D. Ngừng hoàn toàn việc mua sắm'],
        answerIndex: 2,
        explanation: 'Kỳ vọng giá tăng trong tương lai thúc đẩy mọi người mua sắm tài sản hoặc hàng hóa sớm hơn để bảo vệ sức mua.'
      },
      {
        question: 'Lạm phát vừa phải (khoảng 2-3% mỗi năm) thường được các ngân hàng trung ương xem là:',
        options: ['A. Một thảm họa kinh tế cần triệt tiêu', 'B. Dấu hiệu của nền kinh tế đang tăng trưởng ổn định', 'C. Nguyên nhân gây khủng hoảng tài chính toàn cầu', 'D. Kết quả của việc in quá ít tiền'],
        answerIndex: 1,
        explanation: 'Lạm phát nhẹ, ổn định kích thích tiêu dùng và đầu tư, đồng thời phản ánh một nền kinh tế đang hoạt động tích cực.'
      },
      {
        question: 'Kênh nào sau đây thường được chọn để phòng vệ lạm phát trong dài hạn?',
        options: ['A. Giữ tiền mặt trong két sắt', 'B. Đầu tư vào tài sản thực (bất động sản, vàng) hoặc cổ phiếu/ETF tăng trưởng', 'C. Mở tài khoản thanh toán không kỳ hạn lãi suất 0%', 'D. Cho vay không lãi suất'],
        answerIndex: 1,
        explanation: 'Cổ phiếu, bất động sản và vàng là những tài sản có khả năng tăng giá trị tương ứng hoặc vượt trội hơn tốc độ lạm phát theo thời gian.'
      }
    ]
  },
  {
    id: 'C06',
    title: 'Phần 6 (VIP): Phân tích Báo cáo Tài chính chuyên sâu',
    category: 'Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    duration: '10 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '10 phút',
    description: 'Đọc hiểu báo cáo kết quả kinh doanh, bảng cân đối kế toán và phát hiện rủi ro doanh nghiệp.',
    tags: ['BCTC', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L6.1',
        title: 'Đọc hiểu 3 báo cáo tài chính cốt lõi',
        videoUrl: 'https://www.youtube.com/embed/NF0macnGe2Y',
        reading: 'Báo cáo tài chính là bức tranh toàn cảnh về sức khỏe của doanh nghiệp.'
      }
    ],
    quizzes: [
      {
        question: 'Báo cáo nào giúp nhận diện dòng tiền mặt thực tế của doanh nghiệp?',
        options: ['A. Bảng cân đối kế toán', 'B. Báo cáo lưu chuyển tiền tệ', 'C. Báo cáo kết quả hoạt động kinh doanh', 'D. Thuyết minh báo cáo tài chính'],
        answerIndex: 1,
        explanation: 'Báo cáo lưu chuyển tiền tệ là thước đo chính xác dòng tiền mặt thực tế ra vào doanh nghiệp.'
      },
      {
        question: 'Bảng cân đối kế toán thể hiện điều gì của doanh nghiệp?',
        options: ['A. Doanh thu và lợi nhuận của doanh nghiệp trong một kỳ kế toán', 'B. Bức tranh tài sản, nợ phải trả và vốn chủ sở hữu tại một thời điểm nhất định', 'C. Lịch sử giao dịch tiền mặt của các cổ đông lớn', 'D. Kế hoạch kinh doanh 5 năm tới của hội đồng quản trị'],
        answerIndex: 1,
        explanation: 'Bảng cân đối kế toán cung cấp thông tin về cấu trúc tài chính của doanh nghiệp gồm Tài sản = Nợ phải trả + Vốn chủ sở hữu tại thời điểm lập báo cáo.'
      },
      {
        question: 'Doanh nghiệp có lợi nhuận kế toán cao trên Báo cáo kết quả kinh doanh nhưng vẫn có thể bị phá sản vì lý do nào?',
        options: ['A. Đóng quá nhiều thuế thu nhập', 'B. Thiếu hụt dòng tiền mặt thực tế để thanh toán các khoản nợ đến hạn (khủng hoảng thanh khoản)', 'C. Giá cổ phiếu trên sàn giảm mạnh', 'D. Chia quá nhiều cổ tức cho cổ đông'],
        answerIndex: 1,
        explanation: 'Lợi nhuận kế toán được ghi nhận theo nguyên tắc dồn tích, không đồng nghĩa với tiền mặt thực tế. Nếu tiền mặt bị kẹt ở hàng tồn kho hoặc khoản phải thu, doanh nghiệp sẽ mất thanh khoản.'
      },
      {
        question: 'Chỉ số P/E (Price-to-Earnings Ratio) được dùng để làm gì?',
        options: ['A. Tính toán số lượng nhân sự của doanh nghiệp', 'B. Đo lường mối quan hệ giữa giá cổ phiếu và lợi nhuận trên mỗi cổ phần (EPS)', 'C. Xác định tỷ lệ nợ trên vốn chủ sở hữu', 'D. Dự báo thời gian khấu hao tài sản cố định'],
        answerIndex: 1,
        explanation: 'P/E cho biết nhà đầu tư sẵn sàng trả bao nhiêu tiền cho mỗi đồng lợi nhuận của doanh nghiệp.'
      },
      {
        question: 'Khoản mục "Phải thu khách hàng" quá lớn và liên tục tăng mạnh trên bảng cân đối kế toán cảnh báo rủi ro gì?',
        options: ['A. Doanh nghiệp đang bán được quá nhiều hàng thu tiền ngay', 'B. Doanh nghiệp ghi nhận doanh thu ảo hoặc gặp khó khăn trong việc thu hồi nợ từ đối tác', 'C. Vốn chủ sở hữu của doanh nghiệp đang tăng mạnh', 'D. Doanh nghiệp chuẩn bị tăng vốn điều lệ'],
        answerIndex: 1,
        explanation: 'Khoản phải thu tăng nhanh hơn doanh thu là dấu hiệu doanh nghiệp bán hàng cho nợ nhiều, nguy cơ nợ xấu cao và dòng tiền kinh doanh bị thâm hụt.'
      }
    ]
  },
  {
    id: 'C07',
    title: 'Phần 7 (VIP): Định giá Cổ phiếu DCF & P/E',
    category: 'Valuation',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    duration: '12 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '12 phút',
    description: 'Thực hành định giá giá trị nội tại doanh nghiệp theo mô hình chiết khấu dòng tiền DCF và so sánh P/E.',
    tags: ['Định giá', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L7.1',
        title: 'Phương pháp định giá dòng tiền chiết khấu (DCF)',
        videoUrl: 'https://www.youtube.com/embed/Ay4xpWYfSgg',
        reading: 'Định giá dòng tiền chiết khấu (Discounted Cash Flow) dựa trên nguyên tắc: một đồng tiền tương lai có giá trị thấp hơn hiện tại.'
      }
    ],
    quizzes: [
      {
        question: 'Nguyên lý cốt lõi của phương pháp DCF là gì?',
        options: ['A. Định giá dựa trên tài sản cố định', 'B. Chiết khấu dòng tiền tự do tương lai về giá trị hiện tại', 'C. So sánh giá cổ phiếu với đối thủ', 'D. Chỉ tính giá trị sổ sách'],
        answerIndex: 1,
        explanation: 'Phương pháp DCF tính giá trị nội tại của công ty bằng cách quy đổi toàn bộ lượng tiền tự do tương lai về hiện tại.'
      },
      {
        question: 'Trong định giá P/E so sánh, một cổ phiếu có P/E thấp hơn nhiều so với trung bình ngành luôn có nghĩa là gì?',
        options: ['A. Cổ phiếu đó chắc chắn đang rẻ và là cơ hội đầu tư tốt', 'B. Có thể cổ phiếu đang rẻ (dưới giá trị) hoặc doanh nghiệp đang gặp vấn đề nghiêm trọng khiến tăng trưởng sụt giảm', 'C. Cổ phiếu đó có rủi ro phá sản ngay lập tức', 'D. Doanh nghiệp đó không có nợ vay'],
        answerIndex: 1,
        explanation: 'P/E thấp có thể do định giá rẻ hoặc do thị trường đánh giá doanh nghiệp có triển vọng kém. Cần phân tích sâu để tránh "bẫy giá trị".'
      },
      {
        question: 'Yếu tố nào sau đây là đầu vào quan trọng nhất của mô hình chiết khấu dòng tiền DCF?',
        options: ['A. Giá cổ phiếu cao nhất trong lịch sử', 'B. Ước tính dòng tiền tự do (FCFF/FCFE) tương lai và tỷ lệ chiết khấu (WACC)', 'C. Khối lượng giao dịch bình quân 10 ngày', 'D. Số lượng thành viên trong hội đồng quản trị'],
        answerIndex: 1,
        explanation: 'DCF định giá doanh nghiệp bằng cách dự báo các dòng tiền tự do trong tương lai và chiết khấu chúng về hiện tại bằng một tỷ suất chiết khấu phù hợp.'
      },
      {
        question: 'Tỷ suất chiết khấu (Discount Rate) tăng lên sẽ ảnh hưởng thế nào đến giá trị nội tại ước tính theo DCF?',
        options: ['A. Làm tăng giá trị nội tại', 'B. Làm giảm giá trị nội tại', 'C. Không có ảnh hưởng gì', 'D. Làm tăng doanh thu doanh nghiệp'],
        answerIndex: 1,
        explanation: 'Vì tỷ suất chiết khấu nằm ở mẫu số của công thức quy đổi tiền về hiện tại, tỷ suất này tăng sẽ làm giảm giá trị quy đổi hiện tại.'
      },
      {
        question: '"Biên an toàn" (Margin of Safety) trong đầu tư giá trị là gì?',
        options: ['A. Khoản tiền gửi tiết kiệm dự phòng của nhà đầu tư', 'B. Chênh lệch chiết khấu giữa giá trị nội tại ước tính và giá thị trường hiện tại của cổ phiếu', 'C. Tỷ lệ ký quỹ (margin) tối đa công ty chứng khoán cho phép', 'D. Bảo hiểm tài khoản chứng khoán chống thua lỗ'],
        answerIndex: 1,
        explanation: 'Biên an toàn là khoảng đệm giúp bảo vệ nhà đầu tư khi giá mua thấp hơn đáng kể so với giá trị nội tại của doanh nghiệp, đề phòng sai số trong dự báo.'
      }
    ]
  },
  {
    id: 'C08',
    title: 'Phần 8 (VIP): Quản lý vốn & Phân bổ tài sản tích lũy',
    category: 'Wealth',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    duration: '8 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '8 phút',
    description: 'Xây dựng danh mục đầu tư bền vững, tái cân bằng định kỳ và kiểm soát dòng vốn tích lũy.',
    tags: ['Quản lý vốn', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L8.1',
        title: 'Tái cân bằng danh mục tài sản định kỳ',
        videoUrl: 'https://www.youtube.com/embed/DtVYnlov8PI',
        reading: 'Tái cân bằng (Rebalancing) là hành động đưa tỷ trọng các lớp tài sản về mức thiết lập ban đầu.'
      }
    ],
    quizzes: [
      {
        question: 'Tại sao cần tái cân bằng danh mục đầu tư?',
        options: ['A. Để mua nhiều cổ phiếu hơn', 'B. Để duy trì mức độ rủi ro mong muốn ban đầu', 'C. Để tránh mất phí', 'D. Để đầu cơ ngắn hạn'],
        answerIndex: 1,
        explanation: 'Tái cân bằng giúp kiểm soát rủi ro danh mục, ngăn ngừa việc một loại tài sản tăng quá nóng chiếm quá nhiều tỷ trọng.'
      },
      {
        question: 'Chiến lược phân bổ tài sản (Asset Allocation) nên phụ thuộc chủ yếu vào các yếu tố nào của cá nhân?',
        options: ['A. Độ tuổi, khẩu vị rủi ro và mục tiêu tài chính dài hạn', 'B. Số lượng bạn bè đang đầu tư cùng', 'C. Xu hướng tăng giảm của thị trường trong tuần tới', 'D. Khuyến nghị của các diễn đàn chứng khoán'],
        answerIndex: 0,
        explanation: 'Phân bổ tài sản là thiết lập tỷ trọng các lớp tài sản phù hợp với khả năng chấp nhận rủi ro, độ tuổi và kế hoạch dòng tiền của mỗi người.'
      },
      {
        question: 'Khi thực hiện tái cân bằng (Rebalancing) từ danh mục lệch tỷ trọng do cổ phiếu tăng quá mạnh, hành động đúng là:',
        options: ['A. Tiếp tục vay nợ mua thêm cổ phiếu đó để gia tăng lợi nhuận', 'B. Bán bớt một phần cổ phiếu đã tăng nóng để mua thêm các tài sản an toàn (như trái phiếu) nhằm đưa về tỷ trọng mục tiêu', 'C. Bán sạch toàn bộ danh mục và rút tiền về', 'D. Giữ nguyên không làm gì'],
        answerIndex: 1,
        explanation: 'Tái cân bằng yêu cầu bán bớt lớp tài sản tăng vượt tỷ trọng mục tiêu để mua lớp tài sản đang dưới tỷ trọng, giúp hiện thực hóa lợi nhuận và kiểm soát rủi ro.'
      },
      {
        question: 'Quy tắc "100 trừ đi độ tuổi" thường được gợi ý để xác định điều gì?',
        options: ['A. Số tiền tiết kiệm hàng tháng', 'B. Tỷ lệ phần trăm nên phân bổ vào tài sản rủi ro (như cổ phiếu) trong danh mục', 'C. Tuổi nghỉ hưu tối đa của bạn', 'D. Số lượng cổ phiếu tối đa bạn nên sở hữu'],
        answerIndex: 1,
        explanation: 'Ví dụ, nếu bạn 30 tuổi, tỷ lệ cổ phiếu gợi ý là 100 - 30 = 70%. Tuổi càng cao, tỷ lệ tài sản an toàn (trái phiếu/tiết kiệm) nên tăng lên.'
      },
      {
        question: 'Một danh mục đầu tư chỉ bao gồm 100% cổ phiếu công nghệ tăng trưởng cao phù hợp nhất với ai?',
        options: ['A. Người chuẩn bị nghỉ hưu cần dòng tiền ổn định an toàn', 'B. Nhà đầu tư trẻ tuổi, có thu nhập ổn định và khẩu vị rủi ro cao', 'C. Người đang có khoản nợ ngắn hạn lớn phải trả', 'D. Người có khẩu vị rủi ro phòng thủ'],
        answerIndex: 1,
        explanation: 'Danh mục 100% cổ phiếu biến động mạnh chỉ thích hợp với người trẻ có thời gian dài hạn để phục hồi sau các đợt sụt giảm thị trường và có dòng tiền độc lập.'
      }
    ]
  },
  {
    id: 'C09',
    title: 'Phần 9 (VIP): Đầu tư Phái sinh & Phòng ngừa rủi ro',
    category: 'Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    duration: '8 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '8 phút',
    description: 'Khái niệm hợp đồng tương lai và cơ chế bảo vệ danh mục đầu tư cơ sở.',
    tags: ['Phái sinh', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L9.1',
        title: 'Cơ chế hoạt động của Hợp đồng Tương lai',
        videoUrl: 'https://www.youtube.com/embed/KFUfOYaWKEw',
        reading: 'Hợp đồng tương lai (Futures Contract) cho phép giao dịch dựa trên kỳ vọng chỉ số VN30 tăng hoặc giảm.'
      }
    ],
    quizzes: [
      {
        question: 'Lợi thế của hợp đồng tương lai phái sinh là gì?',
        options: ['A. An toàn tuyệt đối', 'B. Giao dịch hai chiều (kiếm lời khi thị trường giảm)', 'C. Không yêu cầu ký quỹ', 'D. Phí giao dịch bằng 0'],
        answerIndex: 1,
        explanation: 'Phái sinh cho phép bạn thực hiện vị thế Short để kiếm lời khi dự đoán thị trường đi xuống.'
      },
      {
        question: '"Bán khống" (Short Selling / Short Position) trong giao dịch phái sinh là hành động giúp nhà đầu tư kiếm lợi nhuận khi nào?',
        options: ['A. Khi giá tài sản cơ sở tăng mạnh', 'B. Khi giá tài sản cơ sở giảm xuống', 'C. Khi thị trường đi ngang không biến động', 'D. Chỉ khi doanh nghiệp chia cổ tức'],
        answerIndex: 1,
        explanation: 'Vị thế Short cho phép người tham gia bán trước ở giá cao và mua lại để đóng vị thế ở giá thấp hơn, kiếm lời từ chênh lệch giảm giá.'
      },
      {
        question: 'Giao dịch ký quỹ (Margin) trong chứng khoán phái sinh mang lại hiệu ứng gì?',
        options: ['A. Loại bỏ hoàn toàn rủi ro thua lỗ', 'B. Đòn bẩy tài chính giúp nhân nhiều lần lợi nhuận kỳ vọng nhưng cũng nhân tương ứng mức độ rủi ro thua lỗ', 'C. Đảm bảo lợi nhuận cố định hàng tháng', 'D. Giảm phí giao dịch xuống mức 0'],
        answerIndex: 1,
        explanation: 'Ký quỹ cho phép giao dịch quy mô lớn với số vốn nhỏ. Đây là con dao hai lưỡi, có thể gây cháy tài khoản cực nhanh nếu thị trường đi ngược dự đoán.'
      },
      {
        question: 'Mục đích chính của việc sử dụng phái sinh để "phòng vệ rủi ro" (Hedging) của các tổ chức là gì?',
        options: ['A. Đầu cơ kiếm lợi nhuận chớp nhoáng', 'B. Bảo vệ danh mục cổ phiếu cơ sở trước các đợt giảm giá mạnh của thị trường chung', 'C. Thay thế hoàn toàn việc mua cổ phiếu doanh nghiệp', 'D. Tránh việc phải nộp thuế thu nhập'],
        answerIndex: 1,
        explanation: 'Hedging sử dụng các vị thế phái sinh đối ứng (như Short hợp đồng tương lai) để bù trừ thiệt hại giảm giá của danh mục cổ phiếu cơ sở đang nắm giữ.'
      },
      {
        question: 'Yêu cầu gọi ký quỹ bổ sung (Margin Call) xảy ra khi nào?',
        options: ['A. Khi số dư tài khoản ký quỹ của bạn tăng vượt mức trần', 'B. Khi thị trường biến động ngược hướng vị thế của bạn làm tỷ lệ tài sản ròng giảm dưới mức duy trì an toàn', 'C. Khi bạn muốn mở thêm tài khoản giao dịch mới', 'D. Khi doanh nghiệp phái sinh chia cổ tức'],
        answerIndex: 1,
        explanation: 'Margin Call yêu cầu bạn phải nộp thêm tiền hoặc bán bớt vị thế để đưa tài khoản về tỷ lệ an toàn khi khoản lỗ tạm tính vượt quá giới hạn cho phép.'
      }
    ]
  },
  {
    id: 'C10',
    title: 'Phần 10 (VIP): Tâm lý học hành vi trong đầu tư',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80',
    duration: '7 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '7 phút',
    description: 'Nhận diện các thiên kiến tâm lý như FOMO, Loss Aversion và xây dựng kỷ luật vốn thép.',
    tags: ['Tâm lý', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L10.1',
        title: 'Thiên kiến sợ thua lỗ (Loss Aversion)',
        videoUrl: 'https://www.youtube.com/embed/47RGK6sGL-Y',
        reading: 'Nghiên cứu tâm lý chỉ ra: Cảm giác đau đớn khi mất tiền lớn gấp đôi niềm vui khi kiếm được tiền tương đương.'
      }
    ],
    quizzes: [
      {
        question: 'Thiên kiến sợ thua lỗ thường dẫn đến hành vi sai lầm nào?',
        options: ['A. Cắt lỗ quá nhanh', 'B. Gồng lỗ quá lâu và chốt lời quá sớm', 'C. Chỉ mua trái phiếu', 'D. Đa dạng hóa quá mức'],
        answerIndex: 1,
        explanation: 'Sợ thua lỗ khiến nhà đầu tư gồng lỗ vô kỷ luật để tránh nhận mình sai, đồng thời bán chốt lời non vì sợ mất lợi nhuận hiện có.'
      },
      {
        question: 'Thiên kiến tự tin thái quá (Overconfidence Bias) thường khiến nhà đầu tư làm gì?',
        options: ['A. Đa dạng hóa danh mục quá mức', 'B. Giao dịch quá nhiều và đánh giá thấp rủi ro thực tế của thị trường', 'C. Trì hoãn việc ra quyết định đầu tư', 'D. Chỉ gửi tiền tiết kiệm ngân hàng'],
        answerIndex: 1,
        explanation: 'Tự tin thái quá khiến mọi người tin rằng họ có thể dự báo thị trường chính xác hơn thực tế, dẫn đến giao dịch liên tục làm tốn phí và thua lỗ.'
      },
      {
        question: 'Thiên kiến xác nhận (Confirmation Bias) là gì?',
        options: ['A. Việc xác minh thông tin tài khoản ngân hàng bảo mật', 'B. Xu hướng chỉ tìm kiếm, tin tưởng các thông tin ủng hộ quan điểm cá nhân và phớt lờ các ý kiến phản biện trái chiều', 'C. Việc nhận được email xác nhận giao dịch thành công', 'D. Việc tuân thủ tuyệt đối quy trình phân bổ tài sản'],
        answerIndex: 1,
        explanation: 'Thiên kiến xác nhận khiến nhà đầu tư chỉ đọc tin tốt về cổ phiếu họ đang nắm giữ và bỏ qua các dấu hiệu cảnh báo doanh nghiệp đang đi xuống.'
      },
      {
        question: 'Hiện tượng nhà đầu tư neo giữ quyết định mua/bán vào mức giá vốn ban đầu mà họ đã mua, bất kể tình hình doanh nghiệp thay đổi thế nào được gọi là:',
        options: ['A. Thiên kiến neo quyết định (Anchoring Bias)', 'B. Thiên kiến sẵn có (Availability Bias)', 'C. Tư duy trực quan Socratic', 'D. Quản lý danh mục chủ động'],
        answerIndex: 0,
        explanation: 'Neo giá khiến nhà đầu tư không chịu bán cắt lỗ hoặc chốt lời hợp lý vì cứ so sánh với giá vốn lịch sử (điểm neo) của chính mình.'
      },
      {
        question: 'Để khắc phục các thiên kiến hành vi cá nhân, hành động thiết thực nhất là gì?',
        options: ['A. Tin tưởng hoàn toàn vào trực giác của bản thân khi giao dịch', 'B. Thiết lập quy tắc đầu tư tự động hóa, ghi chép nhật ký giao dịch và tuân thủ kỷ luật danh mục', 'C. Theo dõi bảng điện tử liên tục từng giây', 'D. Đổi công ty chứng khoán thường xuyên'],
        answerIndex: 1,
        explanation: 'Kỷ luật, tự động hóa và ghi chép nhật ký giúp bạn nhìn nhận khách quan, tránh các phản ứng cảm xúc tức thời do thiên kiến gây ra.'
      }
    ]
  },
  {
    id: 'C11',
    title: 'Phần 11 (VIP): Chiến lược Quỹ mở và Quỹ chỉ số ETF',
    category: 'ETF',
    thumbnail: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=400&q=80',
    duration: '9 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '9 phút',
    description: 'So sánh hiệu quả của việc mua tích lũy định kỳ (DCA) các rổ quỹ mở và chỉ số ETF Diamond/VN30.',
    tags: ['Quỹ mở', 'ETF', 'VIP'],
    lessons: [
      {
        id: 'L11.1',
        title: 'Phương pháp tích lũy DCA Quỹ chỉ số',
        videoUrl: 'https://www.youtube.com/embed/5Wp7ba-EWeA',
        reading: 'Chiến thuật trung bình hóa chi phí (DCA) bằng cách mua định kỳ hàng tuần hoặc hàng tháng một số tiền cố định.'
      }
    ],
    quizzes: [
      {
        question: 'Chiến lược DCA hiệu quả nhất khi kết hợp với loại tài sản nào?',
        options: ['A. Cổ phiếu đầu cơ', 'B. Quỹ chỉ số ETF đa dạng hóa cao', 'C. Tiết kiệm ngắn hạn', 'D. Tiền mặt không sinh lãi'],
        answerIndex: 1,
        explanation: 'DCA phát huy hiệu quả tốt nhất khi kết hợp với các tài sản có xu hướng tăng trưởng dài hạn.'
      },
      {
        question: 'Lợi thế lớn nhất của chiến lược Trung bình giá (DCA) là gì?',
        options: ['A. Đảm bảo mua được cổ phiếu tại mức giá thấp nhất lịch sử', 'B. Loại bỏ áp lực canh thời điểm thị trường (market timing) và giảm chi phí mua bình quân dài hạn nhờ tích lũy kỷ luật', 'C. Giúp giàu nhanh chỉ trong vài tuần', 'D. Miễn phí hoàn toàn các loại thuế giao dịch'],
        answerIndex: 1,
        explanation: 'DCA giúp bạn mua nhiều chứng chỉ quỹ hơn khi giá thấp và mua ít hơn khi giá cao, giúp tối ưu hóa giá vốn dài hạn một cách tự động.'
      },
      {
        question: 'Điểm khác biệt cốt lõi giữa Quỹ mở chủ động (Mutual Fund) và Quỹ chỉ số ETF bị động là gì?',
        options: ['A. Quỹ mở không có phí quản lý', 'B. Quỹ mở chủ động được các chuyên gia chọn lọc cổ phiếu để cố gắng chiến thắng thị trường, còn ETF mô phỏng nguyên vẹn một rổ chỉ số cố định', 'C. ETF chỉ đầu tư vào vàng', 'D. Quỹ mở có rủi ro cao hơn phái sinh'],
        answerIndex: 1,
        explanation: 'Quỹ chủ động dựa vào năng lực chọn lọc của nhà quản lý quỹ và thường có phí cao hơn. Quỹ ETF chạy theo chỉ số một cách tự động với phí quản lý cực thấp.'
      },
      {
        question: 'Chỉ số rổ VN DIAMOND (mô phỏng bởi ETF FUEVFVND) tập trung chủ yếu vào nhóm cổ phiếu nào?',
        options: ['A. Các doanh nghiệp nhà nước sắp cổ phần hóa', 'B. Các cổ phiếu hàng đầu có tỷ lệ sở hữu của khối ngoại đạt trần (hết room ngoại) và nền tảng cơ bản cực tốt', 'C. Các công ty khởi nghiệp công nghệ mới', 'D. Các doanh nghiệp ngành khai khoáng và dầu khí'],
        answerIndex: 1,
        explanation: 'Rổ chỉ số VN Diamond thu hút dòng vốn lớn nhờ tập trung các cổ phiếu đầu ngành chất lượng cao mà nhà đầu tư nước ngoài không thể mua trực tiếp do hết giới hạn sở hữu.'
      },
      {
        question: 'Khi bạn tích lũy dài hạn quỹ chỉ số ETF trong 10 năm, yếu tố nào ảnh hưởng lớn nhất đến lợi nhuận ròng cuối cùng của bạn?',
        options: ['A. Tỷ suất phí quản lý hàng năm của quỹ và tính kỷ luật duy trì DCA đều đặn', 'B. Việc dự đoán chính xác các điểm đảo chiều của thị trường mỗi tháng', 'C. Tin tức chính trị hàng ngày trên mạng xã hội', 'D. Màu sắc của logo công ty quản lý quỹ'],
        answerIndex: 0,
        explanation: 'Trong dài hạn, chi phí quản lý thấp (đặc trưng của ETF) cộng với sức mạnh tích lũy đều đặn không gián đoạn là chìa khóa tạo nên lợi nhuận ròng tối ưu.'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('Seeding and updating initial courses (C01 - C11)...');
    for (const c of INITIAL_COURSES) {
      await Course.upsert({
        id: c.id,
        title: c.title,
        category: c.category,
        thumbnail: c.thumbnail,
        duration: c.duration,
        level: c.level,
        difficulty: c.difficulty,
        timeEstimated: c.timeEstimated,
        tags: JSON.stringify(c.tags),
        description: c.description,
        lessons: JSON.stringify(c.lessons),
        quizzes: JSON.stringify(c.quizzes)
      });
    }
    console.log('Courses seeded and updated successfully!');

    // Only seed system accounts (admin + staff). No mock users.
    const adminExists = await User.findOne({ where: { email: 'admin1@gmail.com' } });
    if (!adminExists) {
      console.log('Seeding system accounts (admin + staff)...');
      
      const adminPass = await bcrypt.hash('admin123', 10);
      const staffPass = await bcrypt.hash('staff123', 10);

      await User.bulkCreate([
        { id: 'A001', name: 'Admin Quản Trị', email: 'admin1@gmail.com', password: adminPass, role: 'admin', subscription: 'Mentor+', status: 'Active', balance: 0, xp: 0, streak: 0 },
        { id: 'S001', name: 'Nhân viên Duyệt', email: 'staff1@gmail.com', password: staffPass, role: 'staff', subscription: 'Mentor+', status: 'Active', balance: 0, xp: 0, streak: 0 }
      ]);

      console.log('System accounts seeded successfully!');
    }

    // Seed initial mock users if they don't exist
    const userCount = await User.count({ where: { role: 'user' } });
    if (userCount === 0) {
      console.log('Seeding initial mock users...');
      const userPass = await bcrypt.hash('user123', 10);
      const now = new Date();
      
      // Let's create users spread across last 6 months
      const mockUsers = [
        {
          id: 'U001',
          name: 'Trần Minh Quân',
          email: 'quan.tran@gmail.com',
          password: userPass,
          role: 'user',
          subscription: 'Premium',
          status: 'Active',
          riskProfile: 'Aggressive',
          balance: 150000000,
          xp: 450,
          streak: 5,
          createdAt: new Date(now.getFullYear(), now.getMonth() - 5, 12, 10, 30)
        },
        {
          id: 'U002',
          name: 'Lê Thị Mai',
          email: 'mai.le@yahoo.com',
          password: userPass,
          role: 'user',
          subscription: 'Free',
          status: 'Active',
          riskProfile: 'Balanced',
          balance: 80000000,
          xp: 180,
          streak: 1,
          createdAt: new Date(now.getFullYear(), now.getMonth() - 4, 18, 14, 20)
        },
        {
          id: 'U003',
          name: 'Phạm Đức Nam',
          email: 'nam.pd@hotmail.com',
          password: userPass,
          role: 'user',
          subscription: 'Mentor+',
          status: 'Active',
          riskProfile: 'Conservative',
          balance: 320000000,
          xp: 850,
          streak: 12,
          createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 5, 9, 15)
        },
        {
          id: 'U004',
          name: 'Nguyễn Bích Vy',
          email: 'vy.nguyen@gmail.com',
          password: userPass,
          role: 'user',
          subscription: 'Free',
          status: 'Blocked',
          riskProfile: null,
          balance: 5000000,
          xp: 20,
          streak: 0,
          createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 22, 16, 45)
        },
        {
          id: 'U005',
          name: 'Hoàng Anh Tuấn',
          email: 'tuan.ha@tcbs.vn',
          password: userPass,
          role: 'user',
          subscription: 'Premium',
          status: 'Active',
          riskProfile: 'Balanced',
          balance: 120000000,
          xp: 320,
          streak: 3,
          createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10, 11, 0)
        }
      ];

      await User.bulkCreate(mockUsers);
      console.log('Mock users seeded successfully!');

      // Seed mock progresses for these users
      await CourseProgress.bulkCreate([
        { userId: 'U001', courseId: 'C01', lessonsRead: JSON.stringify(['L1.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U001', courseId: 'C02', lessonsRead: JSON.stringify(['L2.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U001', courseId: 'C03', lessonsRead: JSON.stringify(['L3.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U001', courseId: 'C04', lessonsRead: JSON.stringify(['L4.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U001', courseId: 'C05', lessonsRead: JSON.stringify(['L5.1']), quizCompleted: true, progressPercent: 100 },
        
        { userId: 'U002', courseId: 'C01', lessonsRead: JSON.stringify(['L1.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U002', courseId: 'C02', lessonsRead: JSON.stringify(['L2.1']), quizCompleted: true, progressPercent: 100 },
        
        { userId: 'U003', courseId: 'C01', lessonsRead: JSON.stringify(['L1.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U003', courseId: 'C02', lessonsRead: JSON.stringify(['L2.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U003', courseId: 'C03', lessonsRead: JSON.stringify(['L3.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U003', courseId: 'C04', lessonsRead: JSON.stringify(['L4.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U003', courseId: 'C05', lessonsRead: JSON.stringify(['L5.1']), quizCompleted: true, progressPercent: 100 },
        
        { userId: 'U004', courseId: 'C01', lessonsRead: JSON.stringify(['L1.1']), quizCompleted: false, progressPercent: 50 },
        
        { userId: 'U005', courseId: 'C01', lessonsRead: JSON.stringify(['L1.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U005', courseId: 'C02', lessonsRead: JSON.stringify(['L2.1']), quizCompleted: true, progressPercent: 100 },
        { userId: 'U005', courseId: 'C03', lessonsRead: JSON.stringify(['L3.1']), quizCompleted: true, progressPercent: 100 }
      ]);
      console.log('Mock course progresses seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};


// Sync database and start listening
sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synchronized.');
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to synchronize database:', err);
});
// Nodemon trigger change comment 1.0.0
