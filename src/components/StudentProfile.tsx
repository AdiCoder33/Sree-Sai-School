import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, User, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, BookOpen, Droplet, Activity } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../context/AuthContext';
import { API_BASE, withBaseUrl } from '../lib/api';
import { Student, AttendanceRecord, LearningLog } from '../types/auth';

const fallbackStudent = {
  id: 'stu-001',
  firstName: 'Emma',
  lastName: 'Wilson',
  gender: 'Female',
  rollNumber: '001',
  class: 'Class 1',
  section: 'A',
  dateOfBirth: '2018-03-15',
  phone: '+1-555-1001',
  address: '123 Oak St, City',
  parentName: 'John Wilson',
  parentEmail: 'john.wilson@email.com',
  parentPhone: '+1-555-2001',
  bloodGroup: 'O+',
  medicalConditions: 'N/A',
  emergencyContact: '+1-555-9999',
  status: 'Active',
  admissionDate: '2023-04-15',
  avatar: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1'
};

const fallbackAttendance: AttendanceRecord[] = [
  { id: 'att-001', studentId: 'stu-001', teacherId: 't-001', date: '2024-01-15', status: 'present', remarks: '' },
  { id: 'att-002', studentId: 'stu-001', teacherId: 't-001', date: '2024-01-14', status: 'present', remarks: '' },
  { id: 'att-003', studentId: 'stu-001', teacherId: 't-001', date: '2024-01-13', status: 'absent', remarks: 'Sick leave' },
  { id: 'att-004', studentId: 'stu-001', teacherId: 't-001', date: '2024-01-12', status: 'present', remarks: '' },
  { id: 'att-005', studentId: 'stu-001', teacherId: 't-001', date: '2024-01-11', status: 'late', remarks: 'Traffic delay' },
  { id: 'att-006', studentId: 'stu-001', teacherId: 't-001', date: '2024-01-10', status: 'present', remarks: '' },
  { id: 'att-007', studentId: 'stu-001', teacherId: 't-001', date: '2024-01-09', status: 'present', remarks: '' }
];


interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'learning'>('profile');
  const { user } = useAuth();
  const [student, setStudent] = useState<Student>(fallbackStudent as Student);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(fallbackAttendance);
  const [learningLogs, setLearningLogs] = useState<(LearningLog & { teacherName?: string })[]>([]);

  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length
  };

  useEffect(() => {
    const token = localStorage.getItem('smartschool_token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [stuRes, attRes, logRes] = await Promise.all([
          fetch(`${API_BASE}/students/${studentId}`, { headers }),
          fetch(`${API_BASE}/attendance/student/${studentId}`, { headers }),
          fetch(`${API_BASE}/learninglogs/student/${studentId}`, { headers })
        ]);

        if (stuRes.ok) {
          const data = await stuRes.json();
          setStudent({
            ...data,
            class: data.className,
            section: data.section,
            gender: data.gender,
            avatar: withBaseUrl(data.avatar)
          });
        } else {
          setStudent(fallbackStudent);
        }

        if (attRes.ok) {
          const data = await attRes.json();
          setAttendance(Array.isArray(data) ? data : []);
        } else {
          setAttendance(fallbackAttendance);
        }

        if (logRes.ok) {
          const data = await logRes.json();
          setLearningLogs(Array.isArray(data) ? data : []);
        } else {
          setLearningLogs([]);
        }
      } catch (err) {
        console.error('❌ Error fetching student data:', err);
        setStudent(fallbackStudent);
        setAttendance(fallbackAttendance);
        setLearningLogs([]);
      }
    };

    fetchData();
  }, [studentId]);

  const attendancePercentage = Math.round(
    attendanceStats.total > 0 ? (attendanceStats.present / attendanceStats.total) * 100 : 0
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const parentName =
    student.parentName ||
    [student.parentFirstName, student.parentLastName]
      .filter(Boolean)
      .join(' ');
  const parentInitials = parentName
    ? parentName.split(' ').map(n => n[0]).join('')
    : '';

   return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Student Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20 ring-4 ring-white">
            <AvatarImage
              src={student.avatar}
              alt={`${student.firstName} ${student.lastName}`}
            />
            <AvatarFallback className="text-xl">
              {student.firstName[0]}
              {student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="mt-1 text-indigo-100">
              🎓 Roll No: {student.rollNumber} • {student.class}
            </p>
          </div>
        </div>
        <Badge
          className={`text-white px-4 py-2 rounded-full shadow-lg ${
            student.status === "Active"
              ? "bg-green-500"
              : "bg-gray-400"
          }`}
        >
          {student.status}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 border-b pb-2">
        {["profile", "attendance", "learning"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            className={`relative px-4 ${
              activeTab === tab
                ? "text-indigo-600 font-semibold after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-indigo-600 after:rounded-full"
                : "text-gray-500 hover:text-indigo-600"
            }`}
            onClick={() => setActiveTab(tab as 'profile' | 'attendance' | 'learning')}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Info */}
          <Card className="shadow-xl hover:shadow-2xl transition rounded-2xl">
            <CardHeader className="bg-indigo-600 text-white rounded-t-2xl">
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-indigo-500" />
                  <p><strong>Roll Number:</strong> {student.rollNumber}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <p><strong>Class:</strong> {student.class}/{student.section}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <p><strong>DOB:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-indigo-500" />
                  <p><strong>Phone:</strong> {student.phone}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-indigo-500" />
                  <p><strong>Address:</strong> {student.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Info */}
          <Card className="shadow-xl hover:shadow-2xl transition rounded-2xl">
            <CardHeader className="bg-pink-500 text-white rounded-t-2xl">
              <CardTitle>Parent Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {parentInitials}
                </div>
                <h3 className="text-xl font-semibold">{parentName || "N/A"}</h3>
                <p>Email: {student.parentEmail || "N/A"}</p>
                <p>Phone: {student.parentPhone || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Present", value: attendanceStats.present, color: "green" },
              { label: "Absent", value: attendanceStats.absent, color: "red" },
              { label: "Late", value: attendanceStats.late, color: "yellow" },
              { label: "Rate", value: `${attendancePercentage}%`, color: "blue" },
            ].map((stat, i) => (
              <Card key={i} className="shadow-md rounded-xl">
                <CardContent className="p-5 text-center">
                  <p className={`text-3xl font-bold text-${stat.color}-500`}>
                    {stat.value}
                  </p>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Learning Logs */}
      {activeTab === "learning" && (
        <div className="space-y-6">
          {learningLogs.map((log) => (
            <Card
              key={log.id}
              className="border-l-4 border-l-indigo-500 rounded-lg shadow-md hover:shadow-xl transition"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-indigo-500 text-white">{log.subject}</Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-medium">{log.activity}</p>
                <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  – {log.teacherName}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};