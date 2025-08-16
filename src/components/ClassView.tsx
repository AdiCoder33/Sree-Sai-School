import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, User, Phone, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { EditStudentModal } from './EditStudentModal';
import type { Class, Student } from '../types/auth';

interface ClassViewProps {
  classId: string;
  onBack: () => void;
  onStudentClick: (studentId: string) => void;
}

export const ClassView: React.FC<ClassViewProps> = ({ classId, onBack, onStudentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('smartschool_user') || '{}');
  const role = user?.role;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('smartschool_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [classRes, studentsRes] = await Promise.all([
          axios.get(`${API_BASE}/classes/${classId}`, { headers }),
          axios.get(`${API_BASE}/students/class/${classId}`, { headers }),
        ]);

        const tFirst = classRes.data.teacherFirstName ?? '';
        const tLast = classRes.data.teacherLastName ?? '';
        const teacherName = `${tFirst} ${tLast}`.trim();

        setClassData({
          name: classRes.data.className,
          teacher: teacherName || classRes.data.teacher || '—',
          teacherEmail: classRes.data.teacherEmail ?? '—',
          teacherPhone: classRes.data.teacherPhone ?? '—',
        } as Class);

        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      } catch (e) {
        console.error('Failed to load class view:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.includes(searchTerm)
  );

  // Pastel palettes
  const CARD_PASTELS = [
    'from-indigo-50 to-blue-50 border-indigo-100',
    'from-rose-50 to-orange-50 border-rose-100',
    'from-emerald-50 to-teal-50 border-emerald-100',
    'from-violet-50 to-fuchsia-50 border-violet-100',
    'from-amber-50 to-yellow-50 border-amber-100',
  ];
  const AVATAR_PASTELS = [
    'from-blue-400 to-indigo-400',
    'from-pink-400 to-orange-400',
    'from-teal-400 to-emerald-400',
    'from-fuchsia-400 to-violet-400',
    'from-yellow-400 to-amber-400',
  ];
  const cardTone = (i: number) => CARD_PASTELS[i % CARD_PASTELS.length];
  const avatarTone = (i: number) => AVATAR_PASTELS[i % AVATAR_PASTELS.length];

  const toggleSelect = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('smartschool_token');
      const headers = { Authorization: `Bearer ${token}` };
      for (const id of selectedStudents) {
        // eslint-disable-next-line no-await-in-loop
        await axios.delete(`${API_BASE}/students/${id}`, { headers });
      }
      setStudents((prev) => prev.filter((s) => !selectedStudents.has(s.id)));
      setSelectedStudents(new Set());
      setDeleteMode(false);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  if (loading) return <p>Loading class details...</p>;
  if (!classData) return <p>Class not found.</p>;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          {classData.name}
        </h1>

        {role === 'admin' && (
          <Button
            variant="destructive"
            className={`transition-all duration-300 ${
              deleteMode
                ? 'bg-red-600 hover:bg-red-700 shadow-lg'
                : 'bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600'
            }`}
            onClick={() => {
              if (deleteMode && selectedStudents.size > 0) {
                if (confirm('Are you sure you want to delete selected students?')) {
                  handleDelete();
                }
              } else {
                setDeleteMode((prev) => !prev);
                setSelectedStudents(new Set());
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMode ? 'Confirm Delete' : 'Delete Students'}
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Teacher Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-md hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-indigo-800">Class Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {classData.teacher.split(' ').map((n) => n[0]).join('')}
              </div>
              <h3 className="text-center text-lg font-semibold text-gray-900">
                {classData.teacher}
              </h3>
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4 text-indigo-500" />
                <span>{classData.teacherEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Phone className="h-4 w-4 text-green-500" />
                <span>{classData.teacherPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="lg:col-span-3 bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="text-blue-800">
              Students ({filteredStudents.length})
            </CardTitle>
            <CardDescription className="text-gray-600">
              Click on a student to view or edit profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="flex items-center mb-6 bg-white rounded-lg shadow-sm px-3 py-2 border border-gray-200">
              <Search className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((student, idx) => (
                <Card
                  key={student.id}
                  onClick={() => {
                    if (deleteMode) {
                      toggleSelect(student.id);
                    } else {
                      onStudentClick(student.id);
                    }
                  }}
                  className={[
                    'relative cursor-pointer border bg-gradient-to-br transition-all duration-300',
                    'hover:shadow-md hover:scale-[1.02]',
                    selectedStudents.has(student.id)
                      ? 'ring-2 ring-red-400'
                      : 'hover:border-indigo-300',
                    cardTone(idx),
                  ].join(' ')}
                >
                  <CardContent className="p-4">
                    {/* Edit Icon */}
                    <div className="absolute top-2 right-2 space-x-2 flex">
                      {role === 'admin' && (
                        <Pencil
                          className="h-4 w-4 text-indigo-600 hover:text-indigo-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                            setEditOpen(true);
                          }}
                        />
                      )}
                    </div>

                    {/* Avatar + Info */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={[
                          'w-12 h-12 rounded-full flex items-center justify-center',
                          'text-white font-bold shadow-sm bg-gradient-to-r',
                          avatarTone(idx),
                        ].join(' ')}
                      >
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Roll No: {student.rollNumber}
                        </p>
                        <Badge
                          variant={student.status === 'Active' ? 'default' : 'secondary'}
                          className={
                            student.status === 'Active'
                              ? 'text-xs bg-green-100 text-green-700'
                              : 'text-xs bg-gray-200 text-gray-700'
                          }
                        >
                          {student.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {selectedStudent && (
        <EditStudentModal
          open={editOpen}
          setOpen={setEditOpen}
          studentId={selectedStudent.id}
          onSuccess={() => {
            setEditOpen(false);
            const token = localStorage.getItem('smartschool_token');
            axios
              .get(`${API_BASE}/students/class/${classId}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((res) => {
                const studentsArray = Array.isArray(res.data) ? res.data : [];
                setStudents(studentsArray);
              });
          }}
        />
      )}
    </div>
  );
};
