import React, { useCallback, useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import {
  User,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Book,
  DollarSign,
  BookOpen,
  CheckSquare,
  X,
  Calendar
} from 'lucide-react';
import { Student, AttendanceRecord, LearningLog, HomeworkItem, EventItem } from '../../types/auth';

// This dashboard now supports parents with multiple children. On mount,
// it fetches all children for the logged-in parent and displays a
// selection screen when more than one child is returned.

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedStudent: selectedChild,
    setSelectedStudent,
    children,
    loading
  } = useStudent();

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

  updateGreeting();                 // set immediately on mount
  const id = setInterval(updateGreeting, 60 * 1000); // keep fresh each minute
  return () => clearInterval(id);
}, []);


  // Records fetched from backend
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [learningLogs, setLearningLogs] = useState<LearningLog[]>([]);

  const fetchData = useCallback(async () => {
      if (!selectedChild) return;

      const token = localStorage.getItem('smartschool_token');
      const classId =
        selectedChild.class_id ||
        selectedChild.classId ||
        selectedChild.class;
      const today = new Date().toISOString().split('T')[0];

      try {
        const [attRes, hwRes, logRes, eventRes] = await Promise.all([
          fetch(`${API_BASE}/attendance/student/${selectedChild.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/homework/class/${classId}?date=${today}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/learninglogs?classId=${classId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/events`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (attRes.ok) {
          const records: AttendanceRecord[] = await attRes.json();
          setAttendanceRecords(records);
        }
        if (hwRes.ok) {
          const hwData: unknown = await hwRes.json();
          const combined: HomeworkItem[] = Array.isArray(hwData)
            ? hwData
            : [
                ...(hwData.today || []),
                ...(hwData.yesterday || []),
                ...(hwData.dayBefore || []),
                ...(hwData.results || [])
              ];
          const formatted = combined.map(hw => ({
            ...hw,
            teacher:
              hw.teacher ??
              `${hw.teacherFirstName ?? ''} ${hw.teacherLastName ?? ''}`.trim()
          }));
          setHomework(formatted);
        }
        if (logRes.ok) {
          const logs: LearningLog[] = await logRes.json();
          setLearningLogs(logs.filter(l => l.studentId === selectedChild.id));
        }
        if (eventRes.ok) {
          const eventData: EventItem[] = await eventRes.json();
          setEvents(eventData);
        }
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
      }
    }, [selectedChild]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!selectedChild) return;
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [selectedChild, fetchData]);

  const [events, setEvents] = useState<EventItem[]>([]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'academic':
        return 'bg-green-100 text-green-800';
      case 'sports':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50';
      case 'absent':
        return 'text-red-600 bg-red-50';
      case 'late':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalDays = attendanceRecords.length;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!selectedChild) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-0 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Select Child</h1>
        <div className="flex space-x-4 overflow-x-auto">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedStudent(child)}
              className="flex-shrink-0 w-40 p-4 border rounded-lg flex flex-col items-center hover:bg-gray-50"
            >
              <Avatar className="h-16 w-16 mb-2">
                {child.avatar && <AvatarImage src={child.avatar} alt={child.firstName} />}
                <AvatarFallback>
                  {child.firstName[0]}
                  {child.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-center">
                {child.firstName} {child.lastName}
              </span>
              <span className="text-sm text-gray-500">{child.class}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const studentName = `${selectedChild.firstName} ${selectedChild.lastName}`;
  
return (
  <div className="space-y-6 relative overflow-x-clip rounded-2xl brand-surface p-6">
    {/* Ambient blobs (visual only) */}
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="admin-blob admin-blob-a" />
      <div className="admin-blob admin-blob-b" />
      <div className="admin-blob admin-blob-c" />
    </div>

    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500 drop-shadow-sm">
          Parent Dashboard
        </h1>
        <p className="text-slate-600 mt-2">
          {greeting}! Stay connected with your child's learning journey.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {children.length > 1 && selectedChild && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl hover:shadow-md transition">
                {selectedChild.firstName} {selectedChild.lastName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-indigo-200 rounded-xl border-slate-200/60 shadow-lg">
              {children.map((child) => (
                <DropdownMenuItem
                  key={child.id}
                  onClick={() => setSelectedStudent(child)}
                  className="rounded-lg hover:bg-indigo-50"
                >
                  {child.firstName} {child.lastName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>

    {/* Top row */}
    <div className="grid ml-4 mr-4 grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student Profile */}
      <Card className="admin-card--brand rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl">
        <div className="card-top-accent--brand" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-indigo-600" />
            <span>Student Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-indigo-200 rounded-full">
              {selectedChild.avatar && <AvatarImage src={selectedChild.avatar} alt={`${selectedChild.firstName} ${selectedChild.lastName}`} />}
              <AvatarFallback className="text-2xl font-bold bg-indigo-50 text-indigo-700">
                {selectedChild.firstName[0]}{selectedChild.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{selectedChild.firstName} {selectedChild.lastName}</h3>
            <p className="text-gray-600">{selectedChild.class}</p>
            <p className="text-sm text-gray-500">Roll No: {selectedChild.rollNumber}</p>
          </div>
        </CardContent>
      </Card>

      {/* This Week */}
      <Card className="admin-card--brand rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl">
        <div className="card-top-accent--brand" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>This Week</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Attendance</span>
              <span className="text-emerald-600 font-medium">{presentDays}/{totalDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Assignments</span>
              <span className="text-indigo-600 font-medium">
                {homework.filter(h => h.completed).length}/{homework.length} completed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Grade</span>
              <span className="text-purple-600 font-medium">A-</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Status */}
      <Card className="admin-card--brand rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl">
        <div className="card-top-accent--brand" />
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
            <button className="w-full bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition">
              Pay Now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Middle row */}
    <div className="ml-4 mr-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attendance */}
      <Card className="admin-card--brand rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl">
        <div className="card-top-accent--brand" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-indigo-600" />
            <span>Attendance Records</span>
          </CardTitle>
          <CardDescription>Your child's recent attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {attendanceRecords.map((record, index) => (
              <div
                key={index}
                className={`group flex items-center justify-between p-3 rounded-xl transition ${getAttendanceStatusColor(record.status)} hover:ring-1 hover:ring-black/5`}
              >
                <div className="flex items-center space-x-3">
                  {getAttendanceIcon(record.status)}
                  <span className="font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <Badge variant="secondary" className={`${getAttendanceStatusColor(record.status)} rounded-lg`}>
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

      {/* Events */}
      <Card className="admin-card--brand rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl">
        <div className="card-top-accent--brand" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>Upcoming Events</span>
          </CardTitle>
          <CardDescription>School events and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="p-4 border rounded-xl bg-white/70 ring-1 ring-black/5 hover:bg-white transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <Badge className={`${getEventTypeColor(event.type)} rounded-lg`}>{event.type}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{event.startDate}</span>
                  {event.endDate && <span>- {event.endDate}</span>}
                  <span>{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Bottom row */}
    <div className="mr-4 ml-4 pb-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Homework */}
      <Card className="admin-card--brand rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl">
        <div className="card-top-accent--brand" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span>Today's Homework</span>
          </CardTitle>
          <CardDescription>Daily assignments from teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {homework.map((hw) => (
              <div
                key={hw.id}
                className={`p-4 border rounded-xl transition ${
                  hw.completed
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 border-red-200 hover:bg-red-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="rounded-lg">{hw.subject}</Badge>
                    {hw.completed ? (
                      <CheckSquare className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    hw.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
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

      {/* Learning Logs */}
      <Card className="admin-card--brand rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl">
        <div className="card-top-accent--brand" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Book className="h-5 w-5 text-indigo-600" />
            <span>Recent Learning Activities</span>
          </CardTitle>
          <CardDescription>What your child learned recently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningLogs.map((activity, index) => (
              <div key={index} className="p-4 border rounded-xl ring-1 ring-black/5 bg-white/70 hover:bg-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-indigo-600">{activity.subject}</span>
                  <span className="text-sm text-gray-500">{activity.date}</span>
                </div>
                <p className="text-gray-700 mb-2">{activity.activity}</p>
                <p className="text-sm text-gray-500">Teacher: {activity.teacherName}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
}