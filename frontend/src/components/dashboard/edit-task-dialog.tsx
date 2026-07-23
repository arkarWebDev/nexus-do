'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditTaskDialogProps {
  id: number;
  action: string;
  remindAt: string;
  onSave: (id: number, action: string, remindAt: string) => Promise<void>;
  onClose: () => void;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().slice(0, 5);
  return { date, time };
}

export function EditTaskDialog({ id, action, remindAt, onSave, onClose }: EditTaskDialogProps) {
  const local = toLocalInput(remindAt);
  const [newAction, setNewAction] = useState(action);
  const [date, setDate] = useState(local.date);
  const [time, setTime] = useState(local.time);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim() || !date || !time) return;
    setSubmitting(true);
    try {
      const localDate = new Date(`${date}T${time}:00`);
      await onSave(id, newAction.trim(), localDate.toISOString());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the task action or reminder time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-action" className="text-xs font-medium">Action</Label>
              <Input
                id="edit-task-action"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-task-date" className="text-xs font-medium">Date</Label>
                <Input id="edit-task-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-time" className="text-xs font-medium">Time</Label>
                <Input id="edit-task-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
