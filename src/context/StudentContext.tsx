import React, { createContext, useContext, useEffect, useState } from 'react';
import { Student } from '../types/auth';
import { useAuth } from './AuthContext';
import { API_BASE, withBaseUrl } from '../lib/api';

interface StudentContextType {
  selectedStudent: Student | null;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  children: Student[];
  setChildren: React.Dispatch<React.SetStateAction<Student[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [childList, setChildList] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem('smartschool_selected_student');
      if (stored) {
        try {
          setSelectedStudent(JSON.parse(stored));
        } catch {
          setSelectedStudent(null);
        }
      } else {
        setSelectedStudent(null);
      }
    } else {
      setSelectedStudent(null);
    }
  }, [user]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user || user.role !== 'parent') {
        setChildList([]);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('smartschool_token');
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/students/parent/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (res.ok) {
          const raw = await res.json();
          const data = Array.isArray(raw)
            ? raw.map((c: Student) => ({ ...c, avatar: withBaseUrl(c.avatar) }))
            : [];
          setChildList(data);
          if (data.length === 1 && !selectedStudent) {
            setSelectedStudent(data[0]);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching children:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      localStorage.setItem('smartschool_selected_student', JSON.stringify(selectedStudent));
    } else {
      localStorage.removeItem('smartschool_selected_student');
    }
  }, [selectedStudent]);

  return (
    <StudentContext.Provider
      value={{ selectedStudent, setSelectedStudent, children: childList, setChildren: setChildList, loading, setLoading }}
    >
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
