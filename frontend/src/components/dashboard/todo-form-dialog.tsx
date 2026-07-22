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

interface TodoFormDialogProps {
  onAdd: (action: string, category: string) => Promise<void>;
}

export function TodoFormDialog({ onAdd }: TodoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim() || !category.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(action.trim(), category.trim());
      setAction('');
      setCategory('');
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Add Todo</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Todo</DialogTitle>
            <DialogDescription>
              Add an item with a category to stay organized.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="todo-action" className="text-xs font-medium">
                What needs to be done?
              </Label>
              <Input
                id="todo-action"
                placeholder="e.g. Review pull request"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-category" className="text-xs font-medium">
                Category
              </Label>
              <Input
                id="todo-category"
                placeholder="e.g. Work, Personal, Health"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Todo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
