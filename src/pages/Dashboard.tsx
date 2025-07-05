
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { TeacherDashboard } from '../components/dashboards/TeacherDashboard';
import { ParentDashboard } from '../components/dashboards/ParentDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    default:
      return <div>Invalid role</div>;
  }
};
