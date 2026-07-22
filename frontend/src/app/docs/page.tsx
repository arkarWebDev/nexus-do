import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs — NexusDo',
  description: 'Documentation for the NexusDo task and todo management system',
};

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 md:px-8 h-14 max-w-[800px] mx-auto">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80">
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
            <span className="text-sm font-semibold">NexusDo</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto p-4 md:p-8">
        <article className="prose prose-sm prose-neutral max-w-none space-y-12">
          {/* Hero */}
          <section>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              NexusDo Documentation
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              A centralized task and todo management system with a REST API,
              Telegram bot, and web dashboard — all sharing the same data and
              business logic.
            </p>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>

            <h3 className="text-base font-semibold mt-6 mb-2">
              1. Start the Backend
            </h3>
            <div className="rounded-lg bg-muted/50 border p-4">
              <pre className="text-sm font-mono overflow-x-auto">
                <code>{`# Clone and enter the project
cd NexusDo/backend

# Configure your .env file
cp .env.example .env
# Edit .env with your PostgreSQL URL and Telegram bot token

# Push database schema
npm run db:push

# Start the server (defaults to port 3001)
npm run start:dev`}</code>
              </pre>
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">
              2. Start the Frontend
            </h3>
            <div className="rounded-lg bg-muted/50 border p-4">
              <pre className="text-sm font-mono overflow-x-auto">
                <code>{`cd NexusDo/frontend
cp .env.example .env.local
npm run dev
# Opens at http://localhost:3000`}</code>
              </pre>
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">
              3. Create an Account
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open <Link href="/" className="text-primary hover:underline">the web app</Link>,
              click <strong>Create account</strong>. A 64-character API key will be
              generated — save it. This key is used to authenticate with the API
              and link your Telegram account.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              After registering, you&apos;re automatically signed in. Visit
              <strong> Settings</strong> (gear icon) to view your API key, check
              Telegram connection status, or rotate your key.
            </p>
          </section>

          {/* Telegram Bot */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Telegram Bot</h2>

            <h3 className="text-base font-semibold mt-6 mb-2">
              Linking Your Account
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Send the following command to your bot on Telegram to link your
              account:
            </p>
            <div className="rounded-lg bg-muted/50 border p-4 mt-2">
              <code className="text-sm font-mono">/start YOUR_API_KEY</code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              The bot will immediately delete your message to keep your API key
              private. You can always find or rotate your key from the web
              Settings page.
            </p>

            <h3 className="text-base font-semibold mt-8 mb-3">
              Bot Commands
            </h3>
            <div className="space-y-4">
              <CommandEntry
                cmd="/start &lt;API_KEY&gt;"
                desc="Link your Telegram account to your NexusDo account using your API key. The bot deletes this message immediately after processing for security."
              />
              <CommandEntry
                cmd="/addtask &lt;YYYY-MM-DD HH:mm&gt; &lt;action&gt;"
                desc="Create a new timed task with a reminder. Example: /addtask 2026-08-01 14:30 Buy groceries"
              />
              <CommandEntry
                cmd="/tasks"
                desc="List all your pending tasks with their scheduled reminder times."
              />
              <CommandEntry
                cmd="/donetask &lt;id&gt;"
                desc='Mark a task as completed. Example: /donetask 3'
              />
              <CommandEntry
                cmd="/cleantasks"
                desc="Remove all completed tasks at once. A quick cleanup command."
              />
              <CommandEntry
                cmd="/addtodo &lt;action&gt; #&lt;category&gt;"
                desc='Create a categorized todo. The hashtag at the end sets the category. Example: /addtodo Review PR #Work  (Omitting #category defaults to "General").'
              />
              <CommandEntry
                cmd="/todos"
                desc="Display all your todos as an interactive inline keyboard. Tap any row to toggle its completion status instantly."
              />
              <CommandEntry
                cmd="/donetodo &lt;id&gt;"
                desc='Mark a todo as completed. Example: /donetodo 1'
              />
              <CommandEntry
                cmd="/cleantodos"
                desc="Remove all completed todos at once."
              />
              <CommandEntry
                cmd="/rotatekey"
                desc="Generate a new API key. Your old key is invalidated immediately. Use this if your key is compromised or expired."
              />
            </div>
          </section>

          {/* REST API */}
          <section>
            <h2 className="text-xl font-semibold mb-4">REST API</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The backend runs on port <code>3001</code> by default. All
              endpoints except registration use Bearer authentication.
            </p>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-2 font-medium">Method</th>
                    <th className="text-left px-4 py-2 font-medium">Endpoint</th>
                    <th className="text-left px-4 py-2 font-medium">Auth</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <ApiRow method="POST" path="/users/register" auth="Public" desc="Create account, returns API key" />
                  <ApiRow method="GET" path="/users/me" auth="Bearer" desc="Get current user profile" />
                  <ApiRow method="PATCH" path="/users/rotate-key" auth="Bearer" desc="Generate new API key" />
                  <ApiRow method="POST" path="/auth/login" auth="Public" desc="Set httpOnly session cookie" />
                  <ApiRow method="POST" path="/auth/logout" auth="Public" desc="Clear session cookie" />
                  <ApiRow method="POST" path="/tasks" auth="Bearer" desc="Create task ({ action, remindAt })" />
                  <ApiRow method="GET" path="/tasks" auth="Bearer" desc="List all tasks" />
                  <ApiRow method="PATCH" path="/tasks/:id/complete" auth="Bearer" desc="Mark task completed" />
                  <ApiRow method="DELETE" path="/tasks/:id" auth="Bearer" desc="Delete task" />
                  <ApiRow method="DELETE" path="/tasks/cleanup" auth="Bearer" desc="Delete all completed tasks" />
                  <ApiRow method="POST" path="/todos" auth="Bearer" desc="Create todo ({ action, category })" />
                  <ApiRow method="GET" path="/todos" auth="Bearer" desc="List all todos" />
                  <ApiRow method="PATCH" path="/todos/:id/complete" auth="Bearer" desc="Mark todo completed" />
                  <ApiRow method="DELETE" path="/todos/:id" auth="Bearer" desc="Delete todo" />
                  <ApiRow method="DELETE" path="/todos/cleanup" auth="Bearer" desc="Delete all completed todos" />
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-semibold mt-6 mb-2">Authorization</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Authenticated endpoints accept either a Bearer token header or an
              httpOnly cookie set via <code>POST /auth/login</code>.
            </p>
            <div className="rounded-lg bg-muted/50 border p-4 mt-2">
              <code className="text-sm font-mono">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </section>

          {/* Architecture */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Architecture</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Backend</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  NestJS + Drizzle ORM + PostgreSQL. Cron jobs for task reminders
                  (every minute). Session-based auth with httpOnly cookies.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Telegram Bot</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Built with nestjs-telegraf. Shares the same database and
                  business logic as the REST API. Inline keyboards for interactive
                  todo management.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Web Dashboard</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Next.js 16 + Tailwind CSS + shadcn/ui. Cookie-based auth.
                  Optimistic UI updates for instant toggle feedback.
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}

function CommandEntry({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="rounded-lg border p-3">
      <code className="text-sm font-mono font-medium text-primary">{cmd}</code>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function ApiRow({
  method,
  path,
  auth,
  desc,
}: {
  method: string;
  path: string;
  auth: string;
  desc: string;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-2">
        <span className="text-xs font-mono font-medium text-primary">
          {method}
        </span>
      </td>
      <td className="px-4 py-2">
        <code className="text-xs font-mono">{path}</code>
      </td>
      <td className="px-4 py-2">
        <span
          className={`text-xs font-medium ${
            auth === 'Public' ? 'text-success' : 'text-muted-foreground'
          }`}
        >
          {auth}
        </span>
      </td>
      <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
    </tr>
  );
}
