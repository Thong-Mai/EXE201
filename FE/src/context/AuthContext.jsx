import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Mock initial admin users list for dashboard data
const INITIAL_ADMIN_USERS = [
  { id: 'U001', name: 'Trần Minh Quân', email: 'quan.tran@gmail.com', role: 'user', learningProgress: 85, riskProfile: 'Aggressive', subscription: 'Premium', status: 'Active' },
  { id: 'U002', name: 'Lê Thị Mai', email: 'mai.le@yahoo.com', role: 'user', learningProgress: 45, riskProfile: 'Balanced', subscription: 'Free', status: 'Active' },
  { id: 'U003', name: 'Phạm Đức Nam', email: 'nam.pd@hotmail.com', role: 'user', learningProgress: 95, riskProfile: 'Conservative', subscription: 'Mentor+', status: 'Active' },
  { id: 'U004', name: 'Nguyễn Bích Vy', email: 'vy.nguyen@gmail.com', role: 'user', learningProgress: 10, riskProfile: null, subscription: 'Free', status: 'Blocked' },
  { id: 'U005', name: 'Hoàng Anh Tuấn', email: 'tuan.ha@tcbs.vn', role: 'user', learningProgress: 60, riskProfile: 'Balanced', subscription: 'Premium', status: 'Active' }
];

const BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('saveplus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('saveplus_users_list');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
  });

  const [riskProfile, setRiskProfile] = useState(() => {
    return localStorage.getItem('saveplus_risk_profile') || null;
  });

  const [onboardingAnswers, setOnboardingAnswers] = useState(() => {
    const saved = localStorage.getItem('saveplus_onboarding_answers');
    return saved ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('saveplus_balance');
    return saved ? parseFloat(saved) : 100000000;
  });

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('saveplus_portfolio');
    return saved ? JSON.parse(saved) : [];
  });

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('saveplus_watchlist');
    return saved ? JSON.parse(saved) : ['FPT', 'VCB', 'TSLA', 'AAPL'];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('saveplus_goals');
    return saved ? JSON.parse(saved) : [
      { id: 'G01', name: 'Quỹ Dự Phòng Khẩn Cấp (Emergency)', target: 20000000, current: 8000000, category: 'Emergency fund', monthlyContribution: 1000000 },
      { id: 'G02', name: 'Mua Xe Máy Mới (Motorbike)', target: 45000000, current: 15000000, category: 'Buy motorbike', monthlyContribution: 2000000 }
    ];
  });

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('saveplus_xp');
    return saved ? parseInt(saved) : 150;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('saveplus_streak');
    return saved ? parseInt(saved) : 3;
  });

  const [notifications, setNotifications] = useState([
    { id: 'N1', title: 'Bài học mới cho bạn!', message: 'Khóa học "Đầu tư quỹ ETF tối ưu" được gợi ý dựa trên hồ sơ rủi ro của bạn.', read: false, time: '10 phút trước' },
    { id: 'N2', title: 'Thử thách hàng ngày', message: 'Duy trì chuỗi học tập 3 ngày của bạn! Nhấn học ngay hôm nay.', read: false, time: '2 giờ trước' },
    { id: 'N3', title: 'Cảnh báo thị trường từ AI', message: 'VNINDEX có xu hướng dao động nhẹ. Hãy giữ tâm lý đầu tư dài hạn.', read: true, time: '1 ngày trước' }
  ]);

  const [paymentRequests, setPaymentRequests] = useState([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('saveplus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('saveplus_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('saveplus_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('saveplus_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('saveplus_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('saveplus_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('saveplus_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('saveplus_streak', streak.toString());
  }, [streak]);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('saveplus_token');
    if (token) {
      fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem('saveplus_token');
          setUser(null);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setUser(data.user);
          setBalance(data.user.balance);
          setXp(data.user.xp);
          setStreak(data.user.streak);
          setRiskProfile(data.user.riskProfile || null);
          setOnboardingAnswers(data.user.onboardingAnswers || null);
          
          if (data.user.role === 'admin' || data.user.role === 'staff') {
            fetch(`${BASE_URL}/admin/users`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(usersList => {
              if (Array.isArray(usersList)) {
                setUsers(usersList);
              }
            })
            .catch(console.error);

            fetch(`${BASE_URL}/payments/requests`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(payList => {
              if (Array.isArray(payList)) {
                setPaymentRequests(payList);
              }
            })
            .catch(console.error);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching user profile:", err);
      });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại.');
      }
      
      localStorage.setItem('saveplus_token', data.token);
      setUser(data.user);
      setBalance(data.user.balance);
      setXp(data.user.xp);
      setStreak(data.user.streak);
      setRiskProfile(data.user.riskProfile || null);

      if (data.user.role === 'admin' || data.user.role === 'staff') {
        const usersRes = await fetch(`${BASE_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const usersList = await usersRes.json();
        if (usersRes.ok) {
          setUsers(usersList);
        }

        const payRes = await fetch(`${BASE_URL}/payments/requests`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const payList = await payRes.json();
        if (payRes.ok) {
          setPaymentRequests(payList);
        }
      }
      
      return data.user.role;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('saveplus_token');
    setUser(null);
  };

  const register = async (name, email, password, idNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, idNumber })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại.');
      }
      
      localStorage.setItem('saveplus_token', data.token);
      setUser(data.user);
      setBalance(data.user.balance);
      setXp(data.user.xp);
      setStreak(data.user.streak);
      setRiskProfile(data.user.riskProfile || null);
      
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const saveOnboarding = async (answers) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/users/onboarding`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (res.ok) {
        setRiskProfile(data.riskProfile);
        setOnboardingAnswers(data.onboardingAnswers);
        localStorage.setItem('saveplus_risk_profile', data.riskProfile);
        localStorage.setItem('saveplus_onboarding_answers', JSON.stringify(data.onboardingAnswers));
        if (user) {
          setUser(prev => ({ ...prev, riskProfile: data.riskProfile, onboardingAnswers: data.onboardingAnswers }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateBalance = async (amount) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/financials/balance`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  const addGoal = (goal) => {
    const newGoal = {
      id: 'G' + Math.floor(Math.random() * 1000),
      ...goal,
      current: 0
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const contributeToGoal = (id, amount) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextVal = Math.min(g.target, g.current + parseFloat(amount));
        return { ...g, current: nextVal };
      }
      return g;
    }));
    setBalance(prev => prev - parseFloat(amount));
  };

  const addXP = async (amount) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/users/xp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        setXp(data.xp);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerStreak = async () => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/users/streak`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStreak(data.streak);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const blockUser = async (id) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${id}/block`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: data.status } : u));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi khóa người dùng.');
    }
  };

  const deleteUser = async (id) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi xóa người dùng.');
      return false;
    }
  };

  const verifyUser = async (id) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${id}/verify`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription: data.subscription } : u));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi nâng cấp người dùng.');
    }
  };

  const approveKYC = async (id, isApproved) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${id}/kyc`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: data.status } : u));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi phê duyệt KYC.');
    }
  };

  const updateUserDetails = async (id, details) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(details)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setUsers(prev => prev.map(u => u.id === id ? { 
        ...u, 
        name: data.name, 
        subscription: data.subscription, 
        riskProfile: data.riskProfile 
      } : u));
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi cập nhật thông tin.');
      return false;
    }
  };

  const getPaymentRequests = async () => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/payments/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentRequests(data);
      }
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const submitPaymentRequest = async (targetTier, paymentCode, amount, email) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/payments/requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetTier, paymentCode, amount, email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Update global user state with the upgraded user object
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('saveplus_user', JSON.stringify(data.user));
      }

      // Update payment requests locally if we are admin/staff or loading them later
      if (user && (user.role === 'admin' || user.role === 'staff')) {
        setPaymentRequests(prev => [data.request, ...prev]);
      }
      return data.request;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const approvePaymentRequest = async (id) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/payments/requests/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Update requests list status
      setPaymentRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Approved', resolvedAt: new Date() } : req));
      
      // Update user list subscription status
      setUsers(prev => prev.map(u => u.id === data.userId || u.email === data.userEmail ? { ...u, subscription: data.targetTier } : u));
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi duyệt nâng cấp gói.');
      return false;
    }
  };

  const rejectPaymentRequest = async (id, reason) => {
    const token = localStorage.getItem('saveplus_token');
    try {
      const res = await fetch(`${BASE_URL}/payments/requests/${id}/reject`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setPaymentRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Rejected', note: reason, resolvedAt: new Date() } : req));
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi từ chối nâng cấp gói.');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      register,
      riskProfile,
      onboardingAnswers,
      saveOnboarding,
      balance,
      updateBalance,
      portfolio,
      setPortfolio,
      watchlist,
      toggleWatchlist,
      goals,
      addGoal,
      contributeToGoal,
      xp,
      addXP,
      streak,
      triggerStreak,
      notifications,
      markNotificationRead,
      blockUser,
      deleteUser,
      verifyUser,
      approveKYC,
      updateUserDetails,
      paymentRequests,
      getPaymentRequests,
      submitPaymentRequest,
      approvePaymentRequest,
      rejectPaymentRequest
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
