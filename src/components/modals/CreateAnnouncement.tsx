import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const CreateAnnouncement = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('smartschool_token');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    priority: 'Normal',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          target_audience: formData.target_audience.toLowerCase(),
          priority: formData.priority,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to create announcement');

      const newAnnouncement = {
        id: result.id,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        target_audience: formData.target_audience,
        creatorFirstName: user?.firstName || '',
        creatorLastName: user?.lastName || '',
        created_at: new Date().toISOString(),
      };

      onSuccess(newAnnouncement);  // ✅ Only call the parent to handle state & toast
      setFormData({ title: '', content: '', target_audience: 'all', priority: 'Normal' });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogDescription>Share news with the community.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Title"
          required
        />
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Content"
          rows={4}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="students">Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
        </div>
      </form>
    </DialogContent>
  );
};
