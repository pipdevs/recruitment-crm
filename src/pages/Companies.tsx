import { Building2 } from 'lucide-react';

export function Companies() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
        <p className="text-gray-600">Manage your company database</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Add companies to track your clients and prospects.
          </p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            Add Company
          </button>
        </div>
      </div>
    </div>
  );
}
