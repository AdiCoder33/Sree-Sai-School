import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { 
  Megaphone, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { CreateAnnouncement } from '../components/modals/CreateAnnouncement';
import { EditAnnouncement } from '../components/modals/EditAnnouncement';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: 'high' | 'normal';
  targetAudience: string[];
  author: string;
  createdAt: string;
}

export const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    // Mock data for announcements
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'School Closure Alert',
        content: 'Due to severe weather conditions, the school will be closed tomorrow. Stay safe!',
        type: 'urgent',
        priority: 'high',
        targetAudience: ['students', 'parents', 'teachers'],
        author: 'Principal',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Upcoming Science Fair',
        content: 'Get ready for the annual science fair! All students are encouraged to participate.',
        type: 'academic',
        priority: 'normal',
        targetAudience: ['students', 'teachers'],
        author: 'Science Department',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'PTA Meeting Scheduled',
        content: 'The next PTA meeting will be held on July 20th at 6 PM in the school auditorium.',
        type: 'general',
        priority: 'normal',
        targetAudience: ['parents', 'teachers'],
        author: 'PTA President',
        createdAt: new Date().toISOString(),
      },
    ];
    setAnnouncements(mockAnnouncements);
  }, []);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const searchTermMatch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const filterTypeMatch = filterType === 'all' || announcement.type === filterType;
    return searchTermMatch && filterTypeMatch;
  });

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage school announcements and communications
          </p>
        </div>

        <RoleGuard allowedRoles={['principal', 'teacher']}>
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
            <Megaphone className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </RoleGuard>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 break-words">
                    {announcement.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {announcement.type}
                    </Badge>
                    {announcement.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3 break-words">
                  {announcement.content}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                  <span>By {announcement.author}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{format(new Date(announcement.createdAt), 'PPP')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Target: {announcement.targetAudience.join(', ')}</span>
                </div>
              </div>

              <RoleGuard allowedRoles={['principal', 'teacher']}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Delete</span>
                  </Button>
                </div>
              </RoleGuard>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <RoleGuard allowedRoles={['principal', 'teacher']}>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <CreateAnnouncement 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            setAnnouncements={setAnnouncements}
            announcements={announcements}
          />
        </Dialog>
      </RoleGuard>

      {/* Edit Modal */}
      <RoleGuard allowedRoles={['principal', 'teacher']}>
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditAnnouncement
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            announcement={selectedAnnouncement}
            setAnnouncements={setAnnouncements}
            announcements={announcements}
          />
        </Dialog>
      </RoleGuard>
    </div>
  );
};
