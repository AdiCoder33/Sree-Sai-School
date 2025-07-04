
# School Management System Backend

A Node.js backend API for the School Management System built with Express.js and MySQL.

## Features

- User authentication (JWT)
- Role-based access control (Admin, Teacher, Parent)
- Student management
- Attendance tracking with bulk operations
- Homework management with completion status
- Timetable management
- Event management  
- Class management

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   - Create a MySQL database named `school_management`
   - Run the schema file to create tables:
   ```bash
   mysql -u root -p school_management < migrations/schema.sql
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret

4. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Students
- `GET /api/students` - Get all students
- `GET /api/students/class/:classId` - Get students by class
- `POST /api/students` - Create student (Admin only)

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)

### Attendance
- `GET /api/attendance/:date/:classId` - Get attendance by date and class
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Bulk mark attendance

### Homework
- `GET /api/homework/class/:classId` - Get homework by class
- `POST /api/homework` - Create homework
- `PUT /api/homework/completion/:homeworkId/:studentId` - Update completion status
- `PUT /api/homework/completion/bulk` - Bulk update completion status

### Timetable
- `GET /api/timetable/class/:classId` - Get timetable by class
- `GET /api/timetable/teacher/:teacherId` - Get timetable by teacher
- `POST /api/timetable` - Create timetable entry (Admin only)
- `DELETE /api/timetable/:id` - Delete timetable entry (Admin only)

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

## Default Login

- **Email:** admin@school.com
- **Password:** password

## Database Schema

The database includes the following main tables:
- `users` - System users (admin, teachers, parents)
- `students` - Student information
- `classes` - Class information
- `attendance` - Daily attendance records
- `homework` - Homework assignments
- `homework_completion` - Student homework completion status
- `timetable` - Class schedules
- `events` - School events
- `learning_logs` - Daily learning activities

## Security Features

- JWT token authentication
- Role-based access control
- Password hashing with bcrypt
- SQL injection protection with parameterized queries
- CORS enabled for cross-origin requests
