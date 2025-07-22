import React, { useState,useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { CheckCircle, XCircle, Calendar, Users, Download, UserCheck, UserX, Clock } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import axios from 'axios';






export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'unmarked'>>({});
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [mockChildAttendance, setMockChildAttendance] = useState([]);
  const [classList, setClassList] = useState<{ id: string; name: string }[]>([]);



  const [studentsInClass, setStudentsInClass] = useState([]);
useEffect(() => {
  const token = localStorage.getItem('smartschool_token');
  axios.get('http://localhost:5000/api/classes', {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => {
    setClassList(res.data);
    if (res.data.length > 0 && !selectedClass) {
  setSelectedClass(res.data[0].id);
}

  })
  .catch(err => {
    console.error('❌ Error fetching class list:', err);
  });
}, []);

useEffect(() => {
  if (!selectedClass) return; // 🛡️ Prevent calling API with empty classId

  const token = localStorage.getItem('smartschool_token');
  axios.get(`http://localhost:5000/api/students/class/${selectedClass}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    setStudentsInClass(res.data);
  })
  .catch(err => {
    console.error('❌ Error fetching students:', err);
  });
}, [selectedClass]);


  
  const getAttendanceStatus = (studentId: string) => {
    return attendance[studentId] || 'unmarked';
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent') => {
  setAttendance(prev => ({
    ...prev,
    [studentId]: status
  }));

  try {
    const token = localStorage.getItem('smartschool_token');
    await axios.post('http://localhost:5000/api/attendance', {
      student_id: studentId,
      date: selectedDate,
      status,
      remarks: ''
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Attendance marked!');
  } catch (error) {
    toast.error('Failed to mark attendance');
    console.error(error);
  }
};
useEffect(() => {
  if (user?.role === 'parent') {
    const token = localStorage.getItem('smartschool_token');
    axios.get(`http://localhost:5000/api/attendance/parent/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setMockChildAttendance(res.data);
    });
  }
}, [user]);



  const markAllPresent = () => {
    const newAttendance = { ...attendance };
    studentsInClass.forEach(student => {
      newAttendance[student.id] = 'present';
    });
    setAttendance(newAttendance);
    toast.success('All students marked present!');
  };

  const bulkMarkSelected = async (status: 'present' | 'absent') => {
  if (selectedStudents.length === 0) {
    toast.error('Please select students first');
    return;
  }

  setAttendance(prev => {
    const updated = { ...prev };
    selectedStudents.forEach(id => updated[id] = status);
    return updated;
  });

  try {
    const token = localStorage.getItem('smartschool_token');
    await axios.post('http://localhost:5000/api/attendance/bulk', {
      students: selectedStudents,
      date: selectedDate,
      status
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Bulk attendance updated');
  } catch (err) {
    toast.error('Bulk update failed');
    console.error(err);
  }

  setSelectedStudents([]);
};


  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const generateExcelReport = () => {
    try {
      const reportData = studentsInClass.map(student => ({
        'Student Name': student.name,
        'Roll Number': student.rollNumber,
        'Class': student.class,
        'Date': selectedDate,
        'Status': getAttendanceStatus(student.id)
      }));

      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
      
      const className = classList.find(cls => cls.id === selectedClass)?.name || selectedClass;
XLSX.writeFile(wb, `attendance_${className}_${selectedDate}.xlsx`);

      toast.success('Attendance report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50 border-green-200';
      case 'absent': return 'text-red-600 bg-red-50 border-red-200';
      case 'late': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };
  

useEffect(() => {
  const token = localStorage.getItem('smartschool_token');

  axios.get(`http://localhost:5000/api/attendance/${selectedDate}/${selectedClass}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => {
    const fetched = res.data.reduce((acc: any, curr: any) => {
      acc[curr.student_id] = curr.status;
      return acc;
    }, {});
    setAttendance(fetched);
  })
  .catch(err => {
    console.error("❌ Error fetching attendance:", err);
  });
}, [selectedClass, selectedDate]);


  // Parent view - show only their child's attendance records
  if (user?.role === 'parent') {
    const presentDays = mockChildAttendance.filter(record => record.status === 'present').length;
    const absentDays = mockChildAttendance.filter(record => record.status === 'absent').length;
    const lateDays = mockChildAttendance.filter(record => record.status === 'late').length;
    const totalDays = mockChildAttendance.length;

    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Child's Attendance</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            View your child's attendance records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Present Days</p>
                  <p className="text-xl font-bold text-green-600">{presentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Absent Days</p>
                  <p className="text-xl font-bold text-red-600">{absentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Late Days</p>
                  <p className="text-xl font-bold text-yellow-600">{lateDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-xl font-bold text-blue-600">{totalDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Calendar className="h-5 w-5" />
              <span>Attendance Records</span>
            </CardTitle>
            <CardDescription>Your child's daily attendance history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockChildAttendance.map((record, index) => (
                <div key={index} className={`flex items-center justify-between p-4 border rounded-lg ${getStatusColor(record.status)}`}>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <span className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Teacher/Principal view - full attendance management
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Mark and view student attendance records
          </p>
        </div>

        <Button onClick={generateExcelReport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Generate Excel Report
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Class:</label>
          <select 
  value={selectedClass}
  onChange={(e) => setSelectedClass(e.target.value)}
  className="..."
>
  {classList.map(cls => (
    <option key={cls.id} value={cls.id}>{cls.name}</option>
  ))}
</select>


        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={markAllPresent} className="bg-green-600 hover:bg-green-700">
          <UserCheck className="mr-2 h-4 w-4" />
          Mark All Present
        </Button>
        <Button 
          onClick={() => bulkMarkSelected('present')} 
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          Mark Selected Present
        </Button>
        <Button 
          onClick={() => bulkMarkSelected('absent')} 
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          <UserX className="mr-2 h-4 w-4" />
          Mark Selected Absent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <Users className="h-5 w-5" />
            <span>
  Student Attendance - {
    classList.find(cls => cls.id === selectedClass)?.name || 'Unknown Class'
  }
</span>

          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {studentsInClass.map((student) => {
              const status = getAttendanceStatus(student.id);
              const isSelected = selectedStudents.includes(student.id);
              
              return (
                <div 
                  key={student.id} 
                  className={`flex items-center justify-between p-3 md:p-4 border rounded-lg ${getStatusColor(status)} ${
                    isSelected ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="text-xs md:text-sm">
  {`${student.firstName?.[0] ?? ''}${student.lastName?.[0] ?? ''}`}
</AvatarFallback>


                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">
  {student.name || `${student.firstName ?? ''} ${student.lastName ?? ''}`}
</p>

                      <p className="text-xs md:text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={status === 'present' ? 'default' : 'outline'}
                        onClick={() => markAttendance(student.id, 'present')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={status === 'absent' ? 'default' : 'outline'}
                        onClick={() => markAttendance(student.id, 'absent')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <Badge variant="secondary" className={`${getStatusColor(status)} text-xs md:text-sm`}>
                        {status === 'unmarked' ? 'Not Marked' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
