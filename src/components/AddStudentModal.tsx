
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddStudentModalProps {
  onAddStudent: (student: any) => void;
}

interface Class {
  id: string;
  name: string;
  teacher_id?: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onAddStudent }) => {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    classId: '',
    section: 'A',
    rollNumber: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentAddress: '',
    emergencyContact: '',
    bloodGroup: '',
    medicalConditions: ''
  });

  useEffect(() => {
    if (open) {
      fetchClasses();
    }
  }, [open]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        toast.error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Error fetching classes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // First create the parent user
      const parentResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.parentFirstName,
          lastName: formData.parentLastName,
          email: formData.parentEmail,
          role: 'parent',
          phone: formData.parentPhone,
          address: formData.parentAddress
        })
      });

      if (!parentResponse.ok) {
        const error = await parentResponse.json();
        throw new Error(error.error || 'Failed to create parent account');
      }

      const parentData = await parentResponse.json();

      // Then create the student
      const studentResponse = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          class_id: formData.classId,
          section: formData.section,
          rollNumber: formData.rollNumber,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          phone: formData.phone,
          parent_id: parentData.id,
          bloodGroup: formData.bloodGroup,
          medicalConditions: formData.medicalConditions,
          emergencyContact: formData.emergencyContact
        })
      });

      if (studentResponse.ok) {
        const newStudent = await studentResponse.json();
        onAddStudent(newStudent);
        toast.success('Student and parent account created successfully!');
        setOpen(false);
        resetForm();
      } else {
        const error = await studentResponse.json();
        toast.error(error.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error instanceof Error ? error.message : 'Error adding student');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: '',
      classId: '',
      section: 'A',
      rollNumber: '',
      dateOfBirth: '',
      address: '',
      phone: '',
      parentFirstName: '',
      parentLastName: '',
      parentEmail: '',
      parentPhone: '',
      parentAddress: '',
      emergencyContact: '',
      bloodGroup: '',
      medicalConditions: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student and parent details to create a new student record and parent account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Student Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="classId">Select Class *</Label>
                <Select value={formData.classId} onValueChange={(value) => setFormData({...formData, classId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData({...formData, section: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({...formData, bloodGroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Student's full address"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="medicalConditions">Medical Conditions (if any)</Label>
              <Textarea
                id="medicalConditions"
                value={formData.medicalConditions}
                onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                placeholder="Any medical conditions or allergies"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentFirstName">Parent First Name *</Label>
                <Input
                  id="parentFirstName"
                  value={formData.parentFirstName}
                  onChange={(e) => setFormData({...formData, parentFirstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentLastName">Parent Last Name *</Label>
                <Input
                  id="parentLastName"
                  value={formData.parentLastName}
                  onChange={(e) => setFormData({...formData, parentLastName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentEmail">Parent Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                  placeholder="This will be used for login and notifications"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Parent Phone *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="Alternative contact number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="parentAddress">Parent Address</Label>
              <Textarea
                id="parentAddress"
                value={formData.parentAddress}
                onChange={(e) => setFormData({...formData, parentAddress: e.target.value})}
                placeholder="Parent's full address"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Student & Parent Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
