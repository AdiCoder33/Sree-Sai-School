// Timetable.tsx (Final Version with Colored Subject Tags)
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface CellEntry {
  id?: string;
  subject: string;
  teacher_id: string;
  className?: string;
}

const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Timetable: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');

  const [timeSlots] = useState<TimeSlot[]>([
    { id: 'slot1', startTime: '09:00', endTime: '10:00' },
    { id: 'slot2', startTime: '10:00', endTime: '11:00' },
    { id: 'slot3', startTime: '11:00', endTime: '12:00' },
    { id: 'slot4', startTime: '13:00', endTime: '14:00' },
    { id: 'slot5', startTime: '14:00', endTime: '15:00' },
    { id: 'slot6', startTime: '15:00', endTime: '16:00' },
    { id: 'slot7', startTime: '16:00', endTime: '17:00' },
  ]);

  const [grid, setGrid] = useState<Record<string, Record<string, CellEntry>>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  const token = localStorage.getItem('smartschool_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (user?.role === 'teacher') {
      setViewMode('teacher');
      setSelectedTeacher(user.id);
    } else if (user?.role === 'parent' && user.class_id) {
      setViewMode('class');
      setSelectedClass(user.class_id);
    }
  }, [user]);

  useEffect(() => {
    if ((viewMode === 'class' && selectedClass) || (viewMode === 'teacher' && selectedTeacher)) {
      fetchTimetable();
    }
  }, [selectedClass, selectedTeacher, viewMode]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes', config);
      const classList = Array.isArray(res.data) ? res.data : [];
      setClasses(classList);
      if (!selectedClass && classList.length && user?.role !== 'parent') {
        setSelectedClass(classList[0].id);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch classes' });
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users?role=teacher', config);
      const onlyTeachers = res.data.filter((u: any) => u.role?.toLowerCase() === 'teacher');
      setTeachers(onlyTeachers);
      if (!selectedTeacher && onlyTeachers.length && user?.role !== 'teacher') {
        setSelectedTeacher(onlyTeachers[0].id);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch teachers' });
    }
  };

  const fetchTimetable = async () => {
    try {
      const endpoint =
        viewMode === 'class'
          ? `/timetable/class/${selectedClass}`
          : `/timetable/teacher/${selectedTeacher}`;

      const res = await api.get(endpoint, config);
      const newGrid: Record<string, Record<string, CellEntry>> = {};
      defaultDays.forEach((day) => (newGrid[day] = {}));

      const formatSlotTime = (time: string) => {
        if (time.includes('T')) return time.slice(11, 16);
        const [hour, minute] = time.split(':');
        return `${hour?.padStart(2, '0')}:${minute?.padStart(2, '0')}`;
      };

      res.data.forEach((entry: any) => {
        const day = entry.dayOfWeek.charAt(0).toUpperCase() + entry.dayOfWeek.slice(1).toLowerCase();
        const startTime = formatSlotTime(entry.startTime);
        const endTime = formatSlotTime(entry.endTime);
        const key = `${startTime}-${endTime}`;
        if (!newGrid[day]) newGrid[day] = {};
        newGrid[day][key] = {
          id: entry.id,
          subject: entry.subject,
          teacher_id: entry.teacher_id,
          className: entry.className,
        };
      });

      setGrid(newGrid);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch timetable' });
    }
  };

  const handleChange = (day: string, slotKey: string, field: 'subject' | 'teacher_id', value: string) => {
    setGrid((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotKey]: {
          ...(prev[day]?.[slotKey] || { subject: '', teacher_id: '' }),
          [field]: value,
        },
      },
    }));
  };

 const handleSave = async (day: string, slot: TimeSlot) => {
  const slotKey = `${slot.startTime}-${slot.endTime}`;
  const cell = grid[day]?.[slotKey];
  if (!cell || !cell.subject || !cell.teacher_id) {
    toast({ title: 'Error', description: 'Please fill subject and select teacher.' });
    return;
  }

  const payload = {
    class_id: selectedClass,
    dayOfWeek: day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    subject: cell.subject,
    teacher_id: cell.teacher_id,
  };

  try {
    if (cell.id) {
      await api.put(`/timetable/${cell.id}`, payload, config);
    } else {
      await api.post('/timetable', payload, config);
    }

    toast({
      title: 'Success',
      description: 'Timetable saved successfully',
      variant: 'default',
    });

    fetchTimetable();
    setEditing((prev) => ({ ...prev, [`${day}-${slotKey}`]: false }));
  } catch (error: any) {
    const message =
      error?.response?.status === 409
        ? error.response.data?.message || 'Conflict error.'
        : 'Something went wrong. Please try again.';

   toast({
  title: error?.response?.status === 409 ? 'Conflict Detected' : 'Error',
  description: message,
  variant: 'destructive',
});

    console.error('Save Error:', error);

  }
};

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/timetable/${id}`, config);
      toast({ title: 'Success', description: 'Deleted successfully' });
      fetchTimetable();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete entry' });

    }
  };
  

  const getTeacherName = (id: string) => {
    const t = teachers.find((x) => x.id === id);
    return t ? `${t.firstName} ${t.lastName}` : '';
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      english: 'bg-blue-100 text-blue-700',
      maths: 'bg-green-100 text-green-700',
      biology: 'bg-purple-100 text-purple-700',
      chemistry: 'bg-pink-100 text-pink-700',
      physics: 'bg-yellow-100 text-yellow-800',
      history: 'bg-orange-100 text-orange-700',
      geography: 'bg-indigo-100 text-indigo-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return colors[subject.toLowerCase()] || colors['default'];
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Timetable</h2>

      {user?.role === 'admin' && (
        <div className="flex gap-4 items-center mb-4">
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'class' | 'teacher')} className="border px-3 py-2 rounded">
            <option value="class">Class-wise View</option>
            <option value="teacher">Teacher-wise View</option>
          </select>

          {viewMode === 'class' && (
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border px-3 py-2 rounded">
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {viewMode === 'teacher' && (
            <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="border px-3 py-2 rounded">
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-center">
          <thead>
            <tr>
              <th className="border p-2">Day</th>
              {timeSlots.map((slot) => (
                <th key={slot.id} className="border p-2">{slot.startTime}–{slot.endTime}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {defaultDays.map((day) => (
              <tr key={day}>
                <td className="border p-2 font-semibold">{day}</td>
                {timeSlots.map((slot) => {
                  const slotKey = `${slot.startTime}-${slot.endTime}`;
                  const entry = grid[day]?.[slotKey] || { subject: '', teacher_id: '' };
                  const isEditing = editing[`${day}-${slotKey}`];

                  return (
                    <td key={slotKey} className="border p-2">
                      {!isEditing ? (
                        <div className="space-y-1">
                          {entry.subject && entry.teacher_id ? (
                            <>
                              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSubjectColor(entry.subject)}`}>
                                {entry.subject}
                              </div>
                              <div className="text-xs text-gray-600">{getTeacherName(entry.teacher_id)}</div>
                              {viewMode === 'teacher' && entry.className && (
                                <div className="text-xs italic text-gray-400">Class: {entry.className}</div>
                              )}

                              {user?.role === 'admin' && (
                                <div className="flex justify-center gap-2 mt-1">
                                  <Pencil size={16} className="cursor-pointer text-blue-600" onClick={() => setEditing((prev) => ({ ...prev, [`${day}-${slotKey}`]: true }))} />
                                  <Trash2 size={16} className="cursor-pointer text-red-600" onClick={() => handleDelete(entry.id)} />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400 italic text-sm">
                              No entry
                              {user?.role === 'admin' && (
                                <div className="flex justify-center mt-1">
                                  <Pencil size={16} className="cursor-pointer text-blue-600" onClick={() => setEditing((prev) => ({ ...prev, [`${day}-${slotKey}`]: true }))} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Input placeholder="Subject" value={entry.subject} onChange={(e) => handleChange(day, slotKey, 'subject', e.target.value)} />
                          <select value={entry.teacher_id} onChange={(e) => handleChange(day, slotKey, 'teacher_id', e.target.value)} className="w-full border px-1 py-1">
                            <option value="">Select Teacher</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                          </select>
                          <Button onClick={() => handleSave(day, slot)} className="w-full">Save</Button>
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
    </div>
  );
};

export default Timetable;
