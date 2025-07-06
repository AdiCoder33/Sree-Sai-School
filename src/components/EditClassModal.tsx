import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Edit, User } from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface EditClassModalProps {
  classId: string;
  className: string;
  currentTeacherId?: string;
  onClassUpdated: () => void;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({ 
  classId, 
  className, 
  currentTeacherId, 
  onClassUpdated 
}) => {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(currentTeacherId || '');
  const [newClassName, setNewClassName] = useState(className);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open]);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const teacherUsers = data.filter((user: any) => user.role === 'teacher');
        setTeachers(teacherUsers);
      } else {
        toast.error('Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Error fetching teachers');
    }
  };

  const handleUpdateClass = async () => {
    if (!newClassName.trim()) {
      toast.error('Class name is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newClassName,
          teacher_id: selectedTeacherId || null
        })
      });

      if (response.ok) {
        toast.success('Class updated successfully');
        onClassUpdated();
        setOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Error updating class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Enter class name"
            />
          </div>

          <div>
            <Label htmlFor="teacher">Assign Teacher</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher">
                  {selectedTeacherId && teachers.find(t => t.id === selectedTeacherId) && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>
                        {teachers.find(t => t.id === selectedTeacherId)?.firstName} {' '}
                        {teachers.find(t => t.id === selectedTeacherId)?.lastName}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No teacher assigned</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{teacher.firstName} {teacher.lastName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateClass} disabled={loading}>
              {loading ? 'Updating...' : 'Update Class'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
