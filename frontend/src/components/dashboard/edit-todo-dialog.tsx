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

interface EditTodoDialogProps {
  id: number;
  action: string;
  category: string;
  onSave: (id: number, action: string, category: string) => Promise<void>;
  onClose: () => void;
}

export function EditTodoDialog({ id, action, category, onSave, onClose }: EditTodoDialogProps) {
  const [newAction, setNewAction] = useState(action);
  const [newCategory, setNewCategory] = useState(category);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim() || !newCategory.trim()) return;
    setSubmitting(true);
    try {
      await onSave(id, newAction.trim(), newCategory.trim());
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
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>Update the todo action or category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-todo-action" className="text-xs font-medium">Action</Label>
              <Input
                id="edit-todo-action"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-todo-category" className="text-xs font-medium">Category</Label>
              <Input
                id="edit-todo-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Work"
                required
              />
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
