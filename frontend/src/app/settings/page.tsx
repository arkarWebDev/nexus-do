'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { apiGet } from '@/lib/api';
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
import type { UserProfile } from '@/types';

export default function SettingsPage() {
  const { apiKey, clearApiKey, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !apiKey) {
      router.replace('/');
    }
  }, [apiKey, authLoading, router]);

  useEffect(() => {
    if (!apiKey) return;
    apiGet<UserProfile>('/users/me', apiKey)
      .then(setProfile)
      .catch(() => setError('Failed to load profile'));
  }, [apiKey]);

  if (authLoading) return null;

  const handleCopy = async () => {
    if (!profile?.apiKey) return;
    await navigator.clipboard.writeText(profile.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    clearApiKey();
    router.push('/');
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 md:px-8 h-14 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
              <h1 className="text-sm font-semibold tracking-tight">NexusDo</h1>
            </Link>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your API key and account connections
          </p>
        </div>

        <div className="space-y-6 fade-in">
          {/* API Key Card */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base">API Key</CardTitle>
              <CardDescription className="text-xs">
                Use this key to authenticate with the API and link your Telegram
                account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : !profile ? (
                <div className="h-10 shimmer rounded-lg" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={profile.apiKey}
                        readOnly
                        className="font-mono text-sm pr-24 bg-muted/50"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                            />
                          </svg>
                          Copy
                        </span>
                      )}
                    </Button>
                  </div>
                  <div className="rounded-lg bg-muted/50 border p-3">
                    <p className="text-xs text-muted-foreground">
                      Link your Telegram account by sending this command to your bot:
                    </p>
                    <code className="block mt-2 text-sm font-mono bg-background rounded-md p-2 border select-all">
                      /start {profile.apiKey}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telegram Status Card */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-base">Telegram Connection</CardTitle>
              <CardDescription className="text-xs">
                Status of your Telegram bot linkage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!profile ? (
                <div className="h-10 shimmer rounded-lg" />
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      profile.telegramChatId
                        ? 'bg-success'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {profile.telegramChatId ? 'Connected' : 'Not connected'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {profile.telegramChatId
                        ? 'Your Telegram account is linked. You will receive task reminders and can use bot commands.'
                        : 'Send the /start command to your bot to link your Telegram account.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
