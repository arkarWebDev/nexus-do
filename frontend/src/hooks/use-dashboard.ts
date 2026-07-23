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

  const addTask = useCallback(
    async (action: string, remindAt: string, recurrence?: string) => {
      try {
        const created = await apiPost<Task>('/tasks', { action, remindAt, ...(recurrence ? { recurrence } : {}) });
        setTasks((prev) => [created, ...prev]);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to create task');
        throw err;
      }
    },
    [],
  );

  const addTodo = useCallback(
    async (action: string, category: string) => {
      try {
        const created = await apiPost<Todo>('/todos', { action, category });
        setTodos((prev) => [created, ...prev]);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to create todo');
        throw err;
      }
    },
    [],
  );

  const toggleTask = useCallback(
    async (id: number) => {
      if (!mounted) return;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
      );
      try {
        await apiPatch(`/tasks/${id}/complete`);
      } catch (err) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
        );
        setError(err instanceof ApiError ? err.message : 'Failed to toggle task');
      }
    },
    [mounted],
  );

  const toggleTodo = useCallback(
    async (id: number) => {
      if (!mounted) return;
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
      );
      try {
        await apiPatch(`/todos/${id}/complete`);
      } catch (err) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
        );
        setError(err instanceof ApiError ? err.message : 'Failed to toggle todo');
      }
    },
    [mounted],
  );

  const deleteTask = useCallback(
    async (id: number) => {
      const prev = tasks.find((t) => t.id === id);
      setTasks((p) => p.filter((t) => t.id !== id));
      try {
        await apiDelete(`/tasks/${id}`);
      } catch (err) {
        if (prev) setTasks((p) => [...p, prev].sort((a, b) => a.id - b.id));
        setError(err instanceof ApiError ? err.message : 'Failed to delete task');
      }
    },
    [tasks],
  );

  const deleteTodo = useCallback(
    async (id: number) => {
      const prev = todos.find((t) => t.id === id);
      setTodos((p) => p.filter((t) => t.id !== id));
      try {
        await apiDelete(`/todos/${id}`);
      } catch (err) {
        if (prev) setTodos((p) => [...p, prev].sort((a, b) => a.id - b.id));
        setError(err instanceof ApiError ? err.message : 'Failed to delete todo');
      }
    },
    [todos],
  );

  const cleanupTasks = useCallback(
    async () => {
      const completed = tasks.filter((t) => t.isCompleted);
      setTasks((p) => p.filter((t) => !t.isCompleted));
      try {
        await apiDelete('/tasks/cleanup');
      } catch (err) {
        setTasks((p) => [...p, ...completed].sort((a, b) => a.id - b.id));
        setError(err instanceof ApiError ? err.message : 'Failed to clean up tasks');
      }
    },
    [tasks],
  );

  const cleanupTodos = useCallback(
    async () => {
      const completed = todos.filter((t) => t.isCompleted);
      setTodos((p) => p.filter((t) => !t.isCompleted));
      try {
        await apiDelete('/todos/cleanup');
      } catch (err) {
        setTodos((p) => [...p, ...completed].sort((a, b) => a.id - b.id));
        setError(err instanceof ApiError ? err.message : 'Failed to clean up todos');
      }
    },
    [todos],
  );

  const updateTask = useCallback(
    async (id: number, action: string, remindAt: string, recurrence?: string | null) => {
      const prev = tasks.find((t) => t.id === id);
      setTasks((p) =>
        p.map((t) => (t.id === id ? { ...t, action, remindAt, recurrence: recurrence ?? null } : t)),
      );
      try {
        await apiPatch(`/tasks/${id}`, { action, remindAt, recurrence });
      } catch (err) {
        if (prev) setTasks((p) => p.map((t) => (t.id === id ? prev : t)));
        setError(err instanceof ApiError ? err.message : 'Failed to update task');
      }
    },
    [tasks],
  );

  const updateTodo = useCallback(
    async (id: number, action: string, category: string) => {
      const prev = todos.find((t) => t.id === id);
      setTodos((p) =>
        p.map((t) => (t.id === id ? { ...t, action, category } : t)),
      );
      try {
        await apiPatch(`/todos/${id}`, { action, category });
      } catch (err) {
        if (prev) setTodos((p) => p.map((t) => (t.id === id ? prev : t)));
        setError(err instanceof ApiError ? err.message : 'Failed to update todo');
      }
    },
    [todos],
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
