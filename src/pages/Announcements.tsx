import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Dialog } from '../components/ui/dialog';
import { Megaphone, Edit, Trash2 } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { CreateAnnouncement } from '../components/modals/CreateAnnouncement';
import { EditAnnouncement } from '../components/modals/EditAnnouncement';
import toast, { Toaster } from 'react-hot-toast';

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const token = localStorage.getItem('smartschool_token');

  // 📦 Reusable fetch logic
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/announcements', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to fetch announcements');
    }
  };

  useEffect(() => {
    if (token) fetchAnnouncements();
  }, [token]);

  // ✅ Just trigger refetch instead of local mutation
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchAnnouncements();
    toast.success('✅ Announcement Created Successfully!');
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchAnnouncements();
    toast.success('✏️ Announcement Updated Successfully!');
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // ✅ Refresh after deletion
      fetchAnnouncements();
      toast.success('🗑️ Announcement Deleted Successfully!');
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to delete announcement');
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Announcements</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage school announcements and communications
          </p>
        </div>
        <RoleGuard allowedRoles={['admin', 'teacher']}>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Megaphone className="mr-2 h-4 w-4" /> Create Announcement
          </Button>
        </RoleGuard>
      </div>

      <Card className="p-4">
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search announcements..."
        />
      </Card>

      <div className="space-y-4">
        {filteredAnnouncements.map(a => (
          <Card key={a.id} className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-500 mb-1">Priority: {a.priority || 'Not set'}</p>
                <p className="text-gray-600 mb-2">{a.content}</p>
                <p className="text-sm text-gray-500">
                  By {a.creatorFirstName} {a.creatorLastName} • {format(new Date(a.created_at || a.createdAt), 'PPP')}
                </p>
              </div>
              <div className="flex gap-2">
                <RoleGuard allowedRoles={['admin', 'teacher']}>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedAnnouncement(a);
                    setIsEditModalOpen(true);
                  }}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                </RoleGuard>
                <RoleGuard allowedRoles={['admin']}>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </RoleGuard>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <RoleGuard allowedRoles={['admin', 'teacher']}>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <CreateAnnouncement
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        </Dialog>
      </RoleGuard>

      <RoleGuard allowedRoles={['admin', 'teacher']}>
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditAnnouncement
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  announcement={selectedAnnouncement}
  setAnnouncements={setAnnouncements}      // ✅ FIX: Pass this
  announcements={announcements}            // ✅ Optional: Pass this if you use it (you have it in props)
  onSuccess={handleEditSuccess}
/>

        </Dialog>
      </RoleGuard>
    </div>
  );
};
