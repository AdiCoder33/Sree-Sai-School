
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { User, CheckCircle, XCircle, Book, DollarSign, BookOpen, CheckSquare, X, Calendar, UserCheck, UserX, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export const ParentDashboard: React.FC = () => {
  // Mock student data
  const student = {
    name: 'Emma Wilson',
    class: 'Class 1',
    rollNumber: '2024-05-15',
    avatar: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1'
  };

  // Mock attendance data for the child
  const attendanceRecords = [
    { date: '2024-01-15', status: 'present' },
    { date: '2024-01-14', status: 'present' },
    { date: '2024-01-13', status: 'absent' },
    { date: '2024-01-12', status: 'present' },
    { date: '2024-01-11', status: 'present' },
    { date: '2024-01-10', status: 'present' },
    { date: '2024-01-09', status: 'late' },
    { date: '2024-01-08', status: 'present' }
  ];

  const recentActivities = [
    {
      date: '2024-01-15',
      subject: 'Mathematics',
      activity: 'Learned multiplication tables and solved word problems',
      teacher: 'Ms. Sarah Johnson'
    },
    {
      date: '2024-01-14',
      subject: 'Science',
      activity: 'Conducted experiment on plant growth and photosynthesis',
      teacher: 'Ms. Sarah Johnson'
    },
    {
      date: '2024-01-13',
      subject: 'English',
      activity: 'Read chapter 5 of "Charlotte\'s Web" and wrote summary',
      teacher: 'Ms. Sarah Johnson'
    }
  ];

  const todayHomework = [
    {
      id: '1',
      subject: 'Mathematics',
      title: 'Solve multiplication problems',
      description: 'Complete exercises 1-10 from page 45',
      completed: true,
      teacher: 'Ms. Sarah Johnson'
    },
    {
      id: '2',
      subject: 'English',
      title: 'Write a short story',
      description: 'Write a 200-word story about your favorite animal',
      completed: false,
      teacher: 'Ms. Sarah Johnson'
    },
    {
      id: '3',
      subject: 'Science',
      title: 'Draw plant parts',
      description: 'Draw and label different parts of a plant',
      completed: true,
      teacher: 'Ms. Sarah Johnson'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Parent-Teacher Meeting',
      date: '2024-01-25',
      time: '10:00 AM',
      type: 'meeting',
      description: 'Quarterly parent-teacher conference'
    },
    {
      id: '2',
      title: 'Science Fair',
      date: '2024-01-30',
      time: '2:00 PM',
      type: 'academic',
      description: 'Annual school science exhibition'
    },
    {
      id: '3',
      title: 'Sports Day',
      date: '2024-02-05',
      time: '9:00 AM',
      type: 'sports',
      description: 'Annual sports competition and fun activities'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'sports': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'absent': return <UserX className="h-4 w-4 text-red-600" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
  const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
  const totalDays = attendanceRecords.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-600 mt-2">Stay connected with your child's learning journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Student Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="text-2xl font-bold">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{student.name}</h3>
              <p className="text-gray-600">{student.class}</p>
              <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>This Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Attendance</span>
                <span className="text-green-600 font-medium">{presentDays}/{totalDays} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Assignments</span>
                <span className="text-blue-600 font-medium">3/3 completed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Grade</span>
                <span className="text-purple-600 font-medium">A-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <span>Fee Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Fee</span>
                <span className="text-green-600 font-medium">Paid</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Next Due</span>
                <span className="text-orange-600 font-medium">Feb 15</span>
              </div>
              <button className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors">
                Pay Now
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Attendance Records</span>
            </CardTitle>
            <CardDescription>Your child's recent attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {attendanceRecords.map((record, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${getAttendanceStatusColor(record.status)}`}>
                  <div className="flex items-center space-x-3">
                    {getAttendanceIcon(record.status)}
                    <span className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <Badge variant="secondary" className={getAttendanceStatusColor(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Present: {presentDays} days</span>
                <span>Absent: {absentDays} days</span>
                <span>Total: {totalDays} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>School events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{event.date}</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Today's Homework</span>
            </CardTitle>
            <CardDescription>Daily assignments from teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayHomework.map((hw) => (
                <div key={hw.id} className={`p-4 border rounded-lg ${hw.completed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{hw.subject}</Badge>
                      {hw.completed ? (
                        <CheckSquare className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${hw.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {hw.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{hw.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{hw.description}</p>
                  <p className="text-xs text-gray-500">Assigned by {hw.teacher}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Book className="h-5 w-5" />
              <span>Recent Learning Activities</span>
            </CardTitle>
            <CardDescription>What your child learned recently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-indigo-600">{activity.subject}</span>
                    <span className="text-sm text-gray-500">{activity.date}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{activity.activity}</p>
                  <p className="text-sm text-gray-500">Teacher: {activity.teacher}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
