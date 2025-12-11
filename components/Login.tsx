import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: { name: string; email: string; role: string }) => void;
}

const extractNameFromEmail = (email: string) => {
  if (!email.includes('@')) return 'Guest';
  const local = email.split('@')[0];
  const parts = local.replace(/\./g, ' ').split(/[\W_]+/).filter(Boolean);
  const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  return name || 'Guest';
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const name = extractNameFromEmail(email);
    onLogin({ name, email, role: role || 'Role not set' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f9f7] px-4">
      <div className="bg-white border-2 border-ink shadow-sketch p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="font-serif italic text-2xl text-ink">Welcome to</p>
          <h1 className="text-4xl font-hand font-bold text-purple-900 mt-1">Picture Studio</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in with your Google email to continue</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-1">Google Email</label>
            <input
              type="email"
              required
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-1">Role (optional)</label>
            <input
              type="text"
              placeholder="e.g. Senior Dev"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border-2 border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-900 text-white font-hand text-xl font-bold py-3 border-2 border-purple-900 shadow-sketch hover:bg-purple-800 active:translate-y-0.5 transition-all"
          >
            Continue with Google
          </button>
        </form>

        <p className="text-[11px] text-gray-400 font-sans text-center">
          This demo accepts your Google email to personalize the experience. In production, connect a real Google OAuth flow.
        </p>
      </div>
    </div>
  );
};

