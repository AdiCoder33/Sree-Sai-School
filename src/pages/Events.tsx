import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarDays, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RoleGuard } from '@/components/RoleGuard';

const API_BASE = 'http://localhost:5000/api/events';
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'school' | 'community' | 'sports' | 'cultural';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  creatorFirstName?: string;
  creatorLastName?: string;
}


export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    type: 'school'
  });

  const getToken = () => localStorage.getItem('smartschool_token');

  const isTokenValid = (token: string | null) => {
    try {
      return token && token.split('.').length === 3;
    } catch {
      return false;
    }
  };

  const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'completed' => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (start > now) return 'upcoming';
    if (start <= now && end >= now) return 'ongoing';
    return 'completed';
  };

  const getStatusColor = (status: 'upcoming' | 'ongoing' | 'completed') => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchEvents = async () => {
    const token = getToken();
    if (!isTokenValid(token)) {
      toast({ title: 'Invalid token', description: 'Please log in again.' });
      localStorage.clear();
      return;
    }

    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Failed to load events' });
        return;
      }
      const data = await res.json();
      setEvents(data);
    } catch {
      toast({ title: 'Error', description: 'Network error on fetching events' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async () => {
    const token = getToken();
    if (!isTokenValid(token)) {
      toast({ title: 'Invalid token', description: 'Please log in again.' });
      return;
    }

    const method = selectedEvent ? 'PUT' : 'POST';
    const url = selectedEvent ? `${API_BASE}/${selectedEvent.id}` : API_BASE;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Submission failed' });
        return;
      }

      toast({
        title: 'Success',
        description: selectedEvent ? 'Event updated' : 'Event created'
      });

      setIsModalOpen(false);
      setSelectedEvent(null);
      setForm({ title: '', description: '', startDate: '', endDate: '', location: '', type: 'school' });
      fetchEvents();
    } catch {
      toast({ title: 'Error', description: 'Network error on submitting event' });
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!isTokenValid(token)) {
      toast({ title: 'Invalid token', description: 'Please log in again.' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Deletion failed' });
        return;
      }

      toast({ title: 'Deleted', description: 'Event removed' });
      fetchEvents();
    } catch {
      toast({ title: 'Error', description: 'Network error on deleting event' });
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || event.type === filterType;
    return matchSearch && matchType;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const order = { upcoming: 0, ongoing: 1, completed: 2 } as const;
    const statusA = getEventStatus(a);
    const statusB = getEventStatus(b);
    if (statusA !== statusB) {
      return order[statusA] - order[statusB];
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-gray-600">Upcoming school activities</p>
        </div>
        <RoleGuard allowedRoles={['admin', 'teacher']}>
          <Button onClick={() => {
            setSelectedEvent(null);
            setForm({ title: '', description: '', startDate: '', endDate: '', location: '', type: 'school' });
            setIsModalOpen(true);
          }}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </RoleGuard>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="space-y-4">
        {sortedEvents.map((event) => {
          const status = getEventStatus(event);
          return (
            <Card key={event.id} className="p-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {event.title}
                    <Badge className={getStatusColor(status)}>{status}</Badge>
                  </h3>
                  <p className="text-gray-600 mt-2">{event.description}</p>
                <div className="text-sm text-gray-500 mt-3">
                  <p>Start: {format(new Date(event.startDate), 'PPP')}</p>
                  <p>End: {format(new Date(event.endDate), 'PPP')}</p>
                  <p>Location: {event.location}</p>
                  <p>Type: {event.type}</p>
                </div>
              </div>
              <RoleGuard allowedRoles={['admin', 'teacher']}>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setForm({ ...event });
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </RoleGuard>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <Label>Start Date</Label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />

            <Label>End Date</Label>
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />

            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

            <Label>Type</Label>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as Event['type'] })}>
              <SelectTrigger>
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

          <DialogFooter>
            <Button onClick={handleSubmit}>
              {selectedEvent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
