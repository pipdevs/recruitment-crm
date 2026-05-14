import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';

interface LoginProps {
  onToggleMode: () => void;
}

type Mode = 'login' | 'forgot' | 'forgot_sent';

export function Login({ onToggleMode }: LoginProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMode('forgot_sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="flex items-center justify-center mb-8">
            <div className="bg-teal-100 p-3 rounded-full">
              <LogIn className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-center text-gray-600 mb-8">Sign in to your RectoCRM account</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button onClick={onToggleMode} className="text-teal-600 font-medium hover:text-teal-700">
                    Sign up
                  </button>
                </p>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Reset Password</h2>
              <p className="text-center text-gray-600 mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  ← Back to sign in
                </button>
              </div>
            </>
          )}

          {/* EMAIL SENT MODE */}
          {mode === 'forgot_sent' && (
            <>
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full inline-block mb-6">
                  <span className="text-3xl">📬</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
                <p className="text-gray-600 mb-2">
                  We sent a password reset link to:
                </p>
                <p className="font-semibold text-gray-900 mb-6">{email}</p>
                <p className="text-sm text-gray-500 mb-8">
                  The link expires in 1 hour. Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-teal-600 font-medium hover:text-teal-700 text-sm"
                >
                  ← Back to sign in
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}