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
  DialogTrigger,
} from '@/components/ui/dialog';

interface TaskFormDialogProps {
  onAdd: (action: string, remindAt: string, recurrence?: string) => Promise<void>;
}

export function TaskFormDialog({ onAdd }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;
    if (!recurrence && (!date || !time)) return;
    if (recurrence && !time) return;
    setSubmitting(true);
    try {
      const dateStr = date ? `${date}T${time}:00` : new Date().toISOString();
      const localDate = new Date(dateStr);
      await onAdd(action.trim(), localDate.toISOString(), recurrence || undefined);
      setAction('');
      setDate('');
      setTime('');
      setRecurrence('');
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          />
        }
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Add a task...
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>
              Create a task with an optional recurrence.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-action" className="text-xs font-medium">
                What needs to be done?
              </Label>
              <Input
                id="task-action"
                placeholder="e.g. Submit quarterly report"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Recurrence (optional)</Label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border bg-background"
              >
                <option value="">None — one-time reminder</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
              </select>
            </div>
            {!recurrence && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="task-date" className="text-xs font-medium">
                    Date
                  </Label>
                  <Input id="task-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-time" className="text-xs font-medium">
                    Time
                  </Label>
                  <Input id="task-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
              </div>
            )}
            {recurrence && (
              <div className="space-y-2">
                <Label htmlFor="task-time-recur" className="text-xs font-medium">
                  Time (first reminder)
                </Label>
                <Input id="task-time-recur" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
