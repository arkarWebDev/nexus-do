'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isThisYear = d.getFullYear() === now.getFullYear();

  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(isThisYear ? {} : { year: 'numeric' }),
  });

  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} at ${timePart}`;
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
  const isOverdue =
    !task.isCompleted && new Date(task.remindAt).getTime() < Date.now();

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 ${
        task.isCompleted ? 'opacity-50' : ''
      }`}
    >
      <Checkbox
        checked={task.isCompleted}
        className="shrink-0 mt-0.5 data-[state=checked]:bg-success data-[state=checked]:border-success"
        onCheckedChange={() => onToggle(task.id)}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate ${
            task.isCompleted
              ? 'line-through text-muted-foreground'
              : 'font-medium'
          }`}
        >
          {task.action}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <svg
            className={`h-3 w-3 ${
              isOverdue ? 'text-destructive' : 'text-muted-foreground/50'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span
            className={`text-xs ${
              isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
            }`}
          >
            {formatDate(task.remindAt)}
            {isOverdue && ' — overdue'}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        aria-label="Delete task"
        onClick={() => onDelete(task.id)}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </Button>
    </div>
  );
});
