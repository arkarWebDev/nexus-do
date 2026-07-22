'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const { apiKey, setApiKey, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState('');
  const [registering, setRegistering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && apiKey) {
      router.replace('/dashboard');
    }
  }, [apiKey, isLoading, router]);

  if (isLoading || apiKey) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }
    setApiKey(trimmed);
    router.push('/dashboard');
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError('');
    try {
      const data = await apiPost<RegisterResponse>('/users/register', {}, null);
      setNewKey(data.apiKey);
      setApiKey(data.apiKey);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Registration failed. Is the backend running?',
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center sm:text-left">
          <CardTitle className="text-2xl font-semibold">NexusDo</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Enter your API key to access your dashboard'
              : 'Create a new account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {newKey ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-2">Your API Key</p>
                <p className="text-sm font-mono break-all select-all bg-background rounded-md p-2 border">
                  {newKey}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Copy and save this key — you&apos;ll need it to log in and link
                your Telegram account.
              </p>
              <Button className="w-full" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Paste your API key"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    if (error) setError('');
                  }}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                >
                  Register
                </button>
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Login
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
