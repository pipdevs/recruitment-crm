import { StickyNote } from 'lucide-react';

export function Notes() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes</h1>
        <p className="text-gray-600">View and manage all your notes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-yellow-100 p-4 rounded-full mb-4">
            <StickyNote className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notes Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Add notes to candidates, companies, or jobs to keep important information organized.
          </p>
          <button className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors">
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
