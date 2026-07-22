'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { apiPost } from '@/lib/api';
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (apiKey) return null;

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
      const data = await apiPost<{ id: number; apiKey: string }>(
        '/users/register',
        {},
        null,
      );
      setNewKey(data.apiKey);
      setApiKey(data.apiKey);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Registration failed. Is the backend running?',
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">NexusDo</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Enter your API key to access your dashboard'
              : 'Create a new account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {newKey ? (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium mb-1">Your API Key</p>
                <p className="text-sm font-mono break-all select-all">{newKey}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy and save this key — you&apos;ll need it to log in and link your
                Telegram account.
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
                    setError('');
                  }}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => { setMode('register'); setError(''); }}
                >
                  Register
                </button>
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
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
                  className="underline hover:text-foreground"
                  onClick={() => { setMode('login'); setError(''); }}
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
