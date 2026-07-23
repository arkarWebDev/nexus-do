'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Todo } from '@/types';

const categoryColors: Record<string, string> = {
  Work: 'oklch(0.48 0.18 270)',
  Personal: 'oklch(0.55 0.15 160)',
  Health: 'oklch(0.55 0.2 22)',
  Finance: 'oklch(0.65 0.18 85)',
  Learning: 'oklch(0.5 0.18 330)',
  General: 'oklch(0.45 0.03 260)',
};

function getCategoryColor(category: string): string {
  return categoryColors[category] ?? categoryColors.General;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}

export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const color = getCategoryColor(todo.category);

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 ${
        todo.isCompleted ? 'opacity-50' : ''
      }`}
    >
      <Checkbox
        checked={todo.isCompleted}
        className="shrink-0 mt-0.5 data-[state=checked]:bg-success data-[state=checked]:border-success"
        onCheckedChange={() => onToggle(todo.id)}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate ${
            todo.isCompleted
              ? 'line-through text-muted-foreground'
              : 'font-medium'
          }`}
        >
          {todo.action}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `${color}15`,
              color,
            }}
          >
            {todo.category}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label="Edit todo"
        onClick={() => onEdit(todo)}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        aria-label="Delete todo"
        onClick={() => onDelete(todo.id)}
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
