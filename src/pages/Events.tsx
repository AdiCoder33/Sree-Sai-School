import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarDays, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from "../components/ui/textarea"
import { RoleGuard } from '../components/RoleGuard';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: 'school' | 'community' | 'sports' | 'cultural';
  createdAt: string;
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast()

  useEffect(() => {
    // Mock data - replace with actual data fetching
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Science Fair',
        description: 'Annual science exhibition showcasing student projects.',
        date: new Date(),
        location: 'School Auditorium',
        type: 'school',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Community Clean-Up',
        description: 'Join us for a day of cleaning up our local park.',
        date: new Date(),
        location: 'Central Park',
        type: 'community',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Sports Day',
        description: 'Annual sports competition for all students.',
        date: new Date(),
        location: 'School Grounds',
        type: 'sports',
        createdAt: new Date().toISOString(),
      },
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter((event) => {
    const searchMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filterType === 'all' || event.type === filterType;
    return searchMatch && typeMatch;
  });

  const handleDelete = (id: string) => {
    // Mock delete - replace with actual delete logic
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Success",
      description: "Event deleted successfully",
    })
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage school events and activities
          </p>
        </div>

        <RoleGuard allowedRoles={['principal', 'teacher']}>
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
            <CalendarDays className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </RoleGuard>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
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
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 break-words">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-3 break-words">
                  {event.description}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                  <span>Date: {format(event.date, 'PPP')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Location: {event.location}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Type: {event.type}</span>
                </div>
              </div>

              <RoleGuard allowedRoles={['principal', 'teacher']}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>
                Add a new event to the school calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" value="Event Title" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input type="date" id="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input id="location" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </RoleGuard>

      {/* Edit Modal */}
      <RoleGuard allowedRoles={['principal', 'teacher']}>
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Edit the details of the selected event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" value={selectedEvent?.title || ''} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" className="col-span-3" defaultValue={selectedEvent?.description || ''} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input type="date" id="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input id="location" className="col-span-3" defaultValue={selectedEvent?.location || ''} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </RoleGuard>
    </div>
  );
};
