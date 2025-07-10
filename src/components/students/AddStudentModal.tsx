
import React, { useState,useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: any; // Pass student object for edit
  mode?: 'add' | 'edit'; // Determines the operation
}


export const AddStudentModal: React.FC<AddStudentModalProps> = ({ open, onOpenChange, student, mode }) => {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    className: 'Form 1A',
    dateOfBirth: '',
    parentName: '',
    parentEmail: ''
  });
   useEffect(() => {
  if (mode === 'edit' && student) {
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      className: student.className || 'Form 1A',
      dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
      parentName: student.parentName || '',
      parentEmail: student.parentEmail || ''
    });
  } else {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      className: 'Form 1A',
      dateOfBirth: '',
      parentName: '',
      parentEmail: ''
    });
  }
}, [student, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const token = localStorage.getItem('smartschool_token');

  if (mode === 'edit' && student?.id) {
    await fetch(`http://localhost:5000/api/students/${student.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
  } else {
    await fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
  }

  onOpenChange(false);
};

 


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Student' : 'Add New Student'}</DialogTitle>
<DialogDescription>
  {mode === 'edit'
    ? 'Update the student’s details below.'
    : 'Enter the student’s information to add them to the system.'}
</DialogDescription>

        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <Select value={formData.className} onValueChange={(value) => setFormData({...formData, className: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Form 1A">Form 1A</SelectItem>
                  <SelectItem value="Form 1B">Form 1B</SelectItem>
                  <SelectItem value="Form 2A">Form 2A</SelectItem>
                  <SelectItem value="Form 2B">Form 2B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Parent Name</label>
              <Input
                value={formData.parentName}
                onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Parent Email</label>
              <Input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
  {mode === 'edit' ? 'Update Student' : 'Add Student'}
</Button>

          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
