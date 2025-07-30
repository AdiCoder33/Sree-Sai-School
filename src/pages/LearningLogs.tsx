import React, { useState,useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Plus, BookOpen, Calendar, User, Search, Users, Filter } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';

export const LearningLogs: React.FC = () => {
  const { user } = useAuth();
  const { selectedStudent } = useStudent();
  const [classList, setClassList] = useState([]);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState<any[]>([]); // 👈 ensures logs is always an array


  const token = localStorage.getItem('smartschool_token');
  const authHeader = { Authorization: `Bearer ${token}` };

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newLog, setNewLog] = useState({
    studentId: '',
    studentName: '',
    subject: '',
    activity: '',
    notes: '',
    classId: ''
  });

  if (user?.role === 'parent' && !selectedStudent) {
    return <div className="p-4">Please select a student to view learning logs.</div>;
  }

  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Physical Education'];

  const filteredLogs = logs.filter(log => {
  const studentName = Array.isArray(log.studentName)
    ? log.studentName.join(' ').trim()
    : (log.studentName || '').toString().trim();

  const subject = (log.subject || '').toString();
  const activity = (log.activity || '').toString();

  return (
    studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.toLowerCase().includes(searchTerm.toLowerCase())
  );
});





useEffect(() => {
  fetch(`${API_BASE}/classes`, { headers: authHeader })
  .then(res => res.json())
  .then(setClassList);
}, []);

useEffect(() => {
  if (user?.role === 'parent') {
    if (!selectedStudent) return;
    const classId =
      (selectedStudent as any).class_id ||
      (selectedStudent as any).classId ||
      (selectedStudent as any).class;
    fetch(`${API_BASE}/learninglogs?classId=${classId}`, { headers: authHeader })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setLogs(arr.filter(log => log.studentId === selectedStudent.id));
      });
  }
}, [user, selectedStudent]);


  const handleClassChange = (className) => {
  setSelectedClass(className);
  const selected = classList.find(cls => cls.name === className);
  if (!selected) return;

  const classId = selected.id;
  setNewLog(prev => ({ ...prev, classId }));

  fetch(`${API_BASE}/students/class/${classId}`, { headers: authHeader })
    .then(res => res.json())
    .then(data => setStudents(Array.isArray(data) ? data : []));

  fetch(`${API_BASE}/learninglogs?classId=${classId}`, { headers: authHeader })
    .then(res => res.json())
    .then(data => setLogs(Array.isArray(data) ? data : []));
};

const handleDeleteLog = (id: string) => {
  if (!window.confirm('Are you sure you want to delete this log?')) return;

  fetch(`${API_BASE}/learninglogs/${id}`, {
    method: 'DELETE',
    headers: authHeader,
  })
    .then((res) => {
      if (res.ok) {
        setLogs((prev) => prev.filter((log) => log.id !== id));
      } else {
        alert('Failed to delete log');
      }
    })
    .catch((err) => {
      console.error('Delete error:', err);
      alert('Server error');
    });
};


useEffect(() => {
  if (user?.role === 'parent') return;
  if (!classList.length) return; // wait for classList to load

  const selected = classList.find(cls => cls.name === selectedClass);
  if (!selected) return;

  const classId = selected.id;

  fetch(`${API_BASE}/learninglogs?classId=${classId}`, {
    headers: authHeader
  })
    .then(res => res.json())
    .then(data => setLogs(Array.isArray(data) ? data : []));
}, [selectedClass, classList, user]);




  const handleStudentChange = (studentId) => {
  const student = students.find(s => s.id === studentId);
  const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim();
setNewLog({ ...newLog, studentId, studentName: fullName });

};
;

  const handleAddLog = () => {
  fetch(`${API_BASE}/learninglogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify(newLog)
  }).then(() => {
    setShowAddForm(false);
    setNewLog({ studentId: '', studentName: '', subject: '', activity: '', notes: '',classId: '' });

    const selected = classList.find(cls => cls.name === selectedClass);
    const classId = selected?.id;

    if (classId) {
      fetch(`${API_BASE}/learninglogs?classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setLogs);
    }
  });
}; 




  return (
    <div className="space-y-6 p-4 md:p-6">
      <RoleGuard allowedRoles={['teacher']}>
  <Button 
    onClick={() => setShowAddForm(true)}
    className="bg-indigo-600 hover:bg-indigo-700"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Learning Log
  </Button>
</RoleGuard>


      {showAddForm && (
        <Card className="shadow-lg border-indigo-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle className="text-indigo-900">Add New Learning Log</CardTitle>
            <CardDescription className="text-indigo-700">Record daily learning activities for students</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  {classList.map(cls => (
  <option key={cls.id} value={cls.name}>
    {cls.name}
  </option>
))}

                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <select 
                  value={newLog.studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Student</option>
                  {Array.isArray(students) && students.map(student => (
  <option key={student.id} value={student.id}>{student.firstName} {student.lastName}
</option>
))}


                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
<Input
  type="text"
  value={newLog.subject}
  onChange={(e) => setNewLog({ ...newLog, subject: e.target.value })}
  placeholder="Enter subject name"
  className="focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
/>

              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Activity</label>
                <Input
                  value={newLog.activity}
                  onChange={(e) => setNewLog({...newLog, activity: e.target.value})}
                  placeholder="Describe the learning activity"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <Textarea
                  value={newLog.notes}
                  onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                  placeholder="Additional notes about student's progress"
                  rows={4}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-8">
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleAddLog} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                Save Learning Log
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
  <div className="mt-6 mb-4">
    <h2 className="text-xl font-bold text-indigo-900">Recent Learning Logs</h2>
    <p className="text-sm text-indigo-700">Track daily learning activities and student progress</p>
  </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student, subject, or activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <select
  value={selectedClass}
  onChange={(e) => setSelectedClass(e.target.value)}
  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
>
  <option value="">All Classes</option>
  {classList.map(cls => (
  <option key={cls.id} value={cls.name}>{cls.name}</option>
))}


</select>

          </div>

          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
  {Array.isArray(log.studentName)
  ? log.studentName.join(' ').trim()
  : log.studentName?.toString().trim() || ''}

</span>

                      </div>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                        {log.subject}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
  <span>Logged by {log.teacherName}</span>
  <div className="flex items-center space-x-4">
    <span>{new Date(log.date).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    })}</span>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => handleDeleteLog(log.id)}
      className="text-xs"
    >
      Delete
    </Button>
  </div>
</div>

                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Activity
                      </h4>
                      <p className="text-gray-700">{log.activity}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Teacher's Notes</h4>
                      <p className="text-gray-700">{log.notes}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                      <span>Logged by {log.teacherName}</span>
                      <span>{new Date(log.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </div>
  );
};
