
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog } from '../components/ui/dialog';
import { Plus, Clock, Users, BookOpen, Edit2, Trash2, Calendar } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const timeSlots = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const classList = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);
const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Physical Education'];

const mockTeachers = [
  { id: '1', name: 'Ms. Sarah Johnson', assignedClass: 'Class 1' },
  { id: '2', name: 'Mr. John Smith', assignedClass: 'Class 2' },
  { id: '3', name: 'Ms. Emily Brown', assignedClass: 'Class 3' },
  { id: '4', name: 'Mr. David Wilson', assignedClass: 'Class 4' }
];

const mockTimetable = [
  {
    id: '1',
    class: 'Class 1',
    day: 'Monday',
    timeSlot: '09:00 - 10:00',
    subject: 'Mathematics',
    teacher: 'Ms. Sarah Johnson',
    teacherId: '1'
  },
  {
    id: '2',
    class: 'Class 1',
    day: 'Monday',
    timeSlot: '10:00 - 11:00',
    subject: 'English',
    teacher: 'Mr. John Smith',
    teacherId: '2'
  },
  {
    id: '3',
    class: 'Class 2',
    day: 'Monday',
    timeSlot: '09:00 - 10:00',
    subject: 'Science',
    teacher: 'Mr. John Smith',
    teacherId: '2'
  }
];

