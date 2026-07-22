'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Task, Todo } from '@/types';

export default function DashboardPage() {
  const { apiKey, clearApiKey, isLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [taskAction, setTaskAction] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskOpen, setTaskOpen] = useState(false);

  const [todoAction, setTodoAction] = useState('');
  const [todoCategory, setTodoCategory] = useState('');
  const [todoOpen, setTodoOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !apiKey) {
      router.replace('/');
    }
  }, [apiKey, isLoading, router]);

  const fetchAll = useCallback(async () => {
    if (!apiKey) return;
    try {
      setLoading(true);
      const [taskData, todoData] = await Promise.all([
        apiGet<Task[]>('/tasks', apiKey),
        apiGet<Todo[]>('/todos', apiKey),
      ]);
      setTasks(taskData);
      setTodos(todoData);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) fetchAll();
  }, [apiKey, fetchAll]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !taskAction.trim() || !taskDate || !taskTime) return;
    try {
      await apiPost<Task>('/tasks', {
        action: taskAction.trim(),
        remindAt: `${taskDate}T${taskTime}:00`,
      }, apiKey);
      setTaskAction('');
      setTaskDate('');
      setTaskTime('');
      setTaskOpen(false);
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !todoAction.trim() || !todoCategory.trim()) return;
    try {
      await apiPost<Todo>('/todos', {
        action: todoAction.trim(),
        category: todoCategory.trim(),
      }, apiKey);
      setTodoAction('');
      setTodoCategory('');
      setTodoOpen(false);
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!apiKey) return;
    try {
      await apiDelete(`/tasks/${id}`, apiKey);
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!apiKey) return;
    try {
      await apiDelete(`/todos/${id}`, apiKey);
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const handleToggleTodo = async (id: number) => {
    if (!apiKey) return;
    try {
      await apiPatch(`/todos/${id}/complete`, apiKey);
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle todo');
    }
  };

  if (isLoading || (!apiKey && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NexusDo</h1>
          <p className="text-muted-foreground">Task & Todo Dashboard</p>
        </div>
        <Button variant="outline" onClick={() => { clearApiKey(); router.push('/'); }}>
          Logout
        </Button>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
          <button className="ml-4 underline" onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Tasks Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  {pendingTasks.length} pending / {completedTasks.length} completed
                </CardDescription>
              </div>
              <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                <DialogTrigger render={<Button size="sm" />}>
                  Add Task
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddTask}>
                    <DialogHeader>
                      <DialogTitle>Add Task</DialogTitle>
                      <DialogDescription>
                        Schedule a reminder with an action
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="taskAction">Action</Label>
                        <Input
                          id="taskAction"
                          placeholder="What do you need to do?"
                          value={taskAction}
                          onChange={(e) => setTaskAction(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="taskDate">Date</Label>
                          <Input
                            id="taskDate"
                            type="date"
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taskTime">Time</Label>
                          <Input
                            id="taskTime"
                            type="time"
                            value={taskTime}
                            onChange={(e) => setTaskTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Task</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No tasks yet. Add one to get started.
                </p>
              )}
              <ul className="space-y-1">
                {pendingTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(task.remindAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      &times;
                    </Button>
                  </li>
                ))}
              </ul>
              {completedTasks.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <ul className="space-y-1">
                    {completedTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-2 rounded-md px-3 py-2 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm line-through truncate">{task.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(task.remindAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          &times;
                        </Button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          {/* Todos Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Todos</CardTitle>
                <CardDescription>
                  {pendingTodos.length} pending / {completedTodos.length} completed
                </CardDescription>
              </div>
              <Dialog open={todoOpen} onOpenChange={setTodoOpen}>
                <DialogTrigger render={<Button size="sm" />}>
                  Add Todo
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddTodo}>
                    <DialogHeader>
                      <DialogTitle>Add Todo</DialogTitle>
                      <DialogDescription>
                        Create a new todo with a category
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="todoAction">Action</Label>
                        <Input
                          id="todoAction"
                          placeholder="What do you need to do?"
                          value={todoAction}
                          onChange={(e) => setTodoAction(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="todoCategory">Category</Label>
                        <Input
                          id="todoCategory"
                          placeholder="e.g. Work, Personal"
                          value={todoCategory}
                          onChange={(e) => setTodoCategory(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Todo</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {todos.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No todos yet. Add one to get started.
                </p>
              )}
              <ul className="space-y-1">
                {pendingTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between gap-2 rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => handleToggleTodo(todo.id)}
                    >
                      <Checkbox
                        checked={todo.isCompleted}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{todo.action}</p>
                        <p className="text-xs text-muted-foreground">{todo.category}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      &times;
                    </Button>
                  </li>
                ))}
              </ul>
              {completedTodos.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <ul className="space-y-1">
                    {completedTodos.map((todo) => (
                      <li
                        key={todo.id}
                        className="flex items-center justify-between gap-2 rounded-md px-3 py-2 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => handleToggleTodo(todo.id)}
                        >
                          <Checkbox
                            checked={todo.isCompleted}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm line-through truncate">{todo.action}</p>
                            <p className="text-xs text-muted-foreground">{todo.category}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          &times;
                        </Button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
