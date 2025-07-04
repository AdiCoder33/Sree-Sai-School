
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PromoteStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PromoteStudentsModal: React.FC<PromoteStudentsModalProps> = ({ open, onOpenChange }) => {
  const [fromClass, setFromClass] = useState('Form 1A');
  const [toClass, setToClass] = useState('Form 2A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle promotion logic
    console.log('Promoting students from', fromClass, 'to', toClass);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Promote Students</DialogTitle>
          <DialogDescription>
            Select the classes to promote students between.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">From Class</label>
            <Select value={fromClass} onValueChange={setFromClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Form 1A">Form 1A</SelectItem>
                <SelectItem value="Form 1B">Form 1B</SelectItem>
                <SelectItem value="Form 2A">Form 2A</SelectItem>
                <SelectItem value="Form 2B">Form 2B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To Class</label>
            <Select value={toClass} onValueChange={setToClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Form 1A">Form 1A</SelectItem>
                <SelectItem value="Form 1B">Form 1B</SelectItem>
                <SelectItem value="Form 2A">Form 2A</SelectItem>
                <SelectItem value="Form 2B">Form 2B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Promote Students
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
