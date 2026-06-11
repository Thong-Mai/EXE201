import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import OTPVerification from './pages/auth/OTPVerification';
import ProfileSetup from './pages/auth/ProfileSetup';

// User Pages
import Dashboard from './pages/dashboard/Dashboard';
import MyLearning from './pages/learning/MyLearning';
import InvestmentSimulation from './pages/simulation/InvestmentSimulation';
import GoalsSavings from './pages/goals/GoalsSavings';
import AIMentor from './pages/aimentor/AIMentor';
import Community from './pages/community/Community';
import Profile from './pages/profile/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import StaffApprovals from './pages/admin/StaffApprovals';

export default function App() {
  return (
    <Routes>
      {/* Auth / Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verify" element={<OTPVerification />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />

      {/* Main Layout wrapper for Protected Routes */}
      <Route path="/" element={<Layout />}>
        {/* Learner Routes */}
        <Route index element={<Dashboard />} />
        <Route path="learning" element={<MyLearning />} />
        <Route path="simulation" element={<InvestmentSimulation />} />
        <Route path="goals" element={<GoalsSavings />} />
        <Route path="mentor" element={<AIMentor />} />
        <Route path="community" element={<Community />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/courses" element={<CourseManagement />} />
        <Route path="admin/analytics" element={<AdminDashboard />} />
        <Route path="admin/subscriptions" element={<AdminDashboard />} />
        <Route path="admin/approvals" element={<StaffApprovals />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

