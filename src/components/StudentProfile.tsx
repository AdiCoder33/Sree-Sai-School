import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, User, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../context/AuthContext';

const mockStudentData = {
  '1': {
    firstName: 'Emma',
    lastName: 'Wilson',
    rollNumber: '001',
    class: 'Class 1',
    dateOfBirth: '2018-03-15',
    phone: '+1-555-1001',
    address: '123 Oak St, City',
    parentName: 'John Wilson',
    parentEmail: 'john.wilson@email.com',
    parentPhone: '+1-555-2001',
    status: 'Active',
    admissionDate: '2023-04-15',
    avatar: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1'
  }
};

const mockAttendanceData = [
  { date: '2024-01-15', status: 'present', remarks: '' },
  { date: '2024-01-14', status: 'present', remarks: '' },
  { date: '2024-01-13', status: 'absent', remarks: 'Sick leave' },
  { date: '2024-01-12', status: 'present', remarks: '' },
  { date: '2024-01-11', status: 'late', remarks: 'Traffic delay' },
  { date: '2024-01-10', status: 'present', remarks: '' },
  { date: '2024-01-09', status: 'present', remarks: '' },
];

const mockLearningLogs = [
  {
    id: '1',
    date: '2024-01-15',
    subject: 'Mathematics',
    activity: 'Basic addition and subtraction exercises',
    notes: 'Emma showed excellent understanding of addition concepts. She completed all exercises correctly.',
    teacherName: 'Ms. Sarah Johnson'
  },
  {
    id: '2',
    date: '2024-01-14',
    subject: 'English',
    activity: 'Reading comprehension - Story about animals',
    notes: 'Good reading skills. Emma participated actively in class discussion.',
    teacherName: 'Ms. Sarah Johnson'
  },
  {
    id: '3',
    date: '2024-01-13',
    subject: 'Science',
    activity: 'Learning about plants and their parts',
    notes: 'Emma was curious about plant growth and asked thoughtful questions.',
    teacherName: 'Ms. Sarah Johnson'
  }
];

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'learning'>('profile');
  const { user } = useAuth();
  
  const studentData = mockStudentData[studentId as keyof typeof mockStudentData] || mockStudentData['1'];
  
  const attendanceStats = {
    total: mockAttendanceData.length,
    present: mockAttendanceData.filter(a => a.status === 'present').length,
    absent: mockAttendanceData.filter(a => a.status === 'absent').length,
    late: mockAttendanceData.filter(a => a.status === 'late').length
  };

  const attendancePercentage = Math.round((attendanceStats.present / attendanceStats.total) * 100);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={studentData.avatar} alt={`${studentData.firstName} ${studentData.lastName}`} />
            <AvatarFallback className="text-lg">
              {studentData.firstName[0]}{studentData.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {studentData.firstName} {studentData.lastName}
            </h1>
            <p className="text-gray-600 mt-2">Roll Number: {studentData.rollNumber} • {studentData.class}</p>
          </div>
        </div>
        <Badge variant={studentData.status === 'Active' ? 'default' : 'secondary'}>
          {studentData.status}
        </Badge>
      </div>

      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'outline'}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </Button>
        <Button
          variant={activeTab === 'attendance' ? 'default' : 'outline'}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </Button>
        <Button
          variant={activeTab === 'learning' ? 'default' : 'outline'}
          onClick={() => setActiveTab('learning')}
        >
          Learning Logs
        </Button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={studentData.avatar} alt={`${studentData.firstName} ${studentData.lastName}`} />
                    <AvatarFallback className="text-3xl font-bold">
                      {studentData.firstName[0]}{studentData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{studentData.firstName} {studentData.lastName}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Roll Number</p>
                      <p className="font-medium">{studentData.rollNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{new Date(studentData.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{studentData.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{studentData.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {studentData.parentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-lg font-semibold">{studentData.parentName}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{studentData.parentEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{studentData.parentPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                  <p className="text-sm text-gray-600">Late</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{attendancePercentage}%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockAttendanceData.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                        {record.remarks && (
                          <p className="text-sm text-gray-600">{record.remarks}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Logs</CardTitle>
              <CardDescription>
                Daily learning activities and progress updates 
                {user?.role === 'parent' && (
                  <span className="block mt-1 text-sm text-indigo-600">
                    Teacher: Ms. Sarah Johnson
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLearningLogs.map((log) => (
                  <Card key={log.id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                          <Badge variant="secondary">{log.subject}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Activity</h4>
                          <p className="text-gray-700">{log.activity}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Teacher's Notes</h4>
                          <p className="text-gray-700">{log.notes}</p>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          <span>Logged by {log.teacherName}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
