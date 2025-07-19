import React, { useState,useEffect} from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog } from '../components/ui/dialog';
import { Plus, BookOpen, Calendar, CheckSquare, X, Users } from 'lucide-react';
import axios from 'axios';

import { RoleGuard } from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';






export const Homework: React.FC = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState(''); // instead of 'Class 1'
  const [selectedStudents, setSelectedStudents] = useState<{[homeworkId: string]: string[]}>({});
  const [bulkMode, setBulkMode] = useState<{[homeworkId: string]: boolean}>({});
  const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});

  const [newHomework, setNewHomework] = useState({
  class_id: '', subject: '', title: '', description: ''
});



  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  

useEffect(() => {
  const fetchHomework = async () => {
    try {
      const token = localStorage.getItem('smartschool_token');
      const res = await axios.get(`http://localhost:5000/api/homework/class/${selectedClass}?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const todayStr = new Date().toDateString();
const selectedStr = new Date(selectedDate).toDateString();
let combined;

if (selectedStr === todayStr) {
  combined = [
    ...(res.data.today || []),
    ...(res.data.yesterday || []),
    ...(res.data.dayBefore || [])
  ];
} else if (res.data.results) {
  combined = res.data.results;
} else {
  combined = [];
}


      setHomework(combined);
      console.log("Fetched homework response:", res.data);

      const selectedClassName = classList.find(c => c.id === selectedClass)?.name || 'Selected Class';
      const formattedDate = new Date(selectedDate).toLocaleDateString();
      toast.success(`📚 Homework for ${selectedClassName} on ${formattedDate} loaded successfully`);
    } catch (error: any) {
      console.error('❌ Failed to fetch homework:', error.message);
      toast.error("Failed to fetch homework");
    }
  };

  if (selectedClass) fetchHomework();
}, [selectedClass, selectedDate]);





  const handleAddHomework = async () => {
  try {
    if (!newHomework.class_id) {
      alert("Please select a class before submitting homework.");
      return;
    }

    const res = await axios.post('http://localhost:5000/api/homework', {
      class_id: newHomework.class_id,
      subject: newHomework.subject,
      title: newHomework.title,
      description: newHomework.description,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('smartschool_token')}` }
    });

    // Fetch latest homework again
    const updatedHomework = await axios.get(`http://localhost:5000/api/homework/class/${selectedClass}?date=${selectedDate}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('smartschool_token')}` }
});
const combined = [
  ...(updatedHomework.data.today || []),
  ...(updatedHomework.data.yesterday || []),
  ...(updatedHomework.data.dayBefore || [])
];
setHomework(combined);


    

    setShowAddForm(false);
    setNewHomework({ class_id: selectedClass, subject: '', title: '', description: '' });
  } catch (error) {
    console.error('❌ Failed to add homework:', error.message);
  }
};

const [classList, setClassList] = useState<{ id: string; name: string }[]>([]);


const fetchClasses = async () => {
  try {
    const token = localStorage.getItem('smartschool_token');
const res = await axios.get('http://localhost:5000/api/classes', {
  headers: { Authorization: `Bearer ${token}` }
});

    setClassList(res.data);
  } catch (error: any) {
    console.error('❌ Failed to fetch classes:', error.message);
  }
};

useEffect(() => {
  fetchClasses();
}, []);





  const toggleStudentCompletion = async (homeworkId: string, studentId: string) => {
  if (bulkMode[homeworkId]) {
    toggleStudentSelection(homeworkId, studentId);
    return;
  }

  const hw = homework.find(h => h.id === homeworkId);
  const student = hw?.students.find(s => s.id === studentId);
  const newStatus = student?.completed ? 'incomplete' : 'completed';

  try {
    await axios.put(`http://localhost:5000/api/homework/completion/${homeworkId}/${studentId}`, {
      status: newStatus
    }, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    // Refresh homework
    const updated = await axios.get(`http://localhost:5000/api/homework/class/${selectedClass}?date=${selectedDate}`, {
  headers: { Authorization: `Bearer ${user.token}` }
});

    setHomework(updated.data);
  } catch (error) {
    console.error('❌ Failed to update completion:', error.message);
  }
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

  const filteredHomework = ['teacher', 'admin'].includes(user?.role)
  ? homework.filter(hw => hw.class_id === selectedClass)
  : user?.role === 'parent'
    ? homework.filter(hw => hw.class === 'Class 1')
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
          <p className="text-gray-600 mt-2">Manage daily homework assignments</p>
        </div>
        <RoleGuard allowedRoles={['teacher', 'principal']}>
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
  value={newHomework.class_id}
  onChange={(e) => setNewHomework({ ...newHomework, class_id: e.target.value })}
>
    <option value="">Select Class</option>

  {classList.map(cls => (
    <option key={cls.id} value={cls.id}>{cls.name}</option>
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
  <RoleGuard allowedRoles={['teacher', 'admin', 'principal']}>
    <select 
      value={selectedClass}
      onChange={(e) => setSelectedClass(e.target.value)}
      className="border px-3 py-2 rounded"
    >
      <option value="">Select Class</option>
      {classList.map(cls => (
        <option key={cls.id} value={cls.id}>{cls.name}</option>
      ))}
    </select>
  </RoleGuard>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="border px-3 py-2 rounded"
    max={new Date().toISOString().split('T')[0]}
  />
</div>


      <div className="space-y-4">
        {filteredHomework.map((hw) => (
          <Card key={hw.id} className="border-l-4 border-l-indigo-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{hw.subject}</Badge>
                  <span className="text-sm text-gray-500">{classList.find(c => c.id === hw.class_id)?.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
  {hw.duedate && !isNaN(Date.parse(hw.duedate))
    ? new Date(hw.duedate).toLocaleDateString()
    : 'No Due Date'}
</span>

                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{hw.title}</h4>
                  <p className="text-gray-700 mt-1">{hw.description}</p>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4" />
                  <span>Assigned by {hw.teacherFirstName} {hw.teacherLastName}</span>
                </div>

                {/*<RoleGuard allowedRoles={['teacher', 'principal']}>
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
                              <span className="text-sm">{student.firstName} {student.lastName}</span>
                              <div className="flex items-center space-x-2">
                                {bulkMode[hw.id] && (
                                  <div className={`w-4 h-4 border-2 rounded ${
                                    isSelected 
                                      ? 'bg-indigo-600 border-indigo-600' 
                                      : 'border-gray-300'
                                  }`} />
                                )}
                                <div className={`p-1 rounded ${
                                  student.status === 'completed'
 ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                                }`}>
                                  {student.status === 'completed'
? <CheckSquare className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </RoleGuard>*/}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
