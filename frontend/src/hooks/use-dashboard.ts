'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from '@/lib/api';
import type { Task, Todo } from '@/types';

interface UseDashboardReturn {
  tasks: Task[];
  todos: Todo[];
  pendingTasks: Task[];
  completedTasks: Task[];
  pendingTodos: Todo[];
  completedTodos: Todo[];
  isLoading: boolean;
  error: string;
  clearError: () => void;
  addTask: (action: string, remindAt: string, recurrence?: string) => Promise<void>;
  addTodo: (action: string, category: string) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  cleanupTasks: () => Promise<void>;
  cleanupTodos: () => Promise<void>;
  updateTask: (id: number, action: string, remindAt: string, recurrence?: string | null) => Promise<void>;
  updateTodo: (id: number, action: string, category: string) => Promise<void>;
}

export function useDashboard(q?: string): UseDashboardReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const qRef = useRef(q);
  qRef.current = q;

  useEffect(() => setMounted(true), []);

  const clearError = useCallback(() => setError(''), []);

  const fetchAll = useCallback(async (resetLoading = true) => {
    try {
      if (resetLoading) setIsLoading(true);
      const q = qRef.current;
      const qs = q ? `?q=${encodeURIComponent(q)}` : '';
      const [taskData, todoData] = await Promise.all([
        apiGet<Task[]>(`/tasks${qs}`),
        apiGet<Todo[]>(`/todos${qs}`),
      ]);
      setTasks(taskData);
      setTodos(todoData);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data');
    } finally {
      if (resetLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAll(false), 300);
    return () => clearTimeout(timer);
  }, [q, fetchAll]);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '/api';
    const es = new EventSource(`${base}/events`, { withCredentials: true });
    es.onmessage = () => fetchAll(false);
    es.onerror = () => {};
    return () => es.close();
  }, [fetchAll]);

  const wrapMutation = useCallback(
    async (fn: () => Promise<void>, fallback: string) => {
      try {
        await fn();
        await fetchAll();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : fallback);
        throw err;
      }
    },
    [fetchAll],
  );

  const addTask = useCallback(
    async (action: string, remindAt: string, recurrence?: string) =>
      wrapMutation(
        () => apiPost('/tasks', { action, remindAt, ...(recurrence ? { recurrence } : {}) }),
        'Failed to create task',
      ),
    [wrapMutation],
  );

  const addTodo = useCallback(
    async (action: string, category: string) =>
      wrapMutation(
        () => apiPost('/todos', { action, category }),
        'Failed to create todo',
      ),
    [wrapMutation],
  );

  const toggleTask = useCallback(
    async (id: number) => {
      if (!mounted) return;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
      );
      await wrapMutation(
        () => apiPatch(`/tasks/${id}/complete`),
        'Failed to toggle task',
      );
    },
    [wrapMutation, mounted],
  );

  const toggleTodo = useCallback(
    async (id: number) => {
      if (!mounted) return;
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
      );
      await wrapMutation(
        () => apiPatch(`/todos/${id}/complete`),
        'Failed to toggle todo',
      );
    },
    [wrapMutation, mounted],
  );

  const deleteTask = useCallback(
    async (id: number) =>
      wrapMutation(() => apiDelete(`/tasks/${id}`), 'Failed to delete task'),
    [wrapMutation],
  );

  const deleteTodo = useCallback(
    async (id: number) =>
      wrapMutation(() => apiDelete(`/todos/${id}`), 'Failed to delete todo'),
    [wrapMutation],
  );

  const cleanupTasks = useCallback(
    async () =>
      wrapMutation(() => apiDelete('/tasks/cleanup'), 'Failed to clean up tasks'),
    [wrapMutation],
  );

  const cleanupTodos = useCallback(
    async () =>
      wrapMutation(() => apiDelete('/todos/cleanup'), 'Failed to clean up todos'),
    [wrapMutation],
  );

  const updateTask = useCallback(
    async (id: number, action: string, remindAt: string, recurrence?: string | null) =>
      wrapMutation(
        () => apiPatch(`/tasks/${id}`, { action, remindAt, recurrence }),
        'Failed to update task',
      ),
    [wrapMutation],
  );

  const updateTodo = useCallback(
    async (id: number, action: string, category: string) =>
      wrapMutation(
        () => apiPatch(`/todos/${id}`, { action, category }),
        'Failed to update todo',
      ),
    [wrapMutation],
  );

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  return {
    tasks,
    todos,
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
  };
}
