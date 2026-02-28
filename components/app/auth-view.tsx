'use client';

import { useState } from 'react';

interface AuthViewProps {
  onAuthenticated: (username: string) => void;
}

export const AuthView = ({ onAuthenticated, ref }: React.ComponentProps<'div'> & AuthViewProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Pass the username to the agent so it knows what to call the user
        onAuthenticated(username);
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
      className="fixed inset-0 h-full w-full bg-[#edf5fa] flex flex-col items-center justify-center px-4"
    >
      <section className="relative z-10 flex h-full flex-col items-center justify-center w-full">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-gray-100">
          
          <div className="mb-8 flex flex-col items-center text-center">
            <img 
              src="https://customer.health4travel.com/static/media/h4tLogo.3b3f9bb3bc531faa471910633d743d52.svg" 
              alt="Health4Travel Logo" 
              className="h-10 mb-4" 
            />
            <h2 className="text-2xl font-bold text-[#183a59]">
              Smart Clinic Portal
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to access your AI Assistant
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-[#183a59] uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-[#183a59] focus:ring-2 focus:ring-[#edf5fa] focus:bg-white outline-none transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#183a59] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-[#183a59] focus:ring-2 focus:ring-[#edf5fa] focus:bg-white outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#183a59] text-white py-3.5 rounded-xl font-bold hover:bg-[#112940] transition-colors shadow-lg shadow-[#183a59]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </section>

      {/* Bottom footer */}
      <div className="fixed bottom-6 left-0 z-10 flex w-full items-center justify-center px-4">
        <p className="text-xs font-medium text-gray-500">
          Powered by <span className="font-bold text-[#183a59]">Health4Travel</span>
        </p>
      </div>
    </div>
  );
};