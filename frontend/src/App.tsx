import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login, Register, Main, MyPage, EmailVerificationSuccess, EmailVerificationError } from './pages';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSchedules } from './pages/admin/AdminSchedules';
import { AdminLogs } from './pages/admin/AdminLogs';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
        <Route path="/mypage" element={<MyPage />} />
        
        {/* Email Verification Routes */}
        <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
        <Route path="/email-verification-error" element={<EmailVerificationError />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/schedules" element={<AdminSchedules />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;