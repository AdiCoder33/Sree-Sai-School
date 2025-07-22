import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import toast from 'react-hot-toast';

interface EditAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: any;
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
  announcements: any[];
  onSuccess: (updatedAnnouncement: any) => void;
}

export const EditAnnouncement: React.FC<EditAnnouncementProps> = ({
  isOpen,
  onClose,
  announcement,
  setAnnouncements,
  announcements,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: '',
    target_audience: '',
  });

  const token = localStorage.getItem('smartschool_token');

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'Normal',
        target_audience: announcement.target_audience || 'All',
      });
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!announcement) return onClose();

  try {
    const res = await fetch(`http://localhost:5000/api/announcements/${announcement.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    // ✅ Read response body
    const data = await res.json();

    if (!res.ok) throw new Error(data?.error || 'Failed to update announcement');

    const updatedAnnouncement = {
      ...announcement,
      ...formData
    };

    setAnnouncements(prev =>
      prev.map(a => a.id === announcement.id ? updatedAnnouncement : a)
    );

    onSuccess(updatedAnnouncement);
    toast.success(data.message || '✏️ Announcement Updated Successfully!');
    onClose();

  } catch (error) {
    console.error('❌ Error updating announcement:', error);
    toast.error(error.message || '❌ Failed to update announcement');
  }
};

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogDescription>Update the announcement details.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Textarea
          placeholder="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          required
        />
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full border rounded p-2 text-gray-700"
          required
        >
          <option value="">Select Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          value={formData.target_audience}
          onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
          className="w-full border rounded p-2 text-gray-700"
          required
        >
          <option value="">Select Audience</option>
          <option value="All">All</option>
          <option value="Teachers">Teachers</option>
          <option value="Students">Students</option>
        </select>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Update</Button>
        </div>
      </form>
    </DialogContent>
  );
};
