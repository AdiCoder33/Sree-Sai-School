import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog } from '../components/ui/dialog';
import { Plus, BookOpen, Calendar, CheckSquare, X, Users } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';

const mockHomework = [
  {
    id: '1',
    class: 'Class 1',
    subject: 'Mathematics',
    title: 'Solve multiplication problems',
    description: 'Complete exercises 1-10 from page 45',
    date: '2024-01-15',
    teacherId: '2',
    teacherName: 'Ms. Sarah Johnson',
    students: [
      { id: '1', name: 'Emma Johnson', completed: true },
      { id: '2', name: 'Liam Smith', completed: false },
      { id: '3', name: 'Sophia Brown', completed: true }
    ]
  },
  {
    id: '2',
    class: 'Class 1',
    subject: 'English',
    title: 'Write a short story',
    description: 'Write a 200-word story about your favorite animal',
    date: '2024-01-15',
    teacherId: '2',
    teacherName: 'Ms. Sarah Johnson',
    students: [
      { id: '1', name: 'Emma Johnson', completed: true },
      { id: '2', name: 'Liam Smith', completed: true },
      { id: '3', name: 'Sophia Brown', completed: false }
    ]
  }
];

const classList = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
];

export const Homework: React.FC = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState(mockHomework);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedStudents, setSelectedStudents] = useState<{[homeworkId: string]: string[]}>({});
  const [bulkMode, setBulkMode] = useState<{[homeworkId: string]: boolean}>({});
  const [newHomework, setNewHomework] = useState({
    class: 'Class 1',
    subject: '',
    title: '',
    description: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddHomework = () => {
    const teacherName = user ? `${user.firstName} ${user.lastName}` : 'Teacher';
    const newHw = {
      id: Date.now().toString(),
      ...newHomework,
      date: new Date().toISOString().split('T')[0],
      teacherId: user?.id || '2',
      teacherName,
      students: [] // Would be populated based on class
    };
    setHomework(prev => [newHw, ...prev]);
    setShowAddForm(false);
    setNewHomework({ class: 'Class 1', subject: '', title: '', description: '' });
  };

  const toggleStudentSelection = (homeworkId: string, studentId: string) => {
    setSelectedStudents(prev => ({
      ...prev,
      [homeworkId]: prev[homeworkId]?.includes(studentId) 
        ? prev[homeworkId].filter(id => id !== studentId)
        : [...(prev[homeworkId] || []), studentId]
    }));
  };

  const markSelectedStudents = (homeworkId: string, status: boolean) => {
    const selectedIds = selectedStudents[homeworkId] || [];
    
    setHomework(prev => prev.map(hw => 
      hw.id === homeworkId 
        ? {
            ...hw,
            students: hw.students.map(student => 
              selectedIds.includes(student.id)
                ? { ...student, completed: status }
                : student
            )
          }
        : hw
    ));
    
    // Clear selections and exit bulk mode
    setSelectedStudents(prev => ({ ...prev, [homeworkId]: [] }));
    setBulkMode(prev => ({ ...prev, [homeworkId]: false }));
  };

  const toggleStudentCompletion = (homeworkId: string, studentId: string) => {
    if (bulkMode[homeworkId]) {
      toggleStudentSelection(homeworkId, studentId);
      return;
    }

    setHomework(prev => prev.map(hw => 
      hw.id === homeworkId 
        ? {
            ...hw,
            students: hw.students.map(student => 
              student.id === studentId 
                ? { ...student, completed: !student.completed }
                : student
            )
          }
        : hw
    ));
  };

  const filteredHomework = user?.role === 'parent' 
    ? homework.filter(hw => hw.class === 'Class 1') // Parent sees their child's class
    : homework.filter(hw => hw.class === selectedClass);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
          <p className="text-gray-600 mt-2">Manage daily homework assignments</p>
        </div>
        <RoleGuard allowedRoles={['teacher', 'admin']}>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Homework
          </Button>
        </RoleGuard>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Homework</CardTitle>
            <CardDescription>Create a new homework assignment for students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select 
                  value={newHomework.class}
                  onChange={(e) => setNewHomework({...newHomework, class: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {classList.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Input
                  value={newHomework.subject}
                  onChange={(e) => setNewHomework({...newHomework, subject: e.target.value})}
                  placeholder="Enter subject"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                  placeholder="Homework title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={newHomework.description}
                  onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                  placeholder="Detailed homework instructions"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddHomework}>
                Add Homework
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-4 mb-6">
        <RoleGuard allowedRoles={['teacher', 'admin']}>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {classList.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </RoleGuard>
        <RoleGuard allowedRoles={['admin', 'teacher']}>
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
            <BookOpen className="mr-2 h-4 w-4" />
            Create Homework
          </Button>
        </RoleGuard>
      </div>

      <div className="space-y-4">
        {filteredHomework.map((hw) => (
          <Card key={hw.id} className="border-l-4 border-l-indigo-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{hw.subject}</Badge>
                  <span className="text-sm text-gray-500">{hw.class}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(hw.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{hw.title}</h4>
                  <p className="text-gray-700 mt-1">{hw.description}</p>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4" />
                  <span>Assigned by {hw.teacherName}</span>
                </div>

                <RoleGuard allowedRoles={['teacher', 'admin']}>
                  {hw.students.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-gray-900">Student Completion Status</h5>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={bulkMode[hw.id] ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBulkMode(prev => ({ 
                              ...prev, 
                              [hw.id]: !prev[hw.id] 
                            }))}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Bulk Select
                          </Button>
                          {bulkMode[hw.id] && selectedStudents[hw.id]?.length > 0 && (
                            <>
                              <span className="text-sm text-gray-600">
                                {selectedStudents[hw.id].length} selected
                              </span>
                              <Button
                                size="sm"
                                onClick={() => markSelectedStudents(hw.id, true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Completed
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => markSelectedStudents(hw.id, false)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Mark Incomplete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {hw.students.map((student) => {
                          const isSelected = selectedStudents[hw.id]?.includes(student.id);
                          return (
                            <div 
                              key={student.id} 
                              className={`flex items-center justify-between p-2 border rounded cursor-pointer ${
                                bulkMode[hw.id] && isSelected 
                                  ? 'border-indigo-500 bg-indigo-50' 
                                  : 'border-gray-200'
                              }`}
                              onClick={() => toggleStudentCompletion(hw.id, student.id)}
                            >
                              <span className="text-sm">{student.name}</span>
                              <div className="flex items-center space-x-2">
                                {bulkMode[hw.id] && (
                                  <div className={`w-4 h-4 border-2 rounded ${
                                    isSelected 
                                      ? 'bg-indigo-600 border-indigo-600' 
                                      : 'border-gray-300'
                                  }`} />
                                )}
                                <div className={`p-1 rounded ${
                                  student.completed ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                                }`}>
                                  {student.completed ? <CheckSquare className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </RoleGuard>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
