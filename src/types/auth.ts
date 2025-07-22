
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'parent';
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  qualification?: string;
  experience?: string;
  subject?: string;
  dateOfJoining?: string;
  emergencyContact?: string;
  childName?: string;
  childClass?: string;
  occupation?: string;
  status?: string;
  created_at?: string;
  token: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  rollNumber: string;
  parentId: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  teacherId: string;
}

export interface LearningLog {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  activity: string;
  notes: string;
  teacherId: string;
}
