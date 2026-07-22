'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 ${
        todo.isCompleted ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={() => onToggle(todo.id)}
      >
        <Checkbox
          checked={todo.isCompleted}
          className="shrink-0 pointer-events-none"
        />
        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              todo.isCompleted ? 'line-through' : ''
            }`}
          >
            {todo.action}
          </p>
          <p className="text-xs text-muted-foreground">{todo.category}</p>
        </div>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
        aria-label="Delete todo"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(todo.id);
        }}
      >
        <span aria-hidden>&times;</span>
      </Button>
    </li>
  );
});
