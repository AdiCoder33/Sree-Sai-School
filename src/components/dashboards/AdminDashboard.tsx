import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import CircularProgress from '../ui/circular-progress';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  TrendingUp,
  Megaphone,
} from 'lucide-react';

interface Fee {
  amount?: number;
  paidDate?: string;
  paymentDate?: string;
  datePaid?: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [totalStudents, setTotalStudents] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [routeStatuses, setRouteStatuses] = useState<Record<string, string>>({});
  const [dbSizeMB, setDbSizeMB] = useState<number | null>(null);
  const [statusError, setStatusError] = useState('');

  const mockTrafficData = [
    { name: 'Mon', users: 40 },
    { name: 'Tue', users: 70 },
    { name: 'Wed', users: 50 },
    { name: 'Thu', users: 90 },
    { name: 'Fri', users: 65 },
    { name: 'Sat', users: 30 },
    { name: 'Sun', users: 20 },
  ];

  useEffect(() => {
    const token = localStorage.getItem('smartschool_token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [classesRes, usersRes, feesRes] = await Promise.all([
          fetch(`${API_BASE}/classes`, { headers }),
          fetch(`${API_BASE}/users`, { headers }),
          fetch(`${API_BASE}/fees`, { headers })
        ]);

        let filteredClasses: any[] = [];

        if (classesRes.ok) {
          const classes = await classesRes.json();
          filteredClasses = classes.filter((cls: any) => {
            const match = cls.name?.match(/(\d+)/);
            const number = match ? parseInt(match[1], 10) : NaN;
            return number >= 1 && number <= 10;
          });

          const studentTotal = filteredClasses.reduce(
            (sum: number, cls: any) => sum + (cls.studentCount || 0),
            0
          );
          setTotalStudents(studentTotal);
        }

        if (usersRes.ok) {
          const users = await usersRes.json();
          const teachers = users.filter((u: any) => u.role === 'teacher');
          setTeacherCount(teachers.length);
        }

        if (feesRes.ok) {
          const data: Fee[] = await feesRes.json();
          const now = new Date();
          const month = now.getMonth();
          const year = now.getFullYear();
          const total = data
            .filter((fee: Fee) => {
              const paid = fee.paidDate || fee.paymentDate || fee.datePaid;
              if (!paid) return false;
              const date = new Date(paid);
              return date.getMonth() === month && date.getFullYear() === year;
            })
            .reduce((sum: number, fee: Fee) => sum + Number(fee.amount || 0), 0);
          setRevenue(total);
        }

        if (filteredClasses.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const attendancePromises = filteredClasses.map(cls =>
            fetch(`${API_BASE}/attendance/${today}/${cls.id}`, { headers })
          );

          const attendanceResponses = await Promise.all(attendancePromises);

          let presentCount = 0;

          for (const res of attendanceResponses) {
            if (res.ok) {
              const records = await res.json();
              presentCount += records.filter((r: any) => r.status === 'present').length;
            }
          }

          const studentTotal = filteredClasses.reduce(
            (sum: number, cls: any) => sum + (cls.studentCount || 0),
            0
          );

          setAttendanceRate(
            studentTotal > 0 ? (presentCount / studentTotal) * 100 : 0
          );
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('smartschool_token');
    const statusHeaders: Record<string, string> = {};
    if (token) {
      statusHeaders['Authorization'] = `Bearer ${token}`;
    }

    const fetchStatus = async () => {
      try {
        const healthRes = await fetch(`${API_BASE}/health`);
        setBackendStatus(healthRes.ok ? 'Online' : 'Offline');

        if (token) {
          const [dbRes, routeRes] = await Promise.all([
            fetch(`${API_BASE}/system/db-size`, { headers: statusHeaders }),
            fetch(`${API_BASE}/system/route-status`, { headers: statusHeaders })
          ]);

          if (dbRes.ok) {
            const { sizeKB } = await dbRes.json();
            setDbSizeMB(Number((sizeKB / 1024).toFixed(2)));
          } else {
            setStatusError('Failed to fetch DB size');
          }

          if (routeRes.ok) {
            const data = await routeRes.json();
            setRouteStatuses(data);
          } else {
            setStatusError(prev => prev || 'Failed to fetch route status');
          }
        }
      } catch (err: any) {
        setBackendStatus('Offline');
        setStatusError(err.message);
      }
    };

    fetchStatus();
  }, []);

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Teachers',
      value: teacherCount.toString(),
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add or edit users',
      icon: Users,
      color: 'text-indigo-600',
      action: () => navigate('/user-management')
    },
    {
      title: 'View Reports',
      description: 'School analytics',
      icon: BookOpen,
      color: 'text-green-600',
      action: () => navigate('/reports')
    },
    {
      title: 'Send Announcements',
      description: 'Broadcast messages',
      icon: Megaphone,
      color: 'text-orange-600',
      action: () => navigate('/announcements')
    },
    {
      title: 'Manage Students',
      description: 'Add or promote students',
      icon: GraduationCap,
      color: 'text-blue-600',
      action: () => navigate('/students')
    }
  ];

  const statusItems = [
    { name: 'Backend', status: backendStatus },
    { name: 'Frontend', status: 'Online' },
    ...Object.entries(routeStatuses).map(([key, val]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      status: val
    }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening at your school.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Frontend and backend health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <div className="flex justify-center sm:block">
                  {dbSizeMB !== null && (
                    <CircularProgress
                      value={Math.min(100, (dbSizeMB / 1024) * 100)}
                      label={`${dbSizeMB} MB`}
                      className="text-indigo-600"
                    />
                  )}
                </div>
                <ul className="mt-4 sm:mt-0 space-y-1 flex-1">
                  {statusItems.map(({ name, status }) => {
                    const online = status.toLowerCase().includes('online');
                    return (
                      <li key={name} className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${online ? 'bg-green-600' : 'bg-red-600'}`}
                        />
                        <span className="font-medium">{name}:</span>
                        <span className={!online ? 'text-red-600' : ''}>{status}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrafficData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {statusError && (
                <p className="text-red-600">Error: {statusError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="p-4 h-auto text-left flex flex-col items-start hover:bg-gray-50 transition-colors"
                    onClick={action.action}
                  >
                    <Icon className={`h-8 w-8 ${action.color} mb-2`} />
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
