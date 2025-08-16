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

interface SchoolClass {
  id: string
  name?: string
  studentCount?: number
}

interface BasicUser {
  role?: string
}

interface AttendanceRecord {
  status: string
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

  const DB_LIMIT_MB = 4096;
  const formatSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb}MB`;
  };
  // ⏰ dynamic greeting
const [greeting, setGreeting] = useState("Hello");

useEffect(() => {
  const updateGreeting = () => {
    const hour = new Date().getHours();
    const g =
      hour >= 5 && hour < 12
        ? "Good Morning"
        : hour >= 12 && hour < 17
        ? "Good Afternoon"
        : hour >= 17 && hour < 21
        ? "Good Evening"
        : "Good Night";
    setGreeting(g);
  };

  updateGreeting();                      // set immediately on mount
  const id = setInterval(updateGreeting, 60 * 1000); // refresh every minute
  return () => clearInterval(id);
}, []);


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

        let filteredClasses: SchoolClass[] = [];

        if (classesRes.ok) {
          const classes: SchoolClass[] = await classesRes.json();
          filteredClasses = classes.filter((cls: SchoolClass) => {
            const match = cls.name?.match(/(\d+)/);
            const number = match ? parseInt(match[1], 10) : NaN;
            return number >= 1 && number <= 10;
          });

          const studentTotal = filteredClasses.reduce(
            (sum: number, cls: SchoolClass) => sum + (cls.studentCount || 0),
            0
          );
          setTotalStudents(studentTotal);
        }

        if (usersRes.ok) {
          const users: BasicUser[] = await usersRes.json();
          const teachers = users.filter((u: BasicUser) => u.role === 'teacher');
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
              const records: AttendanceRecord[] = await res.json();
              presentCount += records.filter((r: AttendanceRecord) => r.status === 'present').length;
            }
          }

          const studentTotal = filteredClasses.reduce(
            (sum: number, cls: SchoolClass) => sum + (cls.studentCount || 0),
            0
          );

          setAttendanceRate(
            studentTotal > 0 ? (presentCount / studentTotal) * 100 : 0
          );
        }
      } catch (err) {
        const error = err as Error
        console.error('Error fetching dashboard stats:', error)
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
      } catch (err) {
        const error = err as Error
        setBackendStatus('Offline');
        setStatusError(error.message);
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

  const halfIndex = Math.ceil(statusItems.length / 2);
  const firstHalf = statusItems.slice(0, halfIndex);
  const secondHalf = statusItems.slice(halfIndex);

  return (
  <div className="space-y-2 relative brand-surface overflow-x-clip rounded-2xl m-0 p-3 md:p-4">
    {/* Decorative blobs — visual only */}
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="admin-blob admin-blob-a" />
      <div className="admin-blob admin-blob-b" />
      <div className="admin-blob admin-blob-c" />
    </div>

    {/* Header */}
    <div>
      <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 drop-shadow-sm">
        Admin Dashboard
      </h1>
      <p className="text-slate-600 mt-2">
        {greeting}! Here's what's happening at your school.
      </p>
    </div>

    {/* Stats — brand glass with 3D hover */}
    <div className="grid rounded-xl grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="admin-card--brand group rounded-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <div className="card-top-accent--brand h-1.5 w-full" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>

                {/* Right pill – soft gradient + inner shine */}
                <div
                  className={[
                    'icon-pill--brand p-3 rounded-2xl ring-1 ring-black/5 shadow-inner',
                    'bg-gradient-to-br', // enables the pill gradient
                  ].join(' ')}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

    {/* System + Quick Actions */}
    <div className="pb-4 rounded-2xl grid grid-cols-1 lg:grid-cols-2 gap-6 ring-1 ring-black/5 shadow-md">
      {/* System Health */}
      <Card className="admin-card--brand rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.15)]"></span>
            System Health
          </CardTitle>
          <CardDescription>Frontend and backend health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <ul className="space-y-1">
                {firstHalf.map(({ name, status }) => {
                  const online = status.toLowerCase().includes('online');
                  return (
                    <li
                      key={name}
                      className="flex items-center space-x-2 rounded-xl px-2.5 py-1.5 bg-white/70 ring-1 ring-black/5 hover:bg-white transition"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          online
                            ? 'bg-green-600 shadow-[0_0_0_3px_rgba(16,185,129,.18)]'
                            : 'bg-red-600 shadow-[0_0_0_3px_rgba(244,63,94,.18)]'
                        }`}
                      />
                      <span className="font-medium">{name}:</span>
                      <span className={!online ? 'text-red-600' : 'text-emerald-700'}>{status}</span>
                    </li>
                  );
                })}
              </ul>

              <ul className="space-y-1">
                {secondHalf.map(({ name, status }) => {
                  const online = status.toLowerCase().includes('online');
                  return (
                    <li
                      key={name}
                      className="flex items-center space-x-2 rounded-xl px-2.5 py-1.5 bg-white/70 ring-1 ring-black/5 hover:bg-white transition"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          online
                            ? 'bg-green-600 shadow-[0_0_0_3px_rgba(16,185,129,.18)]'
                            : 'bg-red-600 shadow-[0_0_0_3px_rgba(244,63,94,.18)]'
                        }`}
                      />
                      <span className="font-medium">{name}:</span>
                      <span className={!online ? 'text-red-600' : 'text-emerald-700'}>{status}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-center">
                {dbSizeMB !== null && (
                  <CircularProgress
                    size={120}
                    strokeWidth={8}
                    value={Math.min(100, (dbSizeMB / DB_LIMIT_MB) * 100)}
                    label={`${formatSize(dbSizeMB)} / ${formatSize(DB_LIMIT_MB)}`}
                    className="text-indigo-600"
                  />
                )}
              </div>
            </div>

            {/* Chart with brand surface */}
            <div className="h-32 rounded-xl chart-surface--brand p-2 ring-1 ring-black/5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrafficData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {statusError && <p className="text-red-600">Error: {statusError}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="admin-card--brand rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
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
                  onClick={action.action}
                  className="group p-4 h-auto text-left flex flex-col items-start bg-white/70 hover:bg-white transition-all rounded-2xl ring-1 ring-black/5 border-slate-200/70 hover:shadow-lg"
                >
                  <span className="rounded-xl ring-1 ring-black/5 bg-white p-2 shadow-inner mb-1 group-hover:scale-105 transition">
                    <Icon className={`h-8 w-8 ${action.color}`} />
                  </span>
                  <p className="font-medium text-slate-900">{action.title}</p>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
}