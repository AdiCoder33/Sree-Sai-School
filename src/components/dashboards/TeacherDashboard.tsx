
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, CheckSquare, BookOpen, Calendar, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Class, TimetableEntry, EventItem, AttendanceRecord, LearningLog } from '../../types/auth';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [studentCount, setStudentCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const todayStats = [
    {
      title: 'My Students',
      value: studentCount.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Attendance Marked',
      value: `${presentCount}/${studentCount}`,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Classes Today',
      value: classCount.toString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Learning Logs',
      value: logCount.toString(),
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const upcomingEvents = events;

  const handleMarkAttendance = () => {
    navigate('/attendance');
  };

  const handleAddLearningLog = () => {
    navigate('/learning-logs');
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    if (time.includes('T')) return time.slice(11, 16);
    return time.slice(0, 5);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('smartschool_token');
      if (!token || !user) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const classRes = await fetch(`${API_BASE}/classes`, { headers });
        let teacherClasses: Class[] = [];
        if (classRes.ok) {
          const data: Class[] = await classRes.json();
          teacherClasses = data.filter(cls => cls.teacher_id === user.id);
          const count = teacherClasses.reduce(
            (sum: number, cls: Class) => sum + (cls.studentCount || 0),
            0
          );
          setStudentCount(count);
        }

        const todayStr = new Date().toISOString().split('T')[0];

        let present = 0;
        for (const cls of teacherClasses) {
          const attRes = await fetch(`${API_BASE}/attendance/${todayStr}/${cls.id}`, {
            headers
          });
          if (attRes.ok) {
            const records: AttendanceRecord[] = await attRes.json();
            present += records.filter(r => r.status === 'present').length;
          }
        }
        setPresentCount(present);

        const ttRes = await fetch(`${API_BASE}/timetable/teacher/${user.id}`, { headers });
        if (ttRes.ok) {
          const data: TimetableEntry[] = await ttRes.json();
          const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const filtered = data.filter(t => t.dayOfWeek?.toLowerCase() === dayName.toLowerCase());
          setTodaySchedule(filtered);
          setClassCount(filtered.length);
        }

        let logTotal = 0;
        for (const cls of teacherClasses) {
          const logRes = await fetch(`${API_BASE}/learninglogs?classId=${cls.id}`, { headers });
          if (logRes.ok) {
            const logs: LearningLog[] = await logRes.json();
            const todayLogs = logs.filter(l => l.date?.startsWith(todayStr));
            logTotal += todayLogs.length;
          }
        }
        setLogCount(logTotal);

        const eventRes = await fetch(`${API_BASE}/events`, { headers });
        if (eventRes.ok) {
          const data: EventItem[] = await eventRes.json();
          const upcoming = data.filter(ev => new Date(ev.startDate) >= new Date(todayStr));
          setEvents(upcoming.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [user]);

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
              {todaySchedule.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {item.subject} - {item.className}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </p>
                  </div>
                </div>
              ))}
              {todaySchedule.length === 0 && (
                <p className="text-sm text-gray-500">No classes today.</p>
              )}
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
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    {event.startDate && (
                      <span>{formatTime(event.startDate)}</span>
                    )}
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming events.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
