
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Bell, Shield, User, School, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    feeReminders: true,
    eventNotifications: true,
    homeworkReminders: true,
    
    // Privacy settings
    profileVisibility: 'school',
    showContactInfo: true,
    allowMessages: true,
    
    // School settings (principal only)
    schoolName: 'Sree Sai English Medium High School',
    academicYear: '2024-2025',
    feeStructure: 'monthly',
    gradeSystem: 'percentage',
    
    // Account settings
    language: 'en',
    timezone: 'Asia/Kolkata',
    theme: 'light'
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user?.email })
      });

      if (response.ok) {
        toast.success('Password reset link sent to your email!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Error sending reset link');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        // Redirect to login or logout
        window.location.href = '/login';
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Error deleting account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and application preferences</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Settings</span>
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="feeReminders">Fee Reminders</Label>
              <Switch
                id="feeReminders"
                checked={settings.feeReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, feeReminders: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="eventNotifications">Event Notifications</Label>
              <Switch
                id="eventNotifications"
                checked={settings.eventNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, eventNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="homeworkReminders">Homework Reminders</Label>
              <Switch
                id="homeworkReminders"
                checked={settings.homeworkReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, homeworkReminders: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy Settings</span>
            </CardTitle>
            <CardDescription>Control your privacy and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <Select 
                value={settings.profileVisibility} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="school">School Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showContactInfo">Show Contact Information</Label>
              <Switch
                id="showContactInfo"
                checked={settings.showContactInfo}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showContactInfo: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowMessages">Allow Messages</Label>
              <Switch
                id="allowMessages"
                checked={settings.allowMessages}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowMessages: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* School Settings - Principal Only */}
        {user?.role === 'principal' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="h-5 w-5" />
                <span>School Settings</span>
              </CardTitle>
              <CardDescription>Configure school-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={settings.schoolName}
                  onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={settings.academicYear}
                  onChange={(e) => setSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="feeStructure">Fee Structure</Label>
                <Select 
                  value={settings.feeStructure} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, feeStructure: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gradeSystem">Grade System</Label>
                <Select 
                  value={settings.gradeSystem} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, gradeSystem: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="gpa">GPA</SelectItem>
                    <SelectItem value="letter">Letter Grades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Settings</span>
            </CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={handleResetPassword} className="w-full">
              Reset Password
            </Button>
            <Separator />
            <div className="pt-4">
              <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
