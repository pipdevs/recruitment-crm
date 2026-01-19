import { CheckSquare } from 'lucide-react';

export function Tasks() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">Manage your tasks and to-dos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <CheckSquare className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tasks Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Create tasks to keep track of your recruitment activities and follow-ups.
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
