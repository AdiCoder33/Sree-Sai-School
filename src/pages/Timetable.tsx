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
    if ((viewMode === 'class' && selectedClass) || (viewMode === 'teacher' && selectedTeacher)) {
      fetchTimetable();
    }
  }, [selectedClass, selectedTeacher, viewMode]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes', config);
      const classList = Array.isArray(res.data) ? res.data : [];
      setClasses(classList);
      if (!selectedClass && classList.length) {
        setSelectedClass(classList[0].id);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch classes' });
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users?role=teacher', config);
      const onlyTeachers = res.data.filter((u: any) => u.role === 'teacher');
      setTeachers(onlyTeachers);
      if (!selectedTeacher && onlyTeachers.length) {
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
      res.data.forEach((entry: any) => {
        const key = `${entry.startTime.slice(0, 5)}-${entry.endTime.slice(0, 5)}`;
        newGrid[entry.dayOfWeek][key] = {
          id: entry.id,
          subject: entry.subject,
          teacher_id: entry.teacher_id,
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
    const slotKey = `${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)}`;
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
      toast({ title: 'Success', description: 'Saved successfully' });
      fetchTimetable();
      setEditing((prev) => ({ ...prev, [`${day}-${slotKey}`]: false }));
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Save failed' });
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Timetable</h2>

      <div className="flex gap-4 items-center mb-4">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'class' | 'teacher')}
          className="border px-3 py-2 rounded"
        >
          <option value="class">Class-wise View</option>
          <option value="teacher">Teacher-wise View</option>
        </select>

        {viewMode === 'class' && (
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {viewMode === 'teacher' && (
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-center">
          <thead>
            <tr>
              <th className="border p-2">Day</th>
              {timeSlots.map((slot) => (
                <th key={slot.id} className="border p-2">
                  {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {defaultDays.map((day) => (
              <tr key={day}>
                <td className="border p-2 font-semibold">{day}</td>
                {timeSlots.map((slot) => {
                  const slotKey = `${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)}`;
                  const entry = grid[day]?.[slotKey] || { subject: '', teacher_id: '' };
                  const isEditing = editing[`${day}-${slotKey}`];

                  return (
                    <td key={slotKey} className="border p-2">
                      {entry.id && !isEditing ? (
                        <div className="space-y-1">
                          <div className="font-medium">{entry.subject}</div>
                          <div className="text-xs text-gray-600">{getTeacherName(entry.teacher_id)}</div>
                          {user?.role === 'admin' && (
                            <div className="flex justify-center gap-2 mt-1">
                              <Pencil
                                size={16}
                                className="cursor-pointer text-blue-600"
                                onClick={() => setEditing((prev) => ({ ...prev, [`${day}-${slotKey}`]: true }))}
                              />
                              <Trash2
                                size={16}
                                className="cursor-pointer text-red-600"
                                onClick={() => handleDelete(entry.id)}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Input
                            placeholder="Subject"
                            value={entry.subject}
                            onChange={(e) => handleChange(day, slotKey, 'subject', e.target.value)}
                          />
                          <select
                            value={entry.teacher_id}
                            onChange={(e) => handleChange(day, slotKey, 'teacher_id', e.target.value)}
                            className="w-full border px-1 py-1"
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.firstName} {t.lastName}
                              </option>
                            ))}
                          </select>
                          {user?.role === 'admin' && (
                            <Button onClick={() => handleSave(day, slot)} className="w-full">
                              Save
                            </Button>
                          )}
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
