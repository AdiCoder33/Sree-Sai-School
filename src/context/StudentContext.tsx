import React, { createContext, useContext, useEffect, useState } from 'react';
import { Student } from '../types/auth';

interface StudentContextType {
  selectedStudent: Student | null;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('smartschool_selected_student');
    if (stored) {
      try {
        setSelectedStudent(JSON.parse(stored));
      } catch {
        setSelectedStudent(null);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      localStorage.setItem('smartschool_selected_student', JSON.stringify(selectedStudent));
    } else {
      localStorage.removeItem('smartschool_selected_student');
    }
  }, [selectedStudent]);

  return (
    <StudentContext.Provider value={{ selectedStudent, setSelectedStudent }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
