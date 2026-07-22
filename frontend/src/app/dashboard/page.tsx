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
import { Separator } from '@/components/ui/separator';
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
    if (!authLoading && !apiKey) {
      router.replace('/');
    }
  }, [apiKey, authLoading, router]);

  if (authLoading || (!apiKey && authLoading)) return null;

  const handleLogout = () => {
    clearApiKey();
    router.push('/');
  };

  const hasTasks = pendingTasks.length + completedTasks.length > 0;
  const hasTodos = pendingTodos.length + completedTodos.length > 0;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 md:px-8 h-14">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">NexusDo</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Task & Todo Dashboard
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <ErrorBanner message={error} onDismiss={clearError} />

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Tasks */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">Tasks</CardTitle>
                  <CardDescription className="text-xs">
                    {pendingTasks.length} pending / {completedTasks.length} completed
                  </CardDescription>
                </div>
                <TaskFormDialog onAdd={addTask} />
              </CardHeader>
              <CardContent>
                {!hasTasks ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No tasks yet. Add one to get started.
                  </p>
                ) : (
                  <>
                    <ul className="space-y-0.5">
                      {pendingTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                        />
                      ))}
                    </ul>
                    {completedTasks.length > 0 && (
                      <>
                        <Separator className="my-2" />
                        <ul className="space-y-0.5">
                          {completedTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onToggle={toggleTask}
                              onDelete={deleteTask}
                            />
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Todos */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">Todos</CardTitle>
                  <CardDescription className="text-xs">
                    {pendingTodos.length} pending / {completedTodos.length} completed
                  </CardDescription>
                </div>
                <TodoFormDialog onAdd={addTodo} />
              </CardHeader>
              <CardContent>
                {!hasTodos ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No todos yet. Add one to get started.
                  </p>
                ) : (
                  <>
                    <ul className="space-y-0.5">
                      {pendingTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={toggleTodo}
                          onDelete={deleteTodo}
                        />
                      ))}
                    </ul>
                    {completedTodos.length > 0 && (
                      <>
                        <Separator className="my-2" />
                        <ul className="space-y-0.5">
                          {completedTodos.map((todo) => (
                            <TodoItem
                              key={todo.id}
                              todo={todo}
                              onToggle={toggleTodo}
                              onDelete={deleteTodo}
                            />
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
