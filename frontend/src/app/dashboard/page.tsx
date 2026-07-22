'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function DashboardPage() {
  const { apiKey, clearApiKey, isLoading: authLoading } = useAuth();
  const router = useRouter();

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
  } = useDashboard();

  useEffect(() => {
    if (!authLoading && !apiKey) router.replace('/');
  }, [apiKey, authLoading, router]);

  if (authLoading || (!apiKey && authLoading)) return null;

  const handleLogout = () => {
    clearApiKey();
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
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
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
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div>
                  <CardTitle className="text-base font-semibold">Tasks</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {pendingTasks.length} pending &middot; {completedTasks.length}{' '}
                    done
                  </CardDescription>
                </div>
                <TaskFormDialog onAdd={addTask} />
              </CardHeader>
              <CardContent className="p-0">
                {!hasTasks ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <svg
                        className="h-6 w-6 text-muted-foreground/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      No tasks yet
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Add a task with a reminder time to get started.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingTasks.length > 0 && (
                      <div className="px-0.5">
                        {pendingTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                          />
                        ))}
                      </div>
                    )}
                    {completedTasks.length > 0 && (
                      <div className="px-0.5">
                        {completedTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Todos */}
            <Card className="card-shadow overflow-hidden">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div>
                  <CardTitle className="text-base font-semibold">Todos</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {pendingTodos.length} pending &middot; {completedTodos.length}{' '}
                    done
                  </CardDescription>
                </div>
                <TodoFormDialog onAdd={addTodo} />
              </CardHeader>
              <CardContent className="p-0">
                {!hasTodos ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <svg
                        className="h-6 w-6 text-muted-foreground/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      No todos yet
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Organize your work with categorized todo items.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingTodos.length > 0 && (
                      <div className="px-0.5">
                        {pendingTodos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                          />
                        ))}
                      </div>
                    )}
                    {completedTodos.length > 0 && (
                      <div className="px-0.5">
                        {completedTodos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
