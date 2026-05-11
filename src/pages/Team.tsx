import { useState, useEffect } from 'react';
import { Users, Mail, Trash2, Crown, Shield, User, Copy, Check, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/team';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { UpgradePrompt } from '../components/UpgradePrompt';

type UserRole = 'Admin' | 'Manager' | 'Recruiter';

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  Admin: <Crown className="w-3.5 h-3.5" />,
  Manager: <Shield className="w-3.5 h-3.5" />,
  Recruiter: <User className="w-3.5 h-3.5" />,
};

const ROLE_COLORS: Record<UserRole, string> = {
  Admin: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Recruiter: 'bg-gray-100 text-gray-700',
};

interface Member {
  id: string;
  full_name: string;
  role: string;
  created_at: string | null;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  token: string;
  created_at: string | null;
  expires_at: string | null;
}

export function Team() {
  const { user, profile, organisation } = useAuth();
  const limits = usePlanLimits();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const isAdmin = profile?.role === 'Admin';

  useEffect(() => {
    if (organisation?.id) load();
  }, [organisation]);

  const load = async () => {
    try {
      setLoading(true);
      const [membersData, invitesData] = await Promise.all([
        teamService.getMembers(organisation!.id),
        teamService.getInvites(organisation!.id),
      ]);
      setMembers(membersData || []);
      setInvites(invitesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm('Cancel this invite?')) return;
    try {
      await teamService.cancelInvite(id);
      setInvites(invites.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invite');
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      await teamService.updateMemberRole(memberId, role);
      setMembers(members.map(m => m.id === memberId ? { ...m, role } : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const getInviteLink = (token: string) => {
    return `${window.location.origin}/invite/${token}`;
  };

  const handleCopyLink = async (token: string) => {
    await navigator.clipboard.writeText(getInviteLink(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team</h1>
          <p className="text-gray-600">
            {organisation?.name} · {organisation?.plan} plan
          </p>
        </div>
        {isAdmin && (
          limits.members.reached ? (
            <UpgradePrompt
              compact
              title="Upgrade to Pro to invite team members"
              description=""
            />
          ) : (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Invite Member
            </button>
          )
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Members */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Members ({members.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-sm">
                        {member.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.full_name}
                        {member.id === user?.id && (
                          <span className="ml-2 text-xs text-gray-400">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {member.created_at ? new Date(member.created_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && member.id !== user?.id ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer flex items-center gap-1 ${ROLE_COLORS[member.role as UserRole]}`}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Recruiter">Recruiter</option>
                      </select>
                    ) : (
                      <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[member.role as UserRole]}`}>
                        {ROLE_ICONS[member.role as UserRole]}
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invites */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  Pending Invites ({invites.length})
                </h2>
              </div>
              {invites.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No pending invites
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invite.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[invite.role as UserRole]}`}>
                            {invite.role}
                          </span>
                          <span className="text-xs text-gray-400">
                            Expires {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(invite.token)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          {copiedToken === invite.token ? (
                            <><Check className="w-3.5 h-3.5 text-green-600" /> Copied</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                          )}
                        </button>
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showInviteModal && (
        <InviteModal
          organisationId={organisation!.id}
          invitedBy={user!.id}
          onClose={() => setShowInviteModal(false)}
          onInvited={(invite) => {
            setInvites([invite as Invite, ...invites]);
            setShowInviteModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Invite Modal ──────────────────────────────────────────
function InviteModal({ organisationId, invitedBy, onClose, onInvited }: {
  organisationId: string;
  invitedBy: string;
  onClose: () => void;
  onInvited: (invite: any) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Recruiter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const invite = await teamService.sendInvite(organisationId, email, role, invitedBy);
      onInvited(invite);
    } catch (err: any) {
      if (err?.code === '23505') {
        setError('An invite has already been sent to this email.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send invite');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="colleague@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Recruiter">Recruiter</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <p className="text-xs text-gray-500">
            An invite link will be generated. Share it with your colleague to join {' '}
            your organisation.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}