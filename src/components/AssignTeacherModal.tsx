import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

export interface AssignTeacherModalProps {
  classId: string;
  currentTeacher?: string;
  onSuccess: () => void;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({ classId, currentTeacher,onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [loading, setLoading] = useState(false);
  

  const token = localStorage.getItem('smartschool_token');
  useEffect(() => {
  if (open) {
    fetchTeachers();
    setSelectedTeacherId(''); // Reset selection on modal open
  }
}, [open]);

useEffect(() => {
  const matched = teachers.find(
    (teacher) =>
      `${teacher.firstName} ${teacher.lastName}`.toLowerCase() === currentTeacher?.toLowerCase()
  );
  if (matched) setSelectedTeacherId(matched.id);
}, [teachers, currentTeacher]);


 useEffect(() => {
  if (open) {
    fetchTeachers();
    setSelectedTeacherId('');
  }
}, [open]);


  const fetchTeachers = async () => {
  if (!token) {
    toast.error('No auth token found');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/users?role=teacher', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch teachers");

    const data = await res.json();
    const onlyTeachers = data.filter((user: any) => user.role === 'teacher');
    setTeachers(onlyTeachers);
  } catch (err) {
    console.error("Failed to fetch teachers:", err);
    toast.error('Failed to load teachers');
  }
};



  const handleAssign = async () => {
  if (!selectedTeacherId) return toast.warning('Please select a teacher');

  setLoading(true);
  try {
    const res = await fetch(`http://localhost:5000/api/classes/${classId}/assign-teacher`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teacherId: selectedTeacherId }),
    });

    if (!res.ok) throw new Error('Assignment failed');

    toast.success('Teacher assigned successfully');
    setOpen(false);
    onSuccess();
  } catch (err) {
    toast.error('Failed to assign teacher');
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
  <Button
    variant="ghost"
    size="icon"
    className="ml-1"
    onClick={(e) => {
      e.stopPropagation(); // prevent triggering parent onClick
      setOpen(true);
    }}
  >
    <Pencil className="w-4 h-4" />
  </Button>
</DialogTrigger>


      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <select
            className="w-full border rounded p-2 text-sm"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} ({teacher.email})
              </option>
            ))}
          </select>

          <Button disabled={loading} onClick={handleAssign} className="w-full">
            {loading ? 'Assigning...' : 'Assign Teacher'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
