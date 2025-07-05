
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  CreditCard,
  BarChart3,
  Settings,
  FileText,
  UserCog,
  Calendar,
  CalendarDays,
  Megaphone
} from 'lucide-react';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from './ui/sidebar';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: ('admin' | 'teacher' | 'parent')[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'teacher', 'parent']
  },
  {
    label: 'Classes',
    path: '/students',
    icon: Users,
    roles: ['admin', 'teacher']
  },
  {
    label: 'Attendance',
    path: '/attendance',
    icon: UserCheck,
    roles: ['admin', 'teacher', 'parent']
  },
  {
    label: 'Learning Logs',
    path: '/learning-logs',
    icon: BookOpen,
    roles: ['admin', 'teacher', 'parent']
  },
  {
    label: 'Homework',
    path: '/homework',
    icon: FileText,
    roles: ['admin', 'teacher', 'parent']
  },
  {
    label: 'Timetable',
    path: '/timetable',
    icon: Calendar,
    roles: ['admin', 'teacher', 'parent']
  },
  {
    label: 'Events',
    path: '/events',
    icon: CalendarDays,
    roles: ['admin', 'teacher', 'parent']
  },
  {
    label: 'Announcements',
    path: '/announcements',
    icon: Megaphone,
    roles: ['admin', 'teacher']
  },
  {
    label: 'Fee Management',
    path: '/fees',
    icon: CreditCard,
    roles: ['admin', 'parent']
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['admin', 'teacher']
  },
  {
    label: 'User Management',
    path: '/user-management',
    icon: UserCog,
    roles: ['admin']
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['admin']
  }
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const allowedItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <SidebarComponent>
      
      <SidebarContent className="bg-white">
  {/* Logo moved inside SidebarContent */}
  <div className="p-4 pb-2 flex items-center space-x-3">
    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow">
      SS
    </div>
    <div className="min-w-0">
      <h2 className="text-lg font-bold text-gray-900 leading-tight">Sree Sai School</h2>
      <p className="text-xs text-gray-500 leading-none">Management System</p>
    </div>
  </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-black font-semibold px-4 py-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl transition-colors duration-200 w-auto text-black ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg'
                              : 'hover:bg-gray-100'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5 flex-shrink-0 text-black !opacity-100 !visible" />
                        <span className="font-medium text-sm text-black block">{item.label}</span>

                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};
