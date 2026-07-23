'use client';

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-mono text-sm leading-relaxed">
      <style>{`
        .docs h1 { font-size: 1.5rem; font-weight: 700; margin: 2.5rem 0 0.5rem; letter-spacing: -0.02em; }
        .docs h1:first-child { margin-top: 0; }
        .docs h2 { font-size: 1.15rem; font-weight: 600; margin: 2rem 0 0.35rem; letter-spacing: -0.01em; }
        .docs h3 { font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.3rem; }
        .docs p { margin: 0.4rem 0; opacity: 0.85; }
        .docs ul, .docs ol { padding-left: 1.25rem; margin: 0.35rem 0; }
        .docs li { margin: 0.2rem 0; opacity: 0.85; }
        .docs code { background: rgba(128,128,128,0.12); padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.9em; }
        .docs pre { background: rgba(128,128,128,0.08); padding: 0.9em 1em; border-radius: 6px; overflow-x: auto; margin: 0.5rem 0; font-size: 0.85rem; }
        .docs pre code { background: none; padding: 0; }
        .docs hr { border: none; border-top: 1px solid rgba(128,128,128,0.15); margin: 2rem 0; }
        .docs table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.9em; }
        .docs th, .docs td { border: 1px solid rgba(128,128,128,0.15); padding: 0.5em 0.75em; text-align: left; }
        .docs th { background: rgba(128,128,128,0.06); font-weight: 600; }
        .docs .note { background: rgba(59,130,246,0.08); border-left: 3px solid #3b82f6; padding: 0.6em 1em; border-radius: 0 6px 6px 0; margin: 0.75rem 0; font-size: 0.9em; }
      `}</style>

      <div className="docs">
        <h1>NexusDo Documentation</h1>
        <p>NexusDo is a task and todo manager with a web dashboard and an optional Telegram bot for reminders and quick capture on the go.</p>

        <hr />

        <h2>Getting Started</h2>

        <h3>Create an Account</h3>
        <p>On the home page, click <strong>Create Free Account</strong>. You&apos;ll get an <strong>API key</strong> — save it somewhere safe. This key is your only way to sign in.</p>

        <h3>Sign In</h3>
        <p>Enter your API key on the home page and click <strong>Sign In</strong>. Your session lasts 90 days before you need to sign in again.</p>

        <div className="note">
          If you lose your API key, you won&apos;t be able to access your account. There is no password reset. If you still have an active session, you can rotate your key from the Settings page or via Telegram.
        </div>

        <hr />

        <h2>Web Dashboard</h2>

        <h3>Tasks</h3>
        <p>Tasks have a <strong>reminder date and time</strong>. You can also make them <strong>recurring</strong> (daily, weekly, or weekdays).</p>
        <ul>
          <li><strong>Add a task</strong> — enter the action, pick a date/time (or leave blank for recurring), and optionally set recurrence</li>
          <li><strong>Edit a task</strong> — hover and click the pencil icon to change the action, date, or recurrence</li>
          <li><strong>Complete / uncomplete</strong> — click the checkbox to toggle</li>
          <li><strong>Delete a task</strong> — click the trash icon</li>
          <li><strong>Clean up</strong> — removes all completed tasks at once</li>
          <li><strong>Search</strong> — use the search bar at the top to filter tasks and todos by keyword</li>
        </ul>

        <h3>Todos</h3>
        <p>Todos are simple checklists organized by <strong>category</strong>. No due dates — just things you need to do.</p>
        <ul>
          <li><strong>Add a todo</strong> — enter the action and a category label, then click Create</li>
          <li><strong>Edit a todo</strong> — hover and click the pencil icon to change the action or category</li>
          <li><strong>Toggle a todo</strong> — click the checkbox to mark it done/pending</li>
          <li><strong>Delete a todo</strong> — click the trash icon</li>
          <li><strong>Clean up</strong> — removes all completed todos at once</li>
        </ul>

        <h3>Settings</h3>
        <ul>
          <li><strong>View your API key</strong> — your current key is shown on the Settings page</li>
          <li><strong>Rotate your API key</strong> — generates a new key. The old key stops working immediately. Save the new one.</li>
          <li><strong>Telegram status</strong> — shows whether you&apos;ve linked a Telegram account</li>
        </ul>

        <hr />

        <h2>Telegram Bot</h2>
        <p>NexusDo has a Telegram bot that lets you manage tasks and todos directly from Telegram. It also sends you <strong>reminders</strong> when tasks are due.</p>

        <h3>Linking Your Account</h3>
        <ol>
          <li>Find the bot on Telegram: <strong>@NexusDoBot</strong></li>
          <li>Send <code>/start YOUR_API_KEY YOUR_UTC_OFFSET</code></li>
          <li>Example: <code>/start a1b2c3f4... +0630</code> (for Myanmar, UTC+6:30)</li>
          <li>The bot will confirm the link. Your Telegram account is now connected.</li>
        </ol>

        <div className="note">
          The <strong>UTC offset</strong> is required so the bot knows your local timezone for reminders. Common offsets: <code>+0630</code> (Myanmar), <code>+0530</code> (India), <code>+0800</code> (Singapore/China), <code>-0500</code> (US Eastern), <code>0</code> or <code>+0000</code> (UTC). Your API key is available on the <strong>Settings</strong> page in the web dashboard.
        </div>

        <h3>Commands</h3>

        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>/start &lt;key&gt; &lt;offset&gt;</code></td>
              <td>Link your account and set your timezone</td>
              <td><code>/start a1b2c3... +0630</code></td>
            </tr>
            <tr>
              <td><code>/addtask &lt;date&gt; &lt;time&gt; &lt;action&gt;</code></td>
              <td>Create a task with a reminder</td>
              <td><code>/addtask 2026-08-01 14:30 Buy groceries</code></td>
            </tr>
            <tr>
              <td><code>/addrecurring &lt;daily|weekly|weekdays&gt; &lt;HH:mm&gt; &lt;action&gt;</code></td>
              <td>Create a recurring task</td>
              <td><code>/addrecurring daily 09:00 Standup meeting</code></td>
            </tr>
            <tr>
              <td><code>/edittask &lt;id&gt; &lt;date&gt; &lt;time&gt; &lt;action&gt;</code></td>
              <td>Edit an existing task</td>
              <td><code>/edittask 3 2026-08-01 15:00 Updated groceries</code></td>
            </tr>
            <tr>
              <td><code>/tasks</code></td>
              <td>List all pending tasks with IDs</td>
              <td><code>/tasks</code></td>
            </tr>
            <tr>
              <td><code>/donetask &lt;id&gt;</code></td>
              <td>Mark a task as completed</td>
              <td><code>/donetask 3</code></td>
            </tr>
            <tr>
              <td><code>/cleantasks</code></td>
              <td>Delete all completed tasks</td>
              <td><code>/cleantasks</code></td>
            </tr>
            <tr>
              <td><code>/addtodo &lt;action&gt; #&lt;category&gt;</code></td>
              <td>Create a todo with a category</td>
              <td><code>/addtodo Review the PR #Work</code></td>
            </tr>
            <tr>
              <td><code>/edittodo &lt;id&gt; &lt;action&gt; #&lt;category&gt;</code></td>
              <td>Edit an existing todo</td>
              <td><code>/edittodo 2 Updated action #Work</code></td>
            </tr>
            <tr>
              <td><code>/todos</code></td>
              <td>List all todos (tap to toggle)</td>
              <td><code>/todos</code></td>
            </tr>
            <tr>
              <td><code>/donetodo &lt;id&gt;</code></td>
              <td>Mark a todo as completed</td>
              <td><code>/donetodo 1</code></td>
            </tr>
            <tr>
              <td><code>/cleantodos</code></td>
              <td>Delete all completed todos</td>
              <td><code>/cleantodos</code></td>
            </tr>
            <tr>
              <td><code>/rotatekey</code></td>
              <td>Generate a new API key (old key becomes invalid)</td>
              <td><code>/rotatekey</code></td>
            </tr>
          </tbody>
        </table>

        <h3>Reminders</h3>
        <p>When a task&apos;s reminder time arrives, the bot sends you a message with the task details. If the task is a <strong>one-time task</strong>, it is automatically marked as completed after the reminder is sent. <strong>Recurring tasks</strong> are not marked complete — they automatically reschedule to the next occurrence.</p>

        <h3>Date Format</h3>
        <p>Tasks use the format: <code>YYYY-MM-DD HH:mm</code> (24-hour time). Examples:</p>
        <pre><code>{`/addtask 2026-12-25 09:00 Open presents
/addtask 2026-07-30 17:30 Call dentist`}</code></pre>

        <hr />

        <h2>Tips</h2>
        <ul>
          <li><strong>Use Telegram for quick capture</strong> — add tasks and todos on the go with your phone</li>
          <li><strong>Use the web for review</strong> — the dashboard gives you a full overview of everything</li>
          <li><strong>Recurring tasks</strong> — perfect for standups, workouts, daily habits. Use /addrecurring or the dropdown in the task form.</li>
          <li><strong>Search bar</strong> — filter your tasks and todos by keyword to find what you need fast</li>
          <li><strong>Set reminders for important deadlines</strong> — the bot will ping you at the exact time</li>
          <li><strong>Todo categories</strong> help you organize — use tags like #Work, #Personal, #Shopping</li>
          <li><strong>Rotate your key</strong> if you accidentally shared it — old key stops working immediately</li>
        </ul>
      </div>
    </div>
  );
}
