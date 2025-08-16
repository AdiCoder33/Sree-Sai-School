import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { API_BASE } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Search,
  BookOpen,
  User,
  Plus,
  GraduationCap,
} from "lucide-react";
import { ClassView } from "../components/ClassView";
import { StudentProfile } from "../components/StudentProfile";
import { AddStudentModal } from "../components/AddStudentModal";
import { AllocateStudentsModal } from "../components/AllocateStudentsModal";
import { GlobalAllocateStudentModal } from "../components/GlobalAllocateStudentModal";
import { toast } from "sonner";
import { BulkPromotionModal } from "../components/BulkPromotionModal"; // adjust path if needed
import { AssignTeacherModal } from "../components/AssignTeacherModal";
import { Class as ApiClass } from "../types/auth";

interface ClassInfo {
  id: string;
  name: string;
  students: number;
  teacher: string;
  description: string;
}

export const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<
    "classes" | "class-detail" | "student-profile"
  >("classes");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = JSON.parse(localStorage.getItem("smartschool_user") || "{}");
  const role = user.role;

  useEffect(() => {
    fetchClasses();
  }, []);

    const colorSchemes = [
    { from: "from-indigo-50", to: "to-indigo-100", text: "text-indigo-700", icon: "text-indigo-600", badge: "bg-indigo-100 text-indigo-800" },
    { from: "from-emerald-50", to: "to-emerald-100", text: "text-emerald-700", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-800" },
    { from: "from-purple-50", to: "to-purple-100", text: "text-purple-700", icon: "text-purple-600", badge: "bg-purple-100 text-purple-800" },
    { from: "from-pink-50", to: "to-pink-100", text: "text-pink-700", icon: "text-pink-600", badge: "bg-pink-100 text-pink-800" },
  ];
  
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("smartschool_token");
      const response = await fetch(`${API_BASE}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ApiClass[] = await response.json();
        const formattedClasses = data.map((cls: ApiClass) => ({
          id: cls.id,
          name: cls.name,
          students: cls.studentCount || 0,
          teacher:
            cls.teacherFirstName && cls.teacherLastName
              ? `${cls.teacherFirstName} ${cls.teacherLastName}`
              : "No teacher assigned",
          description: `Students enrolled in ${cls.name}`,
        }));
        setClasses(formattedClasses);
      } else {
        toast.error("Failed to fetch classes");
        // Fallback to mock data
        setClasses(
          Array.from({ length: 10 }, (_, i) => ({
            id: (i + 1).toString(),
            name: `Class ${i + 1}`,
            students: 25 + Math.floor(Math.random() * 10),
            teacher: `Teacher ${i + 1}`,
            description: `Students enrolled in Class ${i + 1}`,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Error fetching classes");
      // Fallback to mock data
      setClasses(
        Array.from({ length: 10 }, (_, i) => ({
          id: (i + 1).toString(),
          name: `Class ${i + 1}`,
          students: 25 + Math.floor(Math.random() * 10),
          teacher: `Teacher ${i + 1}`,
          description: `Students enrolled in Class ${i + 1}`,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassClick = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView("class-detail");
  };

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView("student-profile");
  };

  const handleBackToClasses = () => {
    setCurrentView("classes");
    setSelectedClassId("");
  };

  const handleBackToClass = () => {
    setCurrentView("class-detail");
    setSelectedStudentId("");
  };
  const handleAddStudent = () => {
    fetchClasses(); // Refresh class data
  };

  const handleAllocateSuccess = () => {
    // Refresh classes to update student count
    fetchClasses();
  };

  if (currentView === "student-profile") {
    return (
      <div className="p-4 md:p-6">
        <StudentProfile
          studentId={selectedStudentId}
          onBack={handleBackToClass}
        />
      </div>
    );
  }

  if (currentView === "class-detail") {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage class information and student records
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {role === "admin" && (
            <>
              <AddStudentModal onAddStudent={handleAddStudent} />
              <BulkPromotionModal onPromotionComplete={() => setRefreshKey((p) => p + 1)} />
            </>
          )}
        </div>
      </div>

      {/* Search */}
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

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredClasses
          .sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
            const numB = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
            return numA - numB;
          })
          .map((classData, idx) => {
            const scheme = colorSchemes[idx % colorSchemes.length];
            return (
              <Card
                key={classData.id}
                onClick={() => handleClassClick(classData.id)}
                className={`cursor-pointer hover:shadow-xl transition-all duration-300 border rounded-xl 
                            bg-gradient-to-br ${scheme.from} ${scheme.to} hover:opacity-95`}
              >
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg md:text-xl flex items-center space-x-2 ${scheme.text}`}>
                      <BookOpen className={`h-5 w-5 ${scheme.icon}`} />
                      <span>{classData.name}</span>
                    </CardTitle>
                    <Badge className={`text-xs ${scheme.badge}`}>
                      {classData.students} students
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    {classData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="flex items-center space-x-2 text-sm mb-4">
                    <User className={`h-4 w-4 ${scheme.icon}`} />
                    <span className={`${scheme.text}`}>{classData.teacher}</span>
                    {role === "admin" && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <AssignTeacherModal
                          classId={classData.id}
                          currentTeacher={classData.teacher}
                          onSuccess={fetchClasses}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className={`h-4 w-4 ${scheme.icon}`} />
                    <span className={`text-sm ${scheme.text}`}>
                      {classData.students} students
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
          <Users className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-indigo-900 mb-2">No classes found</h3>
          <p className="text-indigo-600">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};