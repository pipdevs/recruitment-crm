import { Users } from 'lucide-react';

export function Candidates() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates</h1>
        <p className="text-gray-600">Manage your candidate pipeline</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Start building your candidate database by adding new candidates to your pipeline.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Add Candidate
          </button>
        </div>
      </div>
    </div>
  );
}
