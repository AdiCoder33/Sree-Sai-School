import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
}

interface SelectParentModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (parent: Parent) => void;
}

export const SelectParentModal: React.FC<SelectParentModalProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (open) {
    console.log('🔍 Fetching parents...');
    fetchParents();
  }
}, [open]);


  const fetchParents = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('smartschool_token');
    const res = await fetch('http://localhost:5000/api/users/parents', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    setParents(data);
  } catch (error) {
    console.error('Error fetching parents:', error);
    toast.error('Failed to load parent list');
  } finally {
    setLoading(false);
  }
};


  const filteredParents = parents.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Parent</DialogTitle>
          <DialogDescription>
            Search and choose a parent from the existing users
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <ScrollArea className="mt-4 max-h-[300px] space-y-2">
          {loading ? (
            <div className="text-center text-sm text-gray-500">Loading...</div>
          ) : filteredParents.length === 0 ? (
            <div className="text-center text-sm text-gray-500">No parents found</div>
          ) : (
            filteredParents.map((parent) => (
              <div
                key={parent.id}
                onClick={() => {
                  onSelect(parent);
                  onClose();
                }}
                className="border rounded p-3 hover:bg-indigo-50 cursor-pointer transition-all"
              >
                <div className="font-semibold text-gray-800">
                  {parent.firstName} {parent.lastName}
                </div>
                <div className="text-sm text-gray-600">{parent.email}</div>
                <div className="text-sm text-gray-600">📞 {parent.phone}</div>
              </div>
            ))
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
