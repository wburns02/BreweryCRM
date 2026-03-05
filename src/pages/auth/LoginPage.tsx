import { useState } from 'react';
import { Beer } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onDemoMode: () => void;
}

export default function LoginPage({ onLogin, onDemoMode }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brewery-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Beer className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Bearded Hop</h1>
          </div>
          <p className="text-brewery-400">Brewery Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brewery-900 border border-brewery-800 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-brewery-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-brewery-800 border border-brewery-700 rounded-lg text-white placeholder-brewery-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="admin@beardedhop.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brewery-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-brewery-800 border border-brewery-700 rounded-lg text-white placeholder-brewery-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brewery-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-brewery-900 text-brewery-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDemoMode}
            className="w-full py-2.5 bg-brewery-800 hover:bg-brewery-700 text-brewery-300 hover:text-white font-medium rounded-lg transition-colors border border-brewery-700"
          >
            Explore Demo
          </button>
        </form>
      </div>
    </div>
  );
}
