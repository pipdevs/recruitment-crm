import { useAuth } from '../contexts/AuthContext';
import { Users, Building2, Briefcase, CheckSquare } from 'lucide-react';

export function Dashboard() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Active Candidates', value: '0', icon: Users, color: 'bg-blue-500' },
    { label: 'Companies', value: '0', icon: Building2, color: 'bg-green-500' },
    { label: 'Open Jobs', value: '0', icon: Briefcase, color: 'bg-orange-500' },
    { label: 'Pending Tasks', value: '0', icon: CheckSquare, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Tasks</h2>
          <p className="text-gray-500 text-center py-8">No upcoming tasks</p>
        </div>
      </div>
    </div>
  );
}
