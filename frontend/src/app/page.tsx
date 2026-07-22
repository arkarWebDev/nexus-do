'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { apiPost, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { RegisterResponse } from '@/types';

export default function HomePage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="h-6 w-6 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(trimmed);
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Invalid API key.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setSubmitting(true);
    setError('');
    try {
      const data = await apiPost<RegisterResponse>('/users/register');
      setNewKey(data.apiKey);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Registration failed. Is the backend running?',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh relative flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent/10 to-transparent" />
      </div>

      <Card className="w-full max-w-sm sm:max-w-md card-shadow fade-in">
        <CardHeader className="text-center space-y-1 pb-6">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">NexusDo</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Sign in with your API key'
              : 'Create a new account to begin'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {newKey ? (
            <div className="space-y-5 fade-in">
              <div className="rounded-xl bg-gradient-to-br from-success/5 to-primary/5 border border-success/20 p-5">
                <p className="text-xs font-medium text-success uppercase tracking-wider mb-2">
                  Account created
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Save this key — you&apos;ll need it to sign in and link your
                  Telegram account.
                </p>
                <div className="rounded-lg bg-background/80 border px-3 py-2.5">
                  <p className="text-sm font-mono font-medium break-all select-all text-foreground">
                    {newKey}
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                Open Dashboard
              </Button>
            </div>
          ) : mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-xs font-medium">
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Paste your key..."
                  className="h-11"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    if (error) setError('');
                  }}
                />
                {error && (
                  <p className="text-sm text-destructive font-medium">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                New to NexusDo?{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline underline-offset-2 transition-colors"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                >
                  Create account
                </button>
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}
              <Button
                className="w-full"
                size="lg"
                onClick={handleRegister}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Free Account'
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline underline-offset-2 transition-colors"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="absolute bottom-6 text-sm text-muted-foreground">
        <Link href="/docs" className="hover:text-foreground transition-colors underline underline-offset-2">
          Documentation
        </Link>
      </p>
    </main>
  );
}
