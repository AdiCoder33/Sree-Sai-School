
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ArrowUp, Users, Search } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  class_id: string;
}

interface StudentPromotionModalProps {
  onPromoteStudents: (studentIds: string[], fromClass: string, toClass: string) => void;
}

const classes = [
  { id: '1', name: 'Class 1' },
  { id: '2', name: 'Class 2' },
  { id: '3', name: 'Class 3' },
  { id: '4', name: 'Class 4' },
  { id: '5', name: 'Class 5' },
  { id: '6', name: 'Class 6' },
  { id: '7', name: 'Class 7' },
  { id: '8', name: 'Class 8' },
  { id: '9', name: 'Class 9' },
  { id: '10', name: 'Class 10' }
];

export const StudentPromotionModal: React.FC<StudentPromotionModalProps> = ({ onPromoteStudents }) => {
  const [open, setOpen] = useState(false);
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (classId: string) => {
    if (!classId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
    }
  };

  useEffect(() => {
    if (fromClass) {
      fetchStudents(fromClass);
      setSelectedStudents([]);
    }
  }, [fromClass]);

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handlePromote = async () => {
    if (!fromClass || !toClass) {
      toast.error('Please select both classes');
      return;
    }

    if (fromClass === toClass) {
      toast.error('Cannot promote to the same class');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          fromClassId: fromClass,
          toClassId: toClass
        })
      });

      if (response.ok) {
        onPromoteStudents(selectedStudents, fromClass, toClass);
        toast.success(`Successfully promoted ${selectedStudents.length} students`);
        setOpen(false);
        setFromClass('');
        setToClass('');
        setSelectedStudents([]);
        setStudents([]);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to promote students');
      }
    } catch (error) {
      console.error('Error promoting students:', error);
      toast.error('Error promoting students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          <ArrowUp className="h-4 w-4 mr-2" />
          Promote Students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promote Students</DialogTitle>
          <DialogDescription>
            Select students to promote from one class to another
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromClass">From Class</Label>
              <Select value={fromClass} onValueChange={setFromClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="toClass">To Class</Label>
              <Select value={toClass} onValueChange={setToClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {students.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Students to Promote</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selectAll"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="selectAll">Select All</Label>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students by name or roll number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                        <Checkbox
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-600">Roll No: {student.rollNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedStudents.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Users className="h-4 w-4" />
                        <span>{selectedStudents.length} students selected for promotion</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePromote} disabled={loading || selectedStudents.length === 0}>
              {loading ? 'Promoting...' : `Promote ${selectedStudents.length} Students`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
