
export interface User {
  class_id?: string;
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
  gender?: string;
  class?: string;
  className?: string;
  class_id?: string;
  classId?: string;
  section?: string;
  rollNumber?: string;
  parentId?: string;
  parent_id?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentAddress?: string;
  parentName?: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  avatar?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  status?: string;
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

export interface HomeworkItem {
  id: string;
  class_id?: string;
  subject: string;
  title: string;
  description: string;
  duedate?: string;
  teacherFirstName?: string;
  teacherLastName?: string;
  completed?: boolean;
  teacher?: string;
}

export interface Class {
  id: string;
  name: string;
  teacher_id?: string;
  studentCount?: number;
  teacherFirstName?: string;
  teacherLastName?: string;
  teacherEmail?: string;
  teacherPhone?: string;
}

export interface FeeData {
  monthYear: string;
  amount: string;
  dueDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TimetableEntry {
  id?: string;
  className: string;
  subject: string;
  teacher_id: string;
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: string;
}

export interface Notification {
  id: string;
  type: 'fee_request' | 'announcement' | 'homework' | 'event';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  targetRole?: string;
  createdBy?: string;
}

export interface NotificationAPI extends Omit<Notification, 'createdAt' | 'read'> {
  created_at: string;
  isRead: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_audience: string;
}

export interface AttendanceEntry {
  student_id: string;
  status: 'present' | 'absent' | 'late';
}
