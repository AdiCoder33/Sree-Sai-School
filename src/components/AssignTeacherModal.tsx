import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { User } from '../types/auth';

export interface AssignTeacherModalProps {
  classId: string;
  currentTeacher?: string;
  onSuccess: () => void;
}

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({ classId, currentTeacher,onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);
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
    const res = await fetch(`${API_BASE}/users?role=teacher`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch teachers");

    const data: User[] = await res.json();
    const onlyTeachers = data.filter(user => user.role === 'teacher');
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
    const res = await fetch(`${API_BASE}/classes/${classId}/assign-teacher`, {
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
        className="ml-1 text-indigo-600 hover:bg-indigo-100 rounded-full shadow-sm"
        onClick={(e) => {
          e.stopPropagation(); // prevent triggering parent onClick
          setOpen(true);
        }}
      >
        <Pencil className="w-4 h-4" />
      </Button>
    </DialogTrigger>

    <DialogContent className="max-w-md rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 shadow-xl border border-indigo-100">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-indigo-700">
          Assign Teacher
        </DialogTitle>
        <p className="text-sm text-gray-500">
          Choose a teacher from the list and allocate them to this class.
        </p>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <select
          className="w-full border border-indigo-200 rounded-3xl p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white shadow-sm"
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
        >
          <option value="">Select a teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher.id}  value={teacher.id}>
              {teacher.firstName} {teacher.lastName} ({teacher.email})
            </option>
          ))}
        </select>

        <Button
          disabled={loading}
          onClick={handleAssign}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-transform hover:scale-[1.02]"
        >
          {loading ? 'Assigning...' : 'Assign Teacher'}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
}