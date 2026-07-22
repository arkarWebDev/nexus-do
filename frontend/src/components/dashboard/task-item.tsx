'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TaskItem = memo(function TaskItem({
  task,
  onToggle,
  onDelete,
}: TaskItemProps) {
  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 ${
        task.isCompleted ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={() => onToggle(task.id)}
      >
        <Checkbox
          checked={task.isCompleted}
          className="shrink-0 pointer-events-none"
        />
        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              task.isCompleted ? 'line-through' : ''
            }`}
          >
            {task.action}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(task.remindAt)}
          </p>
        </div>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
        aria-label="Delete task"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        <span aria-hidden>&times;</span>
      </Button>
    </li>
  );
});
