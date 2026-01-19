import { Briefcase } from 'lucide-react';

export function Jobs() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
        <p className="text-gray-600">Manage job postings and openings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Create job postings to start matching candidates with opportunities.
          </p>
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors">
            Add Job
          </button>
        </div>
      </div>
    </div>
  );
}
