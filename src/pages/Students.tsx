
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Users, Search, BookOpen, User, Plus } from 'lucide-react';
import { ClassView } from '../components/ClassView';
import { StudentProfile } from '../components/StudentProfile';
import { AddStudentModal } from '../components/AddStudentModal';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
  students: number;
  teacher: string;
  description: string;
}

export const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'classes' | 'class-detail' | 'student-profile'>('classes');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

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
        const formattedClasses = data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          students: cls.studentCount || 0,
          teacher: cls.teacherFirstName && cls.teacherLastName 
            ? `${cls.teacherFirstName} ${cls.teacherLastName}` 
            : 'No teacher assigned',
          description: `Students enrolled in ${cls.name}`
        }));
        setClasses(formattedClasses);
      } else {
        toast.error('Failed to fetch classes');
        // Fallback to mock data
        setClasses(Array.from({ length: 10 }, (_, i) => ({
          id: (i + 1).toString(),
          name: `Class ${i + 1}`,
          students: 25 + Math.floor(Math.random() * 10),
          teacher: `Teacher ${i + 1}`,
          description: `Students enrolled in Class ${i + 1}`
        })));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Error fetching classes');
      // Fallback to mock data
      setClasses(Array.from({ length: 10 }, (_, i) => ({
        id: (i + 1).toString(),
        name: `Class ${i + 1}`,
        students: 25 + Math.floor(Math.random() * 10),
        teacher: `Teacher ${i + 1}`,
        description: `Students enrolled in Class ${i + 1}`
      })));
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassClick = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView('class-detail');
  };

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-profile');
  };

  const handleBackToClasses = () => {
    setCurrentView('classes');
    setSelectedClassId('');
  };

  const handleBackToClass = () => {
    setCurrentView('class-detail');
    setSelectedStudentId('');
  };

  const handleAddStudent = (student: any) => {
    // Refresh classes to update student count
    fetchClasses();
  };

  if (currentView === 'student-profile') {
    return (
      <div className="p-4 md:p-6">
        <StudentProfile 
          studentId={selectedStudentId} 
          onBack={handleBackToClass}
        />
      </div>
    );
  }

  if (currentView === 'class-detail') {
    return (
      <div className="p-4 md:p-6">
        <ClassView 
          classId={selectedClassId} 
          onBack={handleBackToClasses}
          onStudentClick={handleStudentClick}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-600">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage class information and student records
          </p>
        </div>

        <AddStudentModal onAddStudent={handleAddStudent} />
      </div>

      <div className="flex items-center space-x-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search classes or teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredClasses.map((classData) => (
          <Card 
            key={classData.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-indigo-200"
            onClick={() => handleClassClick(classData.id)}
          >
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <span>{classData.name}</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {classData.students} students
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {classData.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{classData.teacher}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{classData.students} students</span>
                </div>
                <Button size="sm" variant="outline">
                  View Class
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};
