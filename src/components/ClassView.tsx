import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, User, Phone, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { AddStudentModal } from './students/AddStudentModal';

interface ClassViewProps {
  classId: string;
  onBack: () => void;
  onStudentClick: (studentId: string) => void;
}

export const ClassView: React.FC<ClassViewProps> = ({ classId, onBack, onStudentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
const [editStudent, setEditStudent] = useState<any>(null);


  useEffect(() => {
    const token = localStorage.getItem('smartschool_token');

    axios.get(`http://localhost:5000/api/classes/${classId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const teacherName = `${res.data.teacherFirstName} ${res.data.teacherLastName}`;
      setClassData({
        name: res.data.className,
        teacher: teacherName,
        teacherEmail: res.data.teacherEmail,
        teacherPhone: res.data.teacherPhone,
      });
    });

    axios.get(`http://localhost:5000/api/students/class/${classId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const studentsArray = Array.isArray(res.data) ? res.data : [];
      setStudents(studentsArray);
    });
  }, [classId]);

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.includes(searchTerm)
  );

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedStudents);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedStudents(newSet);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('smartschool_token');
    for (const id of selectedStudents) {
      await axios.delete(`http://localhost:5000/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setStudents(prev => prev.filter(s => !selectedStudents.has(s.id)));
    setSelectedStudents(new Set());
    setDeleteMode(false);
  };

  if (!classData) return <p>Loading class details...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
        <Button
          variant="destructive"
          onClick={() => {
            if (deleteMode && selectedStudents.size > 0) {
              if (confirm("Are you sure you want to delete selected students?")) {
                handleDelete();
              }
            } else {
              setDeleteMode(prev => !prev);
              setSelectedStudents(new Set());
            }
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleteMode ? 'Confirm Delete' : 'Delete Students'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Class Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {classData.teacher.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-center text-lg font-semibold">{classData.teacher}</h3>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{classData.teacherEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{classData.teacherPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <CardDescription>Click on a student to view or edit profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <Search className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card
                  key={student.id}
                  onClick={() => {
  if (deleteMode) {
    toggleSelect(student.id);
  } else {
    setEditStudent(student);
    setModalOpen(true);
  }
}}

                  className={`relative cursor-pointer ${selectedStudents.has(student.id) ? 'ring-2 ring-red-400' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="absolute top-2 right-2 space-x-2 flex">
                      <Pencil
                        className="h-4 w-4 text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
  e.stopPropagation();
  setEditStudent(student);
  setModalOpen(true);
}}

                      />
                    </div>
                    <AddStudentModal
  open={modalOpen}
  onOpenChange={(open) => {
    setModalOpen(open);
    if (!open) setEditStudent(null);
  }}
  student={editStudent}
  mode="edit"
/>


                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-gray-600">Roll No: {student.rollNumber}</p>
                        <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
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
    </div>
  );
};
