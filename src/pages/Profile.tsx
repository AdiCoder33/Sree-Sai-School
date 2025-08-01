
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User, Phone, MapPin, Mail, Calendar, Save, Upload, GraduationCap, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { toast } from 'sonner';
import { API_BASE } from '../lib/api';

export const Profile: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState<string>('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    qualification: '',
    experience: '',
    subject: '',
    dateOfJoining: '',
    emergencyContact: '',
    childName: '',
    childClass: '',
    occupation: ''
  });

  const {
    children: childrenList,
    selectedStudent,
    setSelectedStudent,
    setChildren,
  } = useStudent();

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const token = localStorage.getItem('smartschool_token');
      try {
        const res = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            dateOfBirth: data.dateOfBirth || '',
            qualification: data.qualification || '',
            experience: data.experience || '',
            subject: data.subject || '',
            dateOfJoining: data.dateOfJoining || '',
            emergencyContact: data.emergencyContact || '',
            childName: data.childName || '',
            childClass: data.childClass || '',
            occupation: data.occupation || ''
          });
        }
      } catch (err) {
        console.error('❌ Fetch profile error:', err);
      }
    };

    fetchUser();
  }, [user]);

  useEffect(() => {
    if (user?.role === 'parent') {
      const child = selectedStudent || childrenList[0];
      if (child) {
        setFormData((prev) => ({
          ...prev,
          childName: `${child.firstName} ${child.lastName}`,
          childClass: child.class,
        }));
        if (child.avatar) {
          setStudentPhoto(child.avatar);
        }
      }
    }
  }, [childrenList, selectedStudent, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await updateUser(formData);
      if (success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Error updating profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const token = localStorage.getItem('smartschool_token');
    const fd = new FormData();
    fd.append('avatar', file);

    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Avatar updated successfully!');
        await refreshUser();
      } else {
        toast.error(data.error || 'Error uploading avatar');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Error uploading avatar');
    }
  };

  const handleStudentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || user?.role !== 'parent') return;

    const child = selectedStudent || childrenList[0];
    if (!child) return;

    const token = localStorage.getItem('smartschool_token');
    const fd = new FormData();
    fd.append('avatar', file);

    try {
      const res = await fetch(`${API_BASE}/students/${child.id}/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setStudentPhoto(data.avatarUrl);
        toast.success('Student photo uploaded successfully!');

        // 🔄 Refresh selected student so new avatar shows everywhere
        const updated = await fetch(`${API_BASE}/students/${child.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (updated.ok) {
          const student = await updated.json();
          setSelectedStudent(student);
          setChildren(prev => prev.map(c => (c.id === student.id ? student : c)));
        }
      } else {
        toast.error(data.error || 'Error uploading student photo');
      }
    } catch (err) {
      console.error('Student photo upload error:', err);
      toast.error('Error uploading student photo');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordLoading(true);
    const token = localStorage.getItem('smartschool_token');
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '' });
      } else {
        toast.error(data.error || 'Error updating password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      toast.error('Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'principal':
        return 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'parent':
        return 'Parent';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Picture Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription className="text-sm">Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-2xl sm:text-3xl">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>{user.firstName} {user.lastName}</strong>
              </p>
              <p className="text-sm text-blue-600 font-medium">
                {getRoleDisplayName(user.role)}
              </p>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <label htmlFor="avatar" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Photo Card - Only for Parents */}
        {user.role === 'parent' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Student Photo
              </CardTitle>
              <CardDescription className="text-sm">Upload your child's photo</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
                <AvatarImage src={studentPhoto} alt={formData.childName || 'Student'} />
                <AvatarFallback className="text-2xl sm:text-3xl">
                  {formData.childName ? formData.childName.split(' ').map(n => n[0]).join('') : 'ST'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>{formData.childName || 'Student Name'}</strong>
                </p>
                <p className="text-sm text-green-600 font-medium">
                  {formData.childClass || 'Class'}
                </p>
                <input
                  type="file"
                  id="studentPhoto"
                  accept="image/*"
                  onChange={handleStudentPhotoUpload}
                  className="hidden"
                />
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                  <label htmlFor="studentPhoto" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Student Photo
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information Card */}
        <Card className={user.role === 'parent' ? 'lg:col-span-1' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Role-specific sections */}
              {user.role === 'teacher' && (
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="qualification" className="text-sm font-medium">Qualification</Label>
                      <Input
                        id="qualification"
                        value={formData.qualification}
                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience" className="text-sm font-medium">Experience (Years)</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfJoining" className="text-sm font-medium">Date of Joining</Label>
                      <Input
                        id="dateOfJoining"
                        type="date"
                        value={formData.dateOfJoining}
                        onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'parent' && (
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Child & Family Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="childName" className="text-sm font-medium">Child Name</Label>
                      <Input
                        id="childName"
                        value={formData.childName}
                        readOnly
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="childClass" className="text-sm font-medium">Child Class</Label>
                      <Input
                        id="childClass"
                        value={formData.childClass}
                        readOnly
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="occupation" className="text-sm font-medium">Your Occupation</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'principal' && (
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                    Administrative Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="qualification" className="text-sm font-medium">Qualification</Label>
                      <Input
                        id="qualification"
                        value={formData.qualification}
                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience" className="text-sm font-medium">Experience (Years)</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfJoining" className="text-sm font-medium">Date of Joining</Label>
                      <Input
                        id="dateOfJoining"
                        type="date"
                        value={formData.dateOfJoining}
                        onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card className="max-w-md mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <CardDescription className="text-sm">Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordLoading} className="w-full sm:w-auto">
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
