import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs — NexusDo',
  description: 'Learn how to use NexusDo to manage your tasks and todos',
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
            Open App →
          </Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto p-4 md:p-8">
        <article className="space-y-14">
          {/* Hero */}
          <section className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to NexusDo
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              NexusDo helps you stay organized. Create tasks with reminders, track
              todos by category, and manage everything from your browser or
              Telegram — all in sync.
            </p>
          </section>

          {/* Quick Start */}
          <Section title="Getting Started">
            <Step num={1} title="Create your account">
              Open the app and click <strong>Create account</strong>. You&apos;ll
              get a unique API key — this is your password. Save it somewhere safe,
              like a password manager.
            </Step>
            <Step num={2} title="Start adding tasks and todos">
              Once logged in, you&apos;ll see your dashboard. Use the <strong>
                Add Task
              </strong> button to schedule reminders, or <strong>Add Todo</strong>
              {' '}
              to organize items by category.
            </Step>
            <Step num={3} title="Connect Telegram (optional)">
              Copy your API key from <strong>Settings</strong> and send{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                /start YOUR_KEY
              </code> to the bot. You&apos;ll get reminders and can manage
              everything from chat.
            </Step>
          </Section>

          {/* Web Dashboard */}
          <Section title="Web Dashboard">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The dashboard is split into two sections:
            </p>

            <FeatureBlock
              title="Tasks"
              icon="⏰"
              desc="Time-based reminders. Each task has a date and time — perfect for deadlines, appointments, or anything with a due date."
              items={[
                "Click Add Task and pick a date, time, and description",
                "Tap the checkbox to mark a task as done",
                "Overdue tasks show in red with an overdue label",
                "Click the × to delete a task",
                "Use the Clear button to remove all completed tasks at once",
              ]}
            />

            <FeatureBlock
              title="Todos"
              icon="📋"
              desc="Category-based items. Group your todos by category like Work, Personal, Health, or any label you choose."
              items={[
                "Click Add Todo with a description and a category",
                "Tap the checkbox to mark as done or undo",
                "Each category gets its own color badge",
                "Todos are ordered with pending first, then completed",
              ]}
            />

            <FeatureBlock
              title="Settings"
              icon="⚙️"
              desc="Manage your account. Access it from the gear icon in the dashboard header."
              items={[
                "View or copy your API key for Telegram linking",
                "Check if your Telegram account is connected",
                "Rotate your API key if you need a new one",
              ]}
            />
          </Section>

          {/* Telegram Bot */}
          <Section title="Telegram Bot">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The bot lets you manage tasks and todos without opening the browser.
              It syncs with the same account — anything you add from the bot
              appears on the web dashboard and vice versa.
            </p>

            <h3 className="text-base font-semibold mt-6 mb-3">
              Linking Your Account
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Send this to the bot on Telegram:
            </p>
            <div className="rounded-lg bg-muted/50 border p-3 mt-2 mb-2">
              <code className="text-sm font-mono">/start YOUR_API_KEY</code>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Find your API key in Settings → API Key. The bot deletes your
              message immediately so your key stays private.
            </p>

            <h3 className="text-base font-semibold mt-8 mb-4">
              All Bot Commands
            </h3>

            <div className="space-y-3">
              <Cmd cmd="/start &lt;key&gt;" desc="Link your account with your API key" />
              <Cmd cmd="/addtask &lt;date&gt; &lt;time&gt; &lt;action&gt;" desc="Create a task with a reminder. Example: /addtask 2026-08-01 14:30 Buy groceries" />
              <Cmd cmd="/tasks" desc="See your pending tasks with their scheduled times" />
              <Cmd cmd="/donetask &lt;id&gt;" desc="Mark a task as completed. Use the ID shown in /tasks" />
              <Cmd cmd="/cleantasks" desc="Delete all completed tasks in one go" />
              <Cmd cmd="/addtodo &lt;action&gt; #&lt;category&gt;" desc="Create a todo. The #tag at the end sets the category. Leave it out for General. Example: /addtodo Review PR #Work" />
              <Cmd cmd="/todos" desc="Shows all your todos. Tap any row to toggle between done and not done" />
              <Cmd cmd="/donetodo &lt;id&gt;" desc="Mark a todo as completed" />
              <Cmd cmd="/cleantodos" desc="Delete all completed todos in one go" />
              <Cmd cmd="/rotatekey" desc="Get a new API key. Your old key stops working immediately. Useful if your key gets exposed" />
            </div>
          </Section>

          {/* FAQ */}
          <Section title="Tips & FAQ">
            <Faq
              q="How do I get reminders?"
              a="Add a task with a future date and time. The system checks every minute and sends you a Telegram message when the time arrives. Your task gets marked as done automatically after the reminder is sent."
            />
            <Faq
              q="Can I use only the bot without the web app?"
              a="Yes. Register once on the web to get your API key, link your Telegram account, and you can manage everything from the bot after that."
            />
            <Faq
              q="What happens if I rotate my API key?"
              a="The old key stops working immediately. You'll need to use the new key to log in. Your Telegram account stays linked — you don't need to re-link it."
            />
            <Faq
              q="How do I change a task's time?"
              a="Delete the task and create a new one with the correct time. Editing existing tasks is coming soon."
            />
            <Faq
              q="Can I share my account with someone?"
              a="Each account has one API key. Sharing the key gives someone full access to your tasks and todos. Keep it private."
            />
          </Section>
        </article>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-5">{title}</h2>
      {children}
    </section>
  );
}

function Step({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 mt-4 first:mt-0">
      <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
        {num}
      </div>
      <div>
        <p className="text-sm font-semibold mb-0.5">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  );
}

function FeatureBlock({
  title,
  icon,
  desc,
  items,
}: {
  title: string;
  icon: string;
  desc: string;
  items: string[];
}) {
  return (
    <div className="mt-5 rounded-lg border p-4">
      <p className="text-sm font-semibold mb-1">
        {icon} {title}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {desc}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cmd({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="rounded-lg border p-3">
      <code className="text-sm font-mono font-medium text-primary">{cmd}</code>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b last:border-0 py-3 first:pt-0">
      <p className="text-sm font-semibold">{q}</p>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a}</p>
    </div>
  );
}
