
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Send, Users, Filter } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class_id: string;
  className: string;
  parentFirstName: string;
  parentLastName: string;
  parent_id: string;
}

interface TargetedFeeRequestModalProps {
  onSendRequest: (studentIds: string[], feeData: any) => void;
}

export const TargetedFeeRequestModal: React.FC<TargetedFeeRequestModalProps> = ({ onSendRequest }) => {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monthYear: '',
    amount: '',
    dueDate: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(students.map(s => s.className))).filter(Boolean);

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  useEffect(() => {
    let filtered = students.filter(student => {
      const searchMatch = 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.parentFirstName} ${student.parentLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase());
      
      const classMatch = classFilter === 'all' || student.className === classFilter;
      
      return searchMatch && classMatch;
    });
    
    setFilteredStudents(filtered);
  }, [students, searchTerm, classFilter]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
    }
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectByClass = (className: string) => {
    const classStudents = filteredStudents.filter(s => s.className === className);
    const classStudentIds = classStudents.map(s => s.id);
    const allSelected = classStudentIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(id => !classStudentIds.includes(id)));
    } else {
      setSelectedStudents(prev => [...new Set([...prev, ...classStudentIds])]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fees/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          ...formData
        })
      });

      if (response.ok) {
        onSendRequest(selectedStudents, formData);
        toast.success(`Fee request sent to ${selectedStudents.length} parents`);
        setOpen(false);
        setSelectedStudents([]);
        setFormData({
          monthYear: '',
          amount: '',
          dueDate: '',
          description: '',
          priority: 'medium'
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send fee request');
      }
    } catch (error) {
      console.error('Error sending fee request:', error);
      toast.error('Error sending fee request');
    } finally {
      setLoading(false);
    }
  };

  const groupedStudents = uniqueClasses.reduce((acc, className) => {
    acc[className] = filteredStudents.filter(s => s.className === className);
    return acc;
  }, {} as Record<string, Student[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Send className="h-4 w-4 mr-2" />
          Send Targeted Fee Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Send Targeted Fee Request</DialogTitle>
          <DialogDescription>
            Select specific students and send fee requests to their parents
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fee Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Fee Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthYear">Month/Year</Label>
                  <Input
                    id="monthYear"
                    value={formData.monthYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthYear: e.target.value }))}
                    placeholder="e.g., February 2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional fee details..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Select Students</h3>
                  {selectedStudents.length > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {selectedStudents.length} selected
                    </Badge>
                  )}
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Search Students</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by student name, parent name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Filter by Class</Label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {uniqueClasses.map(className => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleSelectAll(selectedStudents.length !== filteredStudents.length)}
                  >
                    {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                {/* Students grouped by class */}
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {Object.entries(groupedStudents).map(([className, classStudents]) => {
                    if (classStudents.length === 0) return null;
                    
                    const classStudentIds = classStudents.map(s => s.id);
                    const allClassSelected = classStudentIds.every(id => selectedStudents.includes(id));
                    const someClassSelected = classStudentIds.some(id => selectedStudents.includes(id));
                    
                    return (
                      <div key={className} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={allClassSelected}
                              onCheckedChange={() => handleSelectByClass(className)}
                            />
                            <h4 className="font-medium text-sm">{className}</h4>
                            <Badge variant="outline" className="text-xs">
                              {classStudents.length} students
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {classStudents.map((student) => (
                            <div key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  Parent: {student.parentFirstName} {student.parentLastName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No students found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedStudents.length === 0}>
              {loading ? 'Sending...' : `Send to ${selectedStudents.length} Parents`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
