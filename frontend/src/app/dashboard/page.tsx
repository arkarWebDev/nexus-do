'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useDashboard } from '@/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TaskFormDialog } from '@/components/dashboard/task-form-dialog';
import { TodoFormDialog } from '@/components/dashboard/todo-form-dialog';
import { TaskItem } from '@/components/dashboard/task-item';
import { TodoItem } from '@/components/dashboard/todo-item';
import { ErrorBanner } from '@/components/error-banner';
import { DashboardSkeleton } from '@/components/loading-skeleton';
import { EditTaskDialog } from '@/components/dashboard/edit-task-dialog';
import { EditTodoDialog } from '@/components/dashboard/edit-todo-dialog';
import type { Task, Todo } from '@/types';

export default function DashboardPage() {
  const { isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const {
    pendingTasks,
    completedTasks,
    pendingTodos,
    completedTodos,
    isLoading,
    error,
    clearError,
    addTask,
    addTodo,
    toggleTask,
    toggleTodo,
    deleteTask,
    deleteTodo,
    cleanupTasks,
    cleanupTodos,
    updateTask,
    updateTodo,
  } = useDashboard(search);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/');
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || (!isAuthenticated && authLoading)) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const hasTasks = pendingTasks.length > 0 || completedTasks.length > 0;
  const hasTodos = pendingTodos.length > 0 || completedTodos.length > 0;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 md:px-8 h-14 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">NexusDo</h1>
            </div>
            </div>
            <div className="flex-1 max-w-sm mx-4">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-2 text-sm rounded-md border bg-muted/50 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 md:p-8">
        <ErrorBanner message={error} onDismiss={clearError} />

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6 fade-in">
            {/* Tasks */}
            <Card className="card-shadow overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <div>
                  <CardTitle className="text-base font-semibold">Tasks</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {hasTasks
                      ? `${pendingTasks.length} pending · ${completedTasks.length} done`
                      : 'No tasks yet'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {hasTasks && (
                  <div className="divide-y">
                    {pendingTasks.length > 0 && (
                      <div>
                        {pendingTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onEdit={setEditingTask}
                          />
                        ))}
                      </div>
                    )}
                    {completedTasks.length > 0 && (
                      <div>
                        {completedTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onEdit={setEditingTask}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="px-4 py-2 border-t flex items-center justify-between">
                  <TaskFormDialog onAdd={addTask} />
                  {completedTasks.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={cleanupTasks}
                    >
                      Clear {completedTasks.length} done
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Todos */}
            <Card className="card-shadow overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <div>
                  <CardTitle className="text-base font-semibold">Todos</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {hasTodos
                      ? `${pendingTodos.length} pending · ${completedTodos.length} done`
                      : 'No todos yet'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {hasTodos && (
                  <div className="divide-y">
                    {pendingTodos.length > 0 && (
                      <div>
                        {pendingTodos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                            onEdit={setEditingTodo}
                          />
                        ))}
                      </div>
                    )}
                    {completedTodos.length > 0 && (
                      <div>
                        {completedTodos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                            onEdit={setEditingTodo}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="px-4 py-2 border-t flex items-center justify-between">
                  <TodoFormDialog onAdd={addTodo} />
                  {completedTodos.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={cleanupTodos}
                    >
                      Clear {completedTodos.length} done
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {editingTask && (
        <EditTaskDialog
          id={editingTask.id}
          action={editingTask.action}
          remindAt={editingTask.remindAt}
          recurrence={editingTask.recurrence}
          onSave={updateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
      {editingTodo && (
        <EditTodoDialog
          id={editingTodo.id}
          action={editingTodo.action}
          category={editingTodo.category}
          onSave={updateTodo}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </div>
  );
}
