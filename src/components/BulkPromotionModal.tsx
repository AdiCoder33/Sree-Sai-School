import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowUp, Users, AlertTriangle, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
  studentCount: number;
}

interface BulkPromotionModalProps {
  onPromotionComplete: () => void;
}

export const BulkPromotionModal: React.FC<BulkPromotionModalProps> = ({ onPromotionComplete }) => {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClasses();
    }
  }, [open]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('smartschool_token');

      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          studentCount: cls.studentCount || 0
        })));
      } else {
        toast.error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Error fetching classes');
    } finally {
      setLoading(false);
    }
  };

  const getNextClassName = (currentName: string): string | null => {
    // Extract class number from name (e.g., "Class 1" -> 1, "Grade 5" -> 5)
    const match = currentName.match(/(\d+)/);
    if (!match) return null;
    
    const currentNumber = parseInt(match[1]);
    if (currentNumber >= 10) return 'Last Year Students'; // Class 10 goes to Last Year
    
    return currentName.replace(/\d+/, (currentNumber + 1).toString());
  };

  const handlePromoteAllClasses = async () => {
    setPromoting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Process each class for promotion
      for (const cls of classes) {
        if (cls.studentCount === 0) continue;
        
        const nextClassName = getNextClassName(cls.name);
        if (!nextClassName) continue;

        // Get all students from current class
        const studentsResponse = await fetch(`/api/students/class/${cls.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (studentsResponse.ok) {
          const students = await studentsResponse.json();
          const studentIds = students.map((s: any) => s.id);

          if (studentIds.length > 0) {
            if (nextClassName === 'Last Year Students') {
              // For Class 10 students, we'll handle them specially
              // First, let's check if there's already a "Last Year Students" class
              let lastYearClass = classes.find(c => c.name === 'Last Year Students');
              let targetClassId;

              if (!lastYearClass) {
                // Create "Last Year Students" class
                const createClassResponse = await fetch('/api/classes', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    name: 'Last Year Students',
                    teacher_id: null
                  })
                });

                if (createClassResponse.ok) {
                  const newClass = await createClassResponse.json();
                  targetClassId = newClass.id;
                }
              } else {
                targetClassId = lastYearClass.id;
              }

              if (targetClassId) {
                // Move Class 10 students to Last Year Students
                await fetch('/api/students/promote', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    studentIds: studentIds,
                    fromClassId: cls.id,
                    toClassId: targetClassId
                  })
                });
              }
            } else {
              // Find or create the next class
              let nextClass = classes.find(c => c.name === nextClassName);
              let targetClassId;

              if (!nextClass) {
                // Create the next class
                const createClassResponse = await fetch('/api/classes', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    name: nextClassName,
                    teacher_id: null
                  })
                });

                if (createClassResponse.ok) {
                  const newClass = await createClassResponse.json();
                  targetClassId = newClass.id;
                }
              } else {
                targetClassId = nextClass.id;
              }

              if (targetClassId) {
                // Move students to next class
                await fetch('/api/students/promote', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    studentIds: studentIds,
                    fromClassId: cls.id,
                    toClassId: targetClassId
                  })
                });
              }
            }
          }
        }
      }

      // Handle Last Year Students (they graduate and are removed)
      const lastYearClass = classes.find(c => c.name === 'Last Year Students');
      if (lastYearClass && lastYearClass.studentCount > 0) {
        const studentsResponse = await fetch(`/api/students/class/${lastYearClass.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (studentsResponse.ok) {
          const lastYearStudents = await studentsResponse.json();
          
          // Delete all last year students (they've graduated)
          for (const student of lastYearStudents) {
            await fetch(`/api/students/${student.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        }
      }

      toast.success('All classes promoted successfully! Last year students have graduated.');
      onPromotionComplete();
      setOpen(false);
    } catch (error) {
      console.error('Error promoting classes:', error);
      toast.error('Error promoting classes');
    } finally {
      setPromoting(false);
    }
  };

  const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
  const lastYearStudents = classes.find(c => c.name === 'Last Year Students')?.studentCount || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
          <GraduationCap className="h-4 w-4 mr-2" />
          Promote All Classes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Class Promotion</DialogTitle>
          <DialogDescription>
            Promote all students to the next class level. This action will move all students up one grade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {lastYearStudents > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-orange-700 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Important Notice</span>
                </div>
                <p className="text-sm text-orange-600">
                  {lastYearStudents} students in "Last Year Students" will be permanently removed from the system as they have graduated.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Promotion Overview</h3>
            
            {loading ? (
              <div className="text-center py-4">Loading classes...</div>
            ) : (
              <div className="grid gap-3">
                {classes
                  .filter(cls => cls.studentCount > 0)
                  .sort((a, b) => {
                    // Sort by class number
                    const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
                    const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
                    return aNum - bNum;
                  })
                  .map((cls) => {
                    const nextClassName = getNextClassName(cls.name);
                    return (
                      <Card key={cls.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-sm">
                                <span className="font-medium">{cls.name}</span>
                                <div className="flex items-center space-x-1 text-gray-600 mt-1">
                                  <Users className="h-3 w-3" />
                                  <span>{cls.studentCount} students</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm">
                              <ArrowUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {nextClassName || 'Graduate'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Total Students: {totalStudents}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePromoteAllClasses} 
              disabled={promoting || loading || totalStudents === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {promoting ? 'Promoting All...' : `Promote All ${totalStudents} Students`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
