'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
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
  addTask: (action: string, remindAt: string) => Promise<void>;
  addTodo: (action: string, category: string) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  cleanupTasks: () => Promise<void>;
  cleanupTodos: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const { apiKey } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  const fetchAll = useCallback(async () => {
    if (!apiKey) return;
    try {
      setIsLoading(true);
      const [taskData, todoData] = await Promise.all([
        apiGet<Task[]>('/tasks', apiKey),
        apiGet<Todo[]>('/todos', apiKey),
      ]);
      setTasks(taskData);
      setTodos(todoData);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) fetchAll();
  }, [apiKey, fetchAll]);

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
    async (action: string, remindAt: string) =>
      wrapMutation(
        () => apiPost('/tasks', { action, remindAt }, apiKey),
        'Failed to create task',
      ),
    [apiKey, wrapMutation],
  );

  const addTodo = useCallback(
    async (action: string, category: string) =>
      wrapMutation(
        () => apiPost('/todos', { action, category }, apiKey),
        'Failed to create todo',
      ),
    [apiKey, wrapMutation],
  );

  const toggleTask = useCallback(
    async (id: number) => {
      if (!mounted) return;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
      );
      await wrapMutation(
        () => apiPatch(`/tasks/${id}/complete`, apiKey),
        'Failed to toggle task',
      );
    },
    [apiKey, wrapMutation, mounted],
  );

  const toggleTodo = useCallback(
    async (id: number) => {
      if (!mounted) return;
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
      );
      await wrapMutation(
        () => apiPatch(`/todos/${id}/complete`, apiKey),
        'Failed to toggle todo',
      );
    },
    [apiKey, wrapMutation, mounted],
  );

  const deleteTask = useCallback(
    async (id: number) =>
      wrapMutation(
        () => apiDelete(`/tasks/${id}`, apiKey),
        'Failed to delete task',
      ),
    [apiKey, wrapMutation],
  );

  const deleteTodo = useCallback(
    async (id: number) =>
      wrapMutation(
        () => apiDelete(`/todos/${id}`, apiKey),
        'Failed to delete todo',
      ),
    [apiKey, wrapMutation],
  );

  const cleanupTasks = useCallback(
    async () =>
      wrapMutation(
        () => apiDelete('/tasks/cleanup', apiKey),
        'Failed to clean up tasks',
      ),
    [apiKey, wrapMutation],
  );

  const cleanupTodos = useCallback(
    async () =>
      wrapMutation(
        () => apiDelete('/todos/cleanup', apiKey),
        'Failed to clean up todos',
      ),
    [apiKey, wrapMutation],
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
  };
}
