'use client';

import { useState } from 'react';
import { Button } from '@/components/livekit/button';

interface AuthViewProps {
  onAuthenticated: (clientName: string) => void;
}

export const AuthView = ({ onAuthenticated, ref }: React.ComponentProps<'div'> & AuthViewProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          clientName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onAuthenticated(clientName);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={ref}
      className="fixed inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/welcome-bg-4.jpg')" }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/30" />

      <section className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-slate-800/95">
          <div className="mb-6 text-center">
            <h2 className="font-beachday text-3xl font-bold text-slate-800 dark:text-white">
              Welcome!
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Please sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label
                htmlFor="clientName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Your Name
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Enter your name"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Outer ring/border */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-indigo-200 via-purple-200 to-indigo-300 shadow-lg"></div>

              {/* Inner button */}
              <div className="relative m-[3px] transform rounded-lg bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600 px-6 py-3 shadow-inner transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98] group-disabled:scale-100">
                <span className="font-beachday text-lg tracking-wide text-white drop-shadow-md">
                  {loading ? 'Signing in...' : 'Sign In'}
                </span>
              </div>
            </button>
          </form>
        </div>
      </section>

      {/* Bottom footer */}
      <div className="fixed bottom-4 left-0 z-10 flex w-full items-center justify-center px-4">
        <div className="rounded-full bg-white/80 px-5 py-2.5 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
          <p className="text-xs font-medium text-slate-600 md:text-sm dark:text-slate-300">
            ✨ Powered by Veritas Learning Circle • Built for Students like you 💜
          </p>
        </div>
      </div>
    </div>
  );
};
