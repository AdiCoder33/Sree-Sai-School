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
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="font-medium">New student enrolled</p>
                  <p className="text-gray-600">Emma Johnson joined Grade 5A</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="font-medium">Fee payment received</p>
                  <p className="text-gray-600">$2,500 from Grade 3 parents</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="font-medium">Teacher update</p>
                  <p className="text-gray-600">Math curriculum updated for Grade 6</p>
                </div>
              </div>
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
