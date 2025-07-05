import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AllocateStudentsModalProps {
  classId: string;
  className: string;
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

export const AllocateStudentsModal: React.FC<AllocateStudentsModalProps> = ({ 
  classId, 
  className, 
  onSuccess 
}) => {
  const [open, setOpen] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUnassignedStudents();
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

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleAllocateStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      for (const studentId of selectedStudents) {
        const response = await fetch(`/api/students/${studentId}/allocate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            class_id: classId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to allocate student');
        }
      }

      toast.success(`${selectedStudents.length} student(s) allocated to ${className}`);
      setOpen(false);
      setSelectedStudents([]);
      onSuccess();
    } catch (error) {
      console.error('Error allocating students:', error);
      toast.error('Error allocating students');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Allocate Students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Students to {className}</DialogTitle>
          <DialogDescription>
            Select unassigned students to add to this class
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-600">Loading unassigned students...</div>
          </div>
        ) : unassignedStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Unassigned Students</h3>
            <p className="text-gray-600">All students are already allocated to classes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {unassignedStudents.length} unassigned student(s) available
              </p>
              <Badge variant="outline">
                {selectedStudents.length} selected
              </Badge>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {unassignedStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        Roll: {student.rollNumber}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {student.gender}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
                      {student.parentFirstName && (
                        <span className="ml-4">
                          Parent: {student.parentFirstName} {student.parentLastName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAllocateStudents}
                disabled={selectedStudents.length === 0 || submitting}
              >
                {submitting ? 'Allocating...' : `Allocate ${selectedStudents.length} Student(s)`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
