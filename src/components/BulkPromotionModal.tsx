import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowUp, Users, AlertTriangle, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Class, Student } from '../types/auth';

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

      const response = await fetch(`${API_BASE}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data.map((cls: Class) => ({
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
      const token = localStorage.getItem('smartschool_token');
      
      // Process each class for promotion
      for (const cls of classes) {
        if (cls.studentCount === 0) continue;
        
        const nextClassName = getNextClassName(cls.name);
        if (!nextClassName) continue;

        // Get all students from current class
        const studentsResponse = await fetch(`${API_BASE}/students/class/${cls.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (studentsResponse.ok) {
          const students = await studentsResponse.json();
          const studentIds = students.map((s: Student) => s.id);

          if (studentIds.length > 0) {
            if (nextClassName === 'Last Year Students') {
              // For Class 10 students, we'll handle them specially
              // First, let's check if there's already a "Last Year Students" class
              const lastYearClass = classes.find(c => c.name === 'Last Year Students');
              let targetClassId;

              if (!lastYearClass) {
                // Create "Last Year Students" class
                const createClassResponse = await fetch(`${API_BASE}/classes`, {
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
                await fetch(`${API_BASE}/students/promote`, {
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
              const nextClass = classes.find(c => c.name === nextClassName);
              let targetClassId;

              if (!nextClass) {
                // Create the next class
                const createClassResponse = await fetch(`${API_BASE}/classes`, {
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
                await fetch(`${API_BASE}/students/promote`, {
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
        const studentsResponse = await fetch(`${API_BASE}/students/class/${lastYearClass.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (studentsResponse.ok) {
          const lastYearStudents = await studentsResponse.json();
          
          // Delete all last year students (they've graduated)
          for (const student of lastYearStudents) {
            await fetch(`${API_BASE}/students/${student.id}`, {
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
      <Button
        variant="outline"
        className="bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:via-indigo-100 hover:to-emerald-100 rounded-xl shadow-sm"
      >
        <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
        Promote All Classes
      </Button>
    </DialogTrigger>

    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-white via-indigo-50 to-emerald-50 border border-indigo-100 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-extrabold text-indigo-700">
          Bulk Class Promotion
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          Promote all students to the next class level. This action will move all students up one grade.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 rounded-3xl">
        {lastYearStudents > 0 && (
          <Card className="rounded-xl border border-orange-200 bg-orange-50/90 shadow-sm">
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
          <h3 className="text-lg font-semibold text-slate-800">Promotion Overview</h3>

          {loading ? (
            <div className="text-center py-6 text-slate-600">Loading classes...</div>
          ) : (
            <div className="grid gap-3">
              {classes
                .filter((cls) => cls.studentCount > 0)
                .sort((a, b) => {
                  const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
                  const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
                  return aNum - bNum;
                })
                .map((cls) => {
                  const nextClassName = getNextClassName(cls.name);
                  return (
                    <Card
                      key={cls.id}
                      className="rounded-xl border border-slate-200/70 bg-white/90 hover:bg-white transition hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-50 ring-1 ring-black/5 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-slate-900">{cls.name}</span>
                              <div className="flex items-center space-x-1 text-gray-600 mt-1">
                                <Users className="h-3.5 w-3.5 text-slate-500" />
                                <span>{cls.studentCount} students</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-sm">
                            <ArrowUp className="h-4 w-4 text-emerald-600" />
                            <span
                              className={`font-medium ${
                                nextClassName ? 'text-emerald-700' : 'text-purple-700'
                              }`}
                            >
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

          <Card className="rounded-xl border border-blue-200 bg-blue-50/90 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Total Students: {totalStudents}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-full bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePromoteAllClasses}
            disabled={promoting || loading || totalStudents === 0}
            className="rounded-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white shadow-md disabled:opacity-60"
          >
            {promoting ? 'Promoting All...' : `Promote All ${totalStudents} Students`}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
} 