import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddParentWithStudentModalProps {
  onSuccess: () => void;
}

interface Class {
  id: string;
  name: string;
}

export const AddParentWithStudentModal: React.FC<AddParentWithStudentModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Parent details - Enhanced
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPassword: '',
    parentPhone: '',
    parentAlternatePhone: '',
    parentAddress: '',
    parentOccupation: '',
    parentQualification: '',
    parentWorkplace: '',
    parentAnnualIncome: '',
    emergencyContact: '',
    emergencyContactRelation: '',
    parentNationality: '',
    parentReligion: '',
    parentMaritalStatus: '',
    
    // Student details - Enhanced
    studentFirstName: '',
    studentLastName: '',
    studentGender: '',
    studentClassId: '',
    studentSection: 'A',
    studentRollNumber: '',
    studentDateOfBirth: '',
    studentAddress: '',
    studentPhone: '',
    studentBloodGroup: '',
    studentMedicalConditions: '',
    studentAllergies: '',
    studentHeight: '',
    studentWeight: '',
    studentPreviousSchool: '',
    studentTransferCertificate: '',
    studentNationality: '',
    studentReligion: '',
    studentMotherTongue: '',
    studentTransportMode: '',
    studentSpecialNeeds: '',
    studentHobbies: '',
    studentEmergencyMedicalInfo: ''
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
      
      // First create the parent user with enhanced details
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
          password: formData.parentPassword,
          role: 'parent',
          phone: formData.parentPhone,
          address: formData.parentAddress,
          occupation: formData.parentOccupation,
          emergencyContact: formData.emergencyContact,
          qualification: formData.parentQualification,
          // Additional parent details
          alternatePhone: formData.parentAlternatePhone,
          workplace: formData.parentWorkplace,
          annualIncome: formData.parentAnnualIncome,
          emergencyContactRelation: formData.emergencyContactRelation,
          nationality: formData.parentNationality,
          religion: formData.parentReligion,
          maritalStatus: formData.parentMaritalStatus
        })
      });

      if (!parentResponse.ok) {
        const error = await parentResponse.json();
        throw new Error(error.error || 'Failed to create parent account');
      }

      const parentData = await parentResponse.json();

      // Then create the student with comprehensive details
      const studentResponse = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.studentFirstName,
          lastName: formData.studentLastName,
          gender: formData.studentGender,
          class_id: formData.studentClassId,
          section: formData.studentSection,
          rollNumber: formData.studentRollNumber,
          dateOfBirth: formData.studentDateOfBirth,
          address: formData.studentAddress,
          phone: formData.studentPhone,
          parent_id: parentData.id,
          bloodGroup: formData.studentBloodGroup,
          medicalConditions: formData.studentMedicalConditions,
          // Additional comprehensive student details
          allergies: formData.studentAllergies,
          height: formData.studentHeight,
          weight: formData.studentWeight,
          previousSchool: formData.studentPreviousSchool,
          transferCertificate: formData.studentTransferCertificate,
          nationality: formData.studentNationality,
          religion: formData.studentReligion,
          motherTongue: formData.studentMotherTongue,
          transportMode: formData.studentTransportMode,
          specialNeeds: formData.studentSpecialNeeds,
          hobbies: formData.studentHobbies,
          emergencyMedicalInfo: formData.studentEmergencyMedicalInfo
        })
      });

      if (studentResponse.ok) {
        toast.success('Parent and student created successfully!');
        setOpen(false);
        resetForm();
        onSuccess();
      } else {
        const error = await studentResponse.json();
        toast.error(error.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating parent and student:', error);
      toast.error(error instanceof Error ? error.message : 'Error creating parent and student');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      parentFirstName: '',
      parentLastName: '',
      parentEmail: '',
      parentPassword: '',
      parentPhone: '',
      parentAlternatePhone: '',
      parentAddress: '',
      parentOccupation: '',
      parentQualification: '',
      parentWorkplace: '',
      parentAnnualIncome: '',
      emergencyContact: '',
      emergencyContactRelation: '',
      parentNationality: '',
      parentReligion: '',
      parentMaritalStatus: '',
      studentFirstName: '',
      studentLastName: '',
      studentGender: '',
      studentClassId: '',
      studentSection: 'A',
      studentRollNumber: '',
      studentDateOfBirth: '',
      studentAddress: '',
      studentPhone: '',
      studentBloodGroup: '',
      studentMedicalConditions: '',
      studentAllergies: '',
      studentHeight: '',
      studentWeight: '',
      studentPreviousSchool: '',
      studentTransferCertificate: '',
      studentNationality: '',
      studentReligion: '',
      studentMotherTongue: '',
      studentTransportMode: '',
      studentSpecialNeeds: '',
      studentHobbies: '',
      studentEmergencyMedicalInfo: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Parent & Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Parent & Student - Comprehensive Details</DialogTitle>
          <DialogDescription>
            Create a parent account along with their child's complete student record
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Parent Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="parentFirstName">First Name *</Label>
                <Input
                  id="parentFirstName"
                  value={formData.parentFirstName}
                  onChange={(e) => setFormData({...formData, parentFirstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentLastName">Last Name *</Label>
                <Input
                  id="parentLastName"
                  value={formData.parentLastName}
                  onChange={(e) => setFormData({...formData, parentLastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="parentPassword">Password *</Label>
                <Input
                  id="parentPassword"
                  type="password"
                  value={formData.parentPassword}
                  onChange={(e) => setFormData({...formData, parentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Primary Phone *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentAlternatePhone">Alternate Phone</Label>
                <Input
                  id="parentAlternatePhone"
                  value={formData.parentAlternatePhone}
                  onChange={(e) => setFormData({...formData, parentAlternatePhone: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="parentOccupation">Occupation</Label>
                <Input
                  id="parentOccupation"
                  value={formData.parentOccupation}
                  onChange={(e) => setFormData({...formData, parentOccupation: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="parentQualification">Qualification</Label>
                <Input
                  id="parentQualification"
                  value={formData.parentQualification}
                  onChange={(e) => setFormData({...formData, parentQualification: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="parentWorkplace">Workplace</Label>
                <Input
                  id="parentWorkplace"
                  value={formData.parentWorkplace}
                  onChange={(e) => setFormData({...formData, parentWorkplace: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="parentAnnualIncome">Annual Income</Label>
                <Input
                  id="parentAnnualIncome"
                  value={formData.parentAnnualIncome}
                  onChange={(e) => setFormData({...formData, parentAnnualIncome: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="parentNationality">Nationality</Label>
                <Input
                  id="parentNationality"
                  value={formData.parentNationality}
                  onChange={(e) => setFormData({...formData, parentNationality: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="parentReligion">Religion</Label>
                <Input
                  id="parentReligion"
                  value={formData.parentReligion}
                  onChange={(e) => setFormData({...formData, parentReligion: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactRelation">Emergency Contact Relation</Label>
                <Input
                  id="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="parentAddress">Address *</Label>
              <Textarea
                id="parentAddress"
                value={formData.parentAddress}
                onChange={(e) => setFormData({...formData, parentAddress: e.target.value})}
                rows={2}
                required
              />
            </div>
          </div>

          {/* Student Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Student Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="studentFirstName">First Name *</Label>
                <Input
                  id="studentFirstName"
                  value={formData.studentFirstName}
                  onChange={(e) => setFormData({...formData, studentFirstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentLastName">Last Name *</Label>
                <Input
                  id="studentLastName"
                  value={formData.studentLastName}
                  onChange={(e) => setFormData({...formData, studentLastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentGender">Gender *</Label>
                <Select value={formData.studentGender} onValueChange={(value) => setFormData({...formData, studentGender: value})}>
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
              <div>
                <Label htmlFor="studentDateOfBirth">Date of Birth *</Label>
                <Input
                  id="studentDateOfBirth"
                  type="date"
                  value={formData.studentDateOfBirth}
                  onChange={(e) => setFormData({...formData, studentDateOfBirth: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="studentClassId">Class *</Label>
                <Select value={formData.studentClassId} onValueChange={(value) => setFormData({...formData, studentClassId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
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
                <Label htmlFor="studentSection">Section</Label>
                <Select value={formData.studentSection} onValueChange={(value) => setFormData({...formData, studentSection: value})}>
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
                <Label htmlFor="studentRollNumber">Roll Number *</Label>
                <Input
                  id="studentRollNumber"
                  value={formData.studentRollNumber}
                  onChange={(e) => setFormData({...formData, studentRollNumber: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentPhone">Phone</Label>
                <Input
                  id="studentPhone"
                  value={formData.studentPhone}
                  onChange={(e) => setFormData({...formData, studentPhone: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="studentBloodGroup">Blood Group</Label>
                <Select value={formData.studentBloodGroup} onValueChange={(value) => setFormData({...formData, studentBloodGroup: value})}>
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
              <div>
                <Label htmlFor="studentHeight">Height (cm)</Label>
                <Input
                  id="studentHeight"
                  value={formData.studentHeight}
                  onChange={(e) => setFormData({...formData, studentHeight: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="studentWeight">Weight (kg)</Label>
                <Input
                  id="studentWeight"
                  value={formData.studentWeight}
                  onChange={(e) => setFormData({...formData, studentWeight: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="studentNationality">Nationality</Label>
                <Input
                  id="studentNationality"
                  value={formData.studentNationality}
                  onChange={(e) => setFormData({...formData, studentNationality: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="studentReligion">Religion</Label>
                <Input
                  id="studentReligion"
                  value={formData.studentReligion}
                  onChange={(e) => setFormData({...formData, studentReligion: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="studentMotherTongue">Mother Tongue</Label>
                <Input
                  id="studentMotherTongue"
                  value={formData.studentMotherTongue}
                  onChange={(e) => setFormData({...formData, studentMotherTongue: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="studentTransportMode">Transport Mode</Label>
                <Select value={formData.studentTransportMode} onValueChange={(value) => setFormData({...formData, studentTransportMode: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school_bus">School Bus</SelectItem>
                    <SelectItem value="private_vehicle">Private Vehicle</SelectItem>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="public_transport">Public Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="studentPreviousSchool">Previous School</Label>
              <Input
                id="studentPreviousSchool"
                value={formData.studentPreviousSchool}
                onChange={(e) => setFormData({...formData, studentPreviousSchool: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="studentAddress">Student Address</Label>
              <Textarea
                id="studentAddress"
                value={formData.studentAddress}
                onChange={(e) => setFormData({...formData, studentAddress: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentMedicalConditions">Medical Conditions</Label>
                <Textarea
                  id="studentMedicalConditions"
                  value={formData.studentMedicalConditions}
                  onChange={(e) => setFormData({...formData, studentMedicalConditions: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="studentAllergies">Allergies</Label>
                <Textarea
                  id="studentAllergies"
                  value={formData.studentAllergies}
                  onChange={(e) => setFormData({...formData, studentAllergies: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentSpecialNeeds">Special Needs</Label>
                <Textarea
                  id="studentSpecialNeeds"
                  value={formData.studentSpecialNeeds}
                  onChange={(e) => setFormData({...formData, studentSpecialNeeds: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="studentHobbies">Hobbies & Interests</Label>
                <Textarea
                  id="studentHobbies"
                  value={formData.studentHobbies}
                  onChange={(e) => setFormData({...formData, studentHobbies: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="studentEmergencyMedicalInfo">Emergency Medical Information</Label>
              <Textarea
                id="studentEmergencyMedicalInfo"
                value={formData.studentEmergencyMedicalInfo}
                onChange={(e) => setFormData({...formData, studentEmergencyMedicalInfo: e.target.value})}
                rows={2}
                placeholder="Any critical medical information for emergencies"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Parent & Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
