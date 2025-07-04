
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
  roles: ('principal' | 'teacher' | 'parent')[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['principal', 'teacher', 'parent']
  },
  {
    label: 'Classes',
    path: '/students',
    icon: Users,
    roles: ['principal', 'teacher']
  },
  {
    label: 'Attendance',
    path: '/attendance',
    icon: UserCheck,
    roles: ['principal', 'teacher', 'parent']
  },
  {
    label: 'Learning Logs',
    path: '/learning-logs',
    icon: BookOpen,
    roles: ['principal', 'teacher', 'parent']
  },
  {
    label: 'Homework',
    path: '/homework',
    icon: FileText,
    roles: ['principal', 'teacher', 'parent']
  },
  {
    label: 'Timetable',
    path: '/timetable',
    icon: Calendar,
    roles: ['principal', 'teacher', 'parent']
  },
  {
    label: 'Events',
    path: '/events',
    icon: CalendarDays,
    roles: ['principal', 'teacher', 'parent']
  },
  {
    label: 'Announcements',
    path: '/announcements',
    icon: Megaphone,
    roles: ['principal', 'teacher']
  },
  {
    label: 'Fee Management',
    path: '/fees',
    icon: CreditCard,
    roles: ['principal', 'parent']
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['principal', 'teacher']
  },
  {
    label: 'User Management',
    path: '/user-management',
    icon: UserCog,
    roles: ['principal']
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['principal']
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
      <SidebarHeader className="p-4 bg-gradient-to-r from-indigo-600 to-blue-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-indigo-600 font-bold text-lg">SS</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">
              Sree Sai School
            </h2>
            <p className="text-sm text-indigo-100 truncate">
              Management System
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
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
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
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
