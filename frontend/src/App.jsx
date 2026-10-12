import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DailyStreakPage from './pages/DailyStreak/DailyStreakPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/daily-streak"
            element={
              <ProtectedRoute>
                <DailyStreakPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/daily-streak" replace />} />
          <Route path="*" element={<Navigate to="/daily-streak" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
