
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';

interface CreateAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
  announcements: any[];
}

export const CreateAnnouncement: React.FC<CreateAnnouncementProps> = ({
  isOpen,
  onClose,
  setAnnouncements,
  announcements
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'normal' as 'high' | 'normal',
    targetAudience: ['students', 'parents', 'teachers']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement = {
      id: Date.now().toString(),
      ...formData,
      author: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      createdAt: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({
      title: '',
      content: '',
      type: 'general',
      priority: 'normal',
      targetAudience: ['students', 'parents', 'teachers']
    });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogDescription>
          Create a new announcement to share with the school community.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Announcement title"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="Announcement content"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <Select value={formData.priority} onValueChange={(value: 'high' | 'normal') => setFormData({...formData, priority: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Announcement
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
