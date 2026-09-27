import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.org');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://survey-platform-api.nazeersoft.workers.dev/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white p-12 flex-col justify-between">
        <div>
          <div className="text-4xl font-black tracking-tight mb-2">Survey</div>
          <div className="text-4xl font-black tracking-tight">Platform</div>
        </div>
        
        <div className="space-y-8">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-3">Features</div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-900">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Enterprise Security</div>
                  <div className="text-sm text-blue-100">PBKDF2-SHA256 hashing, JWT tokens</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-900">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Public Survey Collection</div>
                  <div className="text-sm text-blue-100">No login required, real-time tracking</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-900">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Real-Time Analytics</div>
                  <div className="text-sm text-blue-100">Live response tracking, district distribution</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-900">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Global Infrastructure</div>
                  <div className="text-sm text-blue-100">Cloudflare 200+ edge locations, 99.9% uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-200">
          Survey Platform v1.0 • Enterprise Edition
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Welcome back</h1>
            <p className="text-lg text-gray-600">Sign in to your research console</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.org"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <span className="text-red-600 font-bold text-lg flex-shrink-0">!</span>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New user?</span>
            </div>
          </div>

          <Link
            to="/signup"
            className="block w-full py-3 px-4 text-center rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
          >
            Create account
          </Link>

          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">Demo credentials</p>
            <p className="text-sm text-gray-700 font-mono">admin@example.org</p>
            <p className="text-sm text-gray-700 font-mono">ChangeMe123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
