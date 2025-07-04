
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BarChart3, TrendingUp, Users, GraduationCap, Calendar, Download } from 'lucide-react';

const mockReports = [
  {
    id: '1',
    title: 'Monthly Attendance Report',
    description: 'Detailed attendance statistics for all students',
    type: 'attendance',
    dateRange: 'January 2024',
    students: 45,
    averageAttendance: '94.5%'
  },
  {
    id: '2',
    title: 'Academic Performance Report',
    description: 'Student performance across all subjects',
    type: 'academic',
    dateRange: 'Q1 2024',
    students: 45,
    averageGrade: 'B+'
  },
  {
    id: '3',
    title: 'Fee Collection Report',
    description: 'Monthly fee collection and pending payments',
    type: 'financial',
    dateRange: 'January 2024',
    collected: '$22,500',
    pending: '$2,500'
  }
];

const attendanceData = [
  { class: 'Grade 4A', present: 28, absent: 2, late: 1, total: 31 },
  { class: 'Grade 5A', present: 25, absent: 3, late: 2, total: 30 },
  { class: 'Grade 6B', present: 22, absent: 1, late: 1, total: 24 }
];

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">85</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-green-600">94.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-blue-600">78</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">7</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class-wise Attendance</CardTitle>
          <CardDescription>Attendance breakdown by class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((classData) => (
              <div key={classData.class} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="font-medium text-gray-900">{classData.class}</div>
                  <Badge variant="secondary">Total: {classData.total}</Badge>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Present: {classData.present}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Absent: {classData.absent}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Late: {classData.late}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {((classData.present / classData.total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive school performance insights</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {mockReports.map((report) => (
          <Card 
            key={report.id} 
            className={`cursor-pointer transition-all ${
              selectedReport === report.type ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedReport(report.type)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Period:</span>
                  <Badge variant="outline">{report.dateRange}</Badge>
                </div>
                {report.students && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Students:</span>
                    <span className="text-sm font-medium">{report.students}</span>
                  </div>
                )}
                {report.averageAttendance && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Attendance:</span>
                    <span className="text-sm font-medium text-green-600">{report.averageAttendance}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
          <CardDescription>
            {selectedReport === 'attendance' && 'Monthly attendance analysis and trends'}
            {selectedReport === 'academic' && 'Academic performance metrics and insights'}
            {selectedReport === 'financial' && 'Fee collection and financial overview'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedReport === 'attendance' && renderAttendanceReport()}
          {selectedReport === 'academic' && (
            <div className="text-center py-12 text-gray-500">
              Academic performance report visualization coming soon...
            </div>
          )}
          {selectedReport === 'financial' && (
            <div className="text-center py-12 text-gray-500">
              Financial report visualization coming soon...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
