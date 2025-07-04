
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, User, Phone, MapPin, Calendar } from 'lucide-react';

const mockClassData = {
  '1': {
    name: 'Class 1',
    teacher: 'Ms. Sarah Johnson',
    teacherEmail: 'sarah.johnson@smartschool.com',
    teacherPhone: '+1-555-0101',
    students: [
      { id: '1', firstName: 'Emma', lastName: 'Wilson', rollNumber: '001', dateOfBirth: '2018-03-15', phone: '+1-555-1001', address: '123 Oak St, City', status: 'Active' },
      { id: '2', firstName: 'Liam', lastName: 'Brown', rollNumber: '002', dateOfBirth: '2018-07-22', phone: '+1-555-1002', address: '456 Pine Ave, City', status: 'Active' },
      { id: '3', firstName: 'Olivia', lastName: 'Davis', rollNumber: '003', dateOfBirth: '2018-11-08', phone: '+1-555-1003', address: '789 Elm Rd, City', status: 'Active' },
    ]
  },
  // Add more classes as needed
};

interface ClassViewProps {
  classId: string;
  onBack: () => void;
  onStudentClick: (studentId: string) => void;
}

export const ClassView: React.FC<ClassViewProps> = ({ classId, onBack, onStudentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const classData = mockClassData[classId as keyof typeof mockClassData] || mockClassData['1'];
  
  const filteredStudents = classData.students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
          <p className="text-gray-600 mt-2">Class Teacher: {classData.teacher}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Class Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {classData.teacher.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-semibold">{classData.teacher}</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{classData.teacherEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{classData.teacherPhone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <CardDescription>Click on a student to view their profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card 
                  key={student.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => onStudentClick(student.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
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
