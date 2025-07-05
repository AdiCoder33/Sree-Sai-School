import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { UserPlus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

interface GlobalAllocateStudentModalProps {
  onSuccess: () => void;
}

interface UnassignedStudent {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  gender: string;
  dateOfBirth: string;
  parentFirstName?: string;
  parentLastName?: string;
}

interface Class {
  id: string;
  name: string;
}

export const GlobalAllocateStudentModal: React.FC<GlobalAllocateStudentModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUnassignedStudents();
      fetchClasses();
    }
  }, [open]);

  const fetchUnassignedStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/unassigned', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnassignedStudents(data);
      } else {
        toast.error('Failed to fetch unassigned students');
      }
    } catch (error) {
      console.error('Error fetching unassigned students:', error);
      toast.error('Error fetching unassigned students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        toast.error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Error fetching classes');
    }
  };

  const handleAllocateStudent = async () => {
    if (!selectedStudent || !selectedClass) {
      toast.error('Please select both a student and a class');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/students/${selectedStudent}/allocate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: selectedClass
        })
      });

      if (response.ok) {
        const selectedStudentData = unassignedStudents.find(s => s.id === selectedStudent);
        const selectedClassData = classes.find(c => c.id === selectedClass);
        
        toast.success(`${selectedStudentData?.firstName} ${selectedStudentData?.lastName} allocated to ${selectedClassData?.name}`);
        setOpen(false);
        setSelectedStudent('');
        setSelectedClass('');
        setStudentSearchTerm('');
        setClassSearchTerm('');
        onSuccess();
      } else {
        throw new Error('Failed to allocate student');
      }
    } catch (error) {
      console.error('Error allocating student:', error);
      toast.error('Error allocating student');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = unassignedStudents.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(classSearchTerm.toLowerCase())
  );

  const selectedStudentData = unassignedStudents.find(s => s.id === selectedStudent);
  const selectedClassData = classes.find(c => c.id === selectedClass);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Allocate Student to Class
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Student to Class</DialogTitle>
          <DialogDescription>
            Select an unassigned student and assign them to a class
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-600">Loading students and classes...</div>
          </div>
        ) : unassignedStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Unassigned Students</h3>
            <p className="text-gray-600">All students are already allocated to classes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-3">
              <Label htmlFor="studentSearch">Select Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="studentSearch"
                  placeholder="Search students by name or roll number..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedStudent === student.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Roll: {student.rollNumber}</span>
                          <span>{student.gender}</span>
                          <span>DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        {student.parentFirstName && (
                          <p className="text-sm text-gray-500">
                            Parent: {student.parentFirstName} {student.parentLastName}
                          </p>
                        )}
                      </div>
                      {selectedStudent === student.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Selection */}
            <div className="space-y-3">
              <Label htmlFor="classSearch">Select Class</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="classSearch"
                  placeholder="Search classes..."
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedClass === cls.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedClass(cls.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{cls.name}</h4>
                      {selectedClass === cls.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            {(selectedStudentData || selectedClassData) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Allocation Summary</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Student:</span>{' '}
                    {selectedStudentData ? 
                      `${selectedStudentData.firstName} ${selectedStudentData.lastName} (${selectedStudentData.rollNumber})` : 
                      'Not selected'
                    }
                  </p>
                  <p>
                    <span className="font-medium">Class:</span>{' '}
                    {selectedClassData ? selectedClassData.name : 'Not selected'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAllocateStudent}
                disabled={!selectedStudent || !selectedClass || submitting}
              >
                {submitting ? 'Allocating...' : 'Allocate Student'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