export const Timetable: React.FC = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(mockTimetable);
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    class: 'Class 1',
    day: 'Monday',
    timeSlot: '09:00 - 10:00',
    subject: 'Mathematics',
    teacherId: '1'
  });

  const handleAddEntry = () => {
    const teacher = mockTeachers.find(t => t.id === newEntry.teacherId);
    const entry = {
      id: Date.now().toString(),
      ...newEntry,
      teacher: teacher?.name || 'Unknown Teacher'
    };
    setTimetable(prev => [...prev, entry]);
    setShowAddForm(false);
    setNewEntry({
      class: 'Class 1',
      day: 'Monday',
      timeSlot: '09:00 - 10:00',
      subject: 'Mathematics',
      teacherId: '1'
    });
    toast({
      title: "Success",
      description: "Schedule added successfully!"
    });
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      class: entry.class,
      day: entry.day,
      timeSlot: entry.timeSlot,
      subject: entry.subject,
      teacherId: entry.teacherId
    });
    setShowAddForm(true);
  };

  const handleUpdateEntry = () => {
    const teacher = mockTeachers.find(t => t.id === newEntry.teacherId);
    const updatedEntry = {
      ...editingEntry,
      ...newEntry,
      teacher: teacher?.name || 'Unknown Teacher'
    };
    
    setTimetable(prev => prev.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    ));
    
    setShowAddForm(false);
    setEditingEntry(null);
    setNewEntry({
      class: 'Class 1',
      day: 'Monday',
      timeSlot: '09:00 - 10:00',
      subject: 'Mathematics',
      teacherId: '1'
    });
    
    toast({
      title: "Success",
      description: "Schedule updated successfully!"
    });
  };

  const handleDeleteEntry = (entryId) => {
    setTimetable(prev => prev.filter(entry => entry.id !== entryId));
    toast({
      title: "Success",
      description: "Schedule deleted successfully!"
    });
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingEntry(null);
    setNewEntry({
      class: 'Class 1',
      day: 'Monday',
      timeSlot: '09:00 - 10:00',
      subject: 'Mathematics',
      teacherId: '1'
    });
  };

  // For teachers, show their assigned class and classes they teach
  const getTeacherTimetable = () => {
    const currentTeacher = mockTeachers.find(t => t.id === user?.id);
    if (!currentTeacher) return [];
    
    return timetable.filter(entry => entry.teacherId === user?.id);
  };

  const filteredTimetable = user?.role === 'teacher' 
    ? getTeacherTimetable()
    : timetable.filter(entry => entry.class === selectedClass);

  const getTimetableGrid = () => {
    const grid = {};
    filteredTimetable.forEach(entry => {
      if (!grid[entry.day]) grid[entry.day] = {};
      grid[entry.day][entry.timeSlot] = entry;
    });
    return grid;
  };

  const timetableGrid = getTimetableGrid();

  // Get teacher's assigned class for display
  const getTeacherAssignedClass = () => {
    const currentTeacher = mockTeachers.find(t => t.id === user?.id);
    return currentTeacher?.assignedClass || 'No Class Assigned';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {user?.role === 'teacher' ? 'My Teaching Schedule' : 'Timetable Management'}
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              {user?.role === 'teacher' 
                ? `Class Teacher: ${getTeacherAssignedClass()} | Teaching Schedule Across Classes` 
                : 'Manage class schedules and teacher assignments'
              }
            </p>
          </div>
          <RoleGuard allowedRoles={['principal']}>
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </RoleGuard>
        </div>

        {showAddForm && (
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold">
                {editingEntry ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
              </CardTitle>
              <CardDescription className="text-indigo-100">
                {editingEntry ? 'Update the class schedule entry' : 'Create a new class schedule entry'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Class</label>
                  <select 
                    value={newEntry.class}
                    onChange={(e) => setNewEntry({...newEntry, class: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  >
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Day</label>
                  <select 
                    value={newEntry.day}
                    onChange={(e) => setNewEntry({...newEntry, day: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Time Slot</label>
                  <select 
                    value={newEntry.timeSlot}
                    onChange={(e) => setNewEntry({...newEntry, timeSlot: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Subject</label>
                  <select 
                    value={newEntry.subject}
                    onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Teacher</label>
                  <select 
                    value={newEntry.teacherId}
                    onChange={(e) => setNewEntry({...newEntry, teacherId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  >
                    {mockTeachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} {teacher.assignedClass && `(Class Teacher: ${teacher.assignedClass})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-8">
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit} 
                  className="w-full sm:w-auto border-2 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingEntry ? handleUpdateEntry : handleAddEntry} 
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg"
                >
                  {editingEntry ? 'Update Schedule' : 'Add Schedule'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <RoleGuard allowedRoles={['principal', 'parent']}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-semibold text-gray-700">Select Class:</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                >
                  {classList.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </RoleGuard>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl font-bold">
              <Calendar className="h-6 w-6" />
              <span>
                Weekly Schedule - {user?.role === 'teacher' 
                  ? `${getTeacherAssignedClass()} & Teaching Classes` 
                  : selectedClass
                }
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-indigo-50">
                    <th className="border-2 border-gray-200 p-4 text-left font-bold text-gray-800 min-w-[120px] bg-white/80">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Time
                    </th>
                    {days.map(day => (
                      <th key={day} className="border-2 border-gray-200 p-4 text-left font-bold text-gray-800 min-w-[200px] bg-white/80">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(slot => (
                    <tr key={slot} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="border-2 border-gray-200 p-4 font-bold bg-gradient-to-r from-gray-50 to-indigo-50 text-gray-800">
                        {slot}
                      </td>
                      {days.map(day => {
                        const entry = timetableGrid[day]?.[slot];
                        return (
                          <td key={`${day}-${slot}`} className="border-2 border-gray-200 p-4 bg-white/50">
                            {entry ? (
                              <div className="space-y-3 relative group">
                                <div className="flex items-center justify-between">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                                  >
                                    {entry.subject}
                                  </Badge>
                                  <RoleGuard allowedRoles={['principal']}>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditEntry(entry)}
                                        className="h-8 w-8 p-0 hover:bg-indigo-100 hover:text-indigo-600 rounded-full"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-full"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </RoleGuard>
                                </div>
                                <div className="bg-white/80 p-3 rounded-lg shadow-sm border border-gray-100">
                                  <p className="text-sm font-semibold text-gray-900 flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-indigo-600" />
                                    {entry.teacher}
                                  </p>
                                  {user?.role !== 'teacher' && (
                                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      {entry.class}
                                    </p>
                                  )}
                                  {user?.role === 'teacher' && entry.class !== getTeacherAssignedClass() && (
                                    <Badge variant="outline" className="mt-2 text-xs border-orange-300 text-orange-700 bg-orange-50">
                                      Visiting Class
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-gray-400 text-sm italic bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                                  Free Period
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
