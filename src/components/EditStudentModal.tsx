import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { SelectParentModal } from './SelectParentModal';

interface EditStudentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  studentId: string;
  onSuccess?: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ open, setOpen, studentId, onSuccess }) => {
  const [formData, setFormData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      fetchStudent();
      fetchClasses();
    }
  }, [open, studentId]);

  const fetchStudent = async () => {
    const token = localStorage.getItem('smartschool_token');
    const res = await fetch(`http://localhost:5000/api/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setFormData({
      ...data,
      dateOfBirth: data.dateOfBirth?.split('T')[0] || ''
    });
  };

  const fetchClasses = async () => {
    const token = localStorage.getItem('smartschool_token');
    const res = await fetch(`http://localhost:5000/api/classes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setClasses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('smartschool_token');

    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Student updated successfully');
        onSuccess && onSuccess();
        setOpen(false);
      } else {
        toast.error('Failed to update student');
      }
    } catch (err) {
      toast.error('Error updating student');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
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
              <Label>Class</Label>
              <Select value={formData.class_id} onValueChange={(val) => setFormData({ ...formData, class_id: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Input value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
            </div>
            <div>
              <Label>Roll Number</Label>
              <Input value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <Label>Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          <div>
            <Label>Medical Conditions</Label>
            <Textarea value={formData.medicalConditions} onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Parent</Label>
            <Button type="button" variant="secondary" onClick={() => setShowParentModal(true)}>
              {formData.parentFirstName ? `${formData.parentFirstName} ${formData.parentLastName}` : 'Select Parent'}
            </Button>
          </div>

          {showParentModal && (
            <SelectParentModal
              open={showParentModal}
              onClose={() => setShowParentModal(false)}
              onSelect={(parent) => {
                setFormData({
                  ...formData,
                  parent_id: parent.id,
                  parentFirstName: parent.firstName,
                  parentLastName: parent.lastName,
                  parentEmail: parent.email,
                  parentPhone: parent.phone,
                  parentAddress: parent.address || ''
                });
                toast.success(`Parent ${parent.firstName} selected`);
              }}
            />
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Student'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
