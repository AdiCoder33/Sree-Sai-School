
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: ('admin' | 'teacher' | 'parent')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback 
}) => {
  const { user } = useAuth();

if (!user || !allowedRoles.includes(user.role as 'admin' | 'teacher' | 'parent')) {
  return fallback ? <>{fallback}</> : null;
}

  return <>{children}</>;
};
