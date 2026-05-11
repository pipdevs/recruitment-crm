import { useState, useEffect } from 'react';
import {
  Plus, Search, Trash2, Pencil, TrendingUp,
  DollarSign, CheckCircle, Clock, FileText, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { placementsService } from '../services/placements';
import { supabase } from '../lib/supabase';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { UpgradePrompt } from '../components/UpgradePrompt';

type FeeStatus = 'Pending' | 'Invoiced' | 'Paid';

const FEE_STATUS_COLORS: Record<FeeStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Invoiced: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
};

interface Placement {
  id: string;
  placement_date: string;
  start_date: string | null;
  salary: number | null;
  fee_amount: number | null;
  fee_percentage: number | null;
  fee_status: string;
  created_at: string | null;
  candidate_id: string;
  job_id: string;
  company_id: string;
  job_application_id: string;
  candidate?: { id: string; full_name: string; email: string | null } | null;
  job?: { id: string; title: string } | null;
  company?: { id: string; name: string } | null;
}

interface Summary {
  total: number;
  paid: number;
  pending: number;
  invoiced: number;
  count: number;
  thisMonth: number;
}

const fmt = (n: number) => new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'GBP', maximumFractionDigits: 0
}).format(n);

export function Placements() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, paid: 0, pending: 0, invoiced: 0, count: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeeStatus | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [data, sum] = await Promise.all([
        placementsService.getAll(),
        placementsService.getSummary(),
      ]);
      setPlacements(data as Placement[]);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load placements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this placement?')) return;
    try {
      await placementsService.delete(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete placement');
    }
  };

  const handleStatusChange = async (id: string, fee_status: FeeStatus) => {
    try {
      await placementsService.update(id, { fee_status });
      setPlacements(placements.map((p: Placement) => p.id === id ? { ...p, fee_status } : p));
      const sum = await placementsService.getSummary();
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const filtered = placements.filter((p: Placement) => {
    const matchesSearch =
      p.candidate?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.job?.title.toLowerCase().includes(search.toLowerCase()) ||
      p.company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.fee_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const limits = usePlanLimits();
  
  if (!limits.loading && !limits.canAccessPlacements) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Placements</h1>
        <p className="text-gray-600">Track placed candidates and recruitment fees</p>
      </div>
      <UpgradePrompt
        title="Placements & Fee Tracking is a Pro feature"
        description="Upgrade to Pro to track placements, record fees, and monitor your revenue pipeline."
      />
    </div>
  );
}

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Placements</h1>
          <p className="text-gray-600">Track placed candidates and recruitment fees</p>
        </div>
        <button
          onClick={() => { setSelectedPlacement(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Placement
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <span className="text-sm text-gray-600">Total Fees</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(summary.total)}</p>
          <p className="text-xs text-gray-500 mt-1">{summary.count} placements · {summary.thisMonth} this month</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <span className="text-sm text-gray-600">Paid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(summary.paid)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <span className="text-sm text-gray-600">Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(summary.invoiced)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(summary.pending)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search placements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Pending', 'Invoiced', 'Paid'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-green-100 p-4 rounded-full mb-4 inline-block">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Placements Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Record a placement when a candidate is successfully placed in a role.
          </p>
          <button
            onClick={() => { setSelectedPlacement(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Placement
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Salary</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p: Placement) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{p.candidate?.full_name}</p>
                    <p className="text-xs text-gray-500">{p.candidate?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.job?.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.company?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {p.salary ? fmt(p.salary) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {p.fee_amount ? fmt(p.fee_amount) : '—'}
                    </p>
                    {p.fee_percentage && (
                      <p className="text-xs text-gray-500">{p.fee_percentage}%</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.fee_status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as FeeStatus)}
                      className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer ${FEE_STATUS_COLORS[p.fee_status as FeeStatus]}`}
                    >
                      {(['Pending', 'Invoiced', 'Paid'] as FeeStatus[]).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(p.placement_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setSelectedPlacement(p); setShowModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <PlacementModal
          placement={selectedPlacement}
          userId={user?.id || ''}
          onClose={() => { setShowModal(false); setSelectedPlacement(null); }}
          onSaved={() => { setShowModal(false); setSelectedPlacement(null); load(); }}
        />
      )}
    </div>
  );
}

// ── Placement Modal ───────────────────────────────────────
function PlacementModal({ placement, userId, onClose, onSaved }: {
  placement: Placement | null;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [candidateId, setCandidateId] = useState(placement?.candidate_id || '');
  const [jobId, setJobId] = useState(placement?.job_id || '');
  const [companyId, setCompanyId] = useState(placement?.company_id || '');
  const [jobApplicationId, setJobApplicationId] = useState(placement?.job_application_id || '');
  const [placementDate, setPlacementDate] = useState(placement?.placement_date || new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(placement?.start_date || '');
  const [salary, setSalary] = useState(placement?.salary?.toString() || '');
  const [feeAmount, setFeeAmount] = useState(placement?.fee_amount?.toString() || '');
  const [feePercentage, setFeePercentage] = useState(placement?.fee_percentage?.toString() || '');
  const [feeStatus, setFeeStatus] = useState<FeeStatus>((placement?.fee_status as FeeStatus) || 'Pending');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  // Auto-calculate fee when salary and percentage change
  useEffect(() => {
  if (salary && feePercentage) {
    const calculated = (parseFloat(salary) * parseFloat(feePercentage)) / 100;
    setFeeAmount(calculated.toFixed(0));
  }
}, [salary, feePercentage]);

  const loadApplications = async () => {
    const { data } = await supabase
      .from('job_applications')
      .select(`
        id, stage,
        candidate:candidate_id (id, full_name),
        job:job_id (id, title, company:company_id (id, name))
      `)
      .eq('stage', 'Placed');
    setApplications(data || []);
  };

  const handleApplicationSelect = (appId: string) => {
    setJobApplicationId(appId);
    const app = applications.find((a: any) => a.id === appId);
    if (app) {
      setCandidateId(app.candidate?.id || '');
      setJobId(app.job?.id || '');
      setCompanyId(app.job?.company?.id || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !jobId || !companyId || !jobApplicationId) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        candidate_id: candidateId,
        job_id: jobId,
        company_id: companyId,
        job_application_id: jobApplicationId,
        placement_date: placementDate,
        start_date: startDate || null,
        salary: salary ? parseFloat(salary) : null,
        fee_amount: feeAmount ? parseFloat(feeAmount) : null,
        fee_percentage: feePercentage ? parseFloat(feePercentage) : null,
        fee_status: feeStatus,
        created_by: userId,
      };
      if (placement) {
        await placementsService.update(placement.id, payload);
      } else {
        await placementsService.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save placement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {placement ? 'Edit Placement' : 'Add Placement'}
          </h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application (Placed stage) *
            </label>
            <select
              value={jobApplicationId}
              onChange={(e) => handleApplicationSelect(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select application...</option>
              {applications.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.candidate?.full_name} → {a.job?.title}
                  {a.job?.company?.name ? ` (${a.job.company.name})` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only applications at "Placed" stage are shown. Move an application to Placed first.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement Date *</label>
              <input
                type="date"
                value={placementDate}
                onChange={(e) => setPlacementDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary (£)</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee %</label>
              <input
                type="number"
                value={feePercentage}
                onChange={(e) => setFeePercentage(e.target.value)}
                placeholder="15"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount (£)</label>
              <input
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                placeholder="7500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-2">Fee amount auto-calculates from salary × percentage</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Status</label>
            <select
              value={feeStatus}
              onChange={(e) => setFeeStatus(e.target.value as FeeStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Invoiced">Invoiced</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

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
              disabled={loading || !jobApplicationId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : placement ? 'Save Changes' : 'Add Placement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}