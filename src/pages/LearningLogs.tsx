import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Plus, BookOpen, Calendar, User, Search, Users, Filter } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';

const classList = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);

const mockStudentsByClass = {
  'Class 1': [
    { id: '1', name: 'Emma Johnson' },
    { id: '2', name: 'Liam Smith' },
    { id: '3', name: 'Sophia Brown' },
    { id: '4', name: 'Noah Davis' },
    { id: '5', name: 'Olivia Wilson' }
  ],
  'Class 2': [
    { id: '6', name: 'James Miller' },
    { id: '7', name: 'Isabella Garcia' },
    { id: '8', name: 'William Rodriguez' },
    { id: '9', name: 'Charlotte Martinez' },
    { id: '10', name: 'Benjamin Anderson' }
  ]
  // Add more classes as needed
};

const mockLearningLogs = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Emma Johnson',
    date: '2024-01-15',
    subject: 'Mathematics',
    activity: 'Learned multiplication tables 1-10',
    notes: 'Emma showed excellent understanding of multiplication concepts. She completed all exercises correctly.',
    teacherId: '2',
    teacherName: 'Sarah Johnson'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Liam Smith',
    date: '2024-01-15',
    subject: 'Science',
    activity: 'Conducted water cycle experiment',
    notes: 'Great participation in the experiment. Liam asked thoughtful questions about evaporation.',
    teacherId: '2',
    teacherName: 'Sarah Johnson'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Sophia Brown',
    date: '2024-01-14',
    subject: 'English',
    activity: 'Reading comprehension exercises',
    notes: 'Sophia has improved her reading speed and understanding significantly this week.',
    teacherId: '2',
    teacherName: 'Sarah Johnson'
  }
];

export const LearningLogs: React.FC = () => {
  const [logs] = useState(mockLearningLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newLog, setNewLog] = useState({
    studentId: '',
    studentName: '',
    subject: '',
    activity: '',
    notes: ''
  });

  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Physical Education'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !selectedSubject || log.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const handleClassChange = (className) => {
    setSelectedClass(className);
    setNewLog({ ...newLog, studentId: '', studentName: '' });
  };

  const handleStudentChange = (studentId) => {
    const student = mockStudentsByClass[selectedClass]?.find(s => s.id === studentId);
    setNewLog({
      ...newLog,
      studentId: studentId,
      studentName: student?.name || ''
    });
  };

  const handleAddLog = () => {
    console.log('Adding new log:', newLog);
    setShowAddForm(false);
    setNewLog({ studentId: '', studentName: '', subject: '', activity: '', notes: '' });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Learning Logs</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">Daily learning activities and progress updates</p>
        </div>
        <RoleGuard allowedRoles={['teacher']}>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Learning Log
          </Button>
        </RoleGuard>
      </div>

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
                    <option key={cls} value={cls}>{cls}</option>
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
                  {mockStudentsByClass[selectedClass]?.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  value={newLog.subject}
                  onChange={(e) => setNewLog({...newLog, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
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

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardTitle className="text-indigo-900">Recent Learning Logs</CardTitle>
          <CardDescription className="text-indigo-700">Track daily learning activities and student progress</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
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
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{log.studentName}</span>
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
        </CardContent>
      </Card>
    </div>
  );
};
