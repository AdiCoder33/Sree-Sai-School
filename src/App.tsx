
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Attendance } from './pages/Attendance';
import { LearningLogs } from './pages/LearningLogs';
import { Homework } from './pages/Homework';
import { Timetable } from './pages/Timetable';
import { Events } from './pages/Events';
import { Announcements } from './pages/Announcements';
import { Fees } from './pages/Fees';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/learning-logs" element={<LearningLogs />} />
              <Route path="/homework" element={<Homework />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/events" element={<Events />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
