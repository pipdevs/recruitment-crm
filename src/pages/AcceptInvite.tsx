import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../services/team';
import { supabase } from '../lib/supabase';

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token) loadInvite(token);
  }, [token]);

  const loadInvite = async (token: string) => {
    console.log('Loading invite for token:', token);
    try {
      const data = await teamService.getInviteByToken(token);
          console.log('Invite data:', data);
      if (!data) throw new Error('Invite not found or already used');
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('This invite has expired');
    }
      setInvite(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite || !token) return;
    setSubmitting(true);
    setError('');

    try {
      // 1. Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Failed to create account');

      // 2. Create profile linked to the organisation BEFORE auth state fires
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: data.user.id,
          full_name: fullName,
          role: invite.role,
          organisation_id: invite.organisation_id,
        }]);
      if (profileError) throw profileError;

      // 3. Mark invite as accepted
      await supabase
        .from('invites')
        .update({ accepted: true })
        .eq('token', token);

      // 4. Sign in immediately so auth state has the right user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invite.email,
        password,
      });
      if (signInError) throw signInError;

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center">
          <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">You're invited!</h1>
          <p className="text-gray-600 text-sm">
            Join <span className="font-semibold">{invite?.organisation?.name}</span> on SimplyCRM
            as a <span className="font-semibold">{invite?.role}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleAccept} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={invite?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Jane Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Choose a Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {submitting ? 'Setting up your account...' : 'Accept Invite & Join'}
          </button>
        </form>
      </div>
    </div>
  );
}