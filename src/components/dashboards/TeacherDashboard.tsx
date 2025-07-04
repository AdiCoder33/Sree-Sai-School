
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, CheckSquare, BookOpen, Calendar, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const todayStats = [
    {
      title: 'My Students',
      value: '32',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Attendance Marked',
      value: '28/32',
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Classes Today',
      value: '5',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Learning Logs',
      value: '3',
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Parent-Teacher Meeting',
      date: '2024-02-20',
      time: '02:00 PM',
      type: 'meeting'
    },
    {
      title: 'Science Fair',
      date: '2024-02-25',
      time: '10:00 AM',
      type: 'academic'
    }
  ];

  const handleMarkAttendance = () => {
    navigate('/attendance');
  };

  const handleAddLearningLog = () => {
    navigate('/learning-logs');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-2">Good morning! Ready to inspire young minds today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Mathematics - Grade 5A</p>
                  <p className="text-sm text-gray-600">9:00 AM - 10:00 AM</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Science - Grade 5B</p>
                  <p className="text-sm text-gray-600">11:00 AM - 12:00 PM</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Next</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Mathematics - Grade 6A</p>
                  <p className="text-sm text-gray-600">2:00 PM - 3:00 PM</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Later</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button 
                onClick={handleMarkAttendance}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <CheckSquare className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium">Mark Attendance</p>
                  <p className="text-sm text-gray-600">Record student attendance</p>
                </div>
              </button>
              <button 
                onClick={handleAddLearningLog}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <BookOpen className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Add Learning Log</p>
                  <p className="text-sm text-gray-600">Share daily activities with parents</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>School events and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>at {event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
