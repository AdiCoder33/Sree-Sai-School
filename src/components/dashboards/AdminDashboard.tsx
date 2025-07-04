
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, GraduationCap, DollarSign, BookOpen, TrendingUp, Megaphone } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Teachers',
      value: '45',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,678',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Attendance Rate',
      value: '94.5%',
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
