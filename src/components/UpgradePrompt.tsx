import { Lock } from 'lucide-react';

interface UpgradePromptProps {
  title: string;
  description: string;
  compact?: boolean;
}

export function UpgradePrompt({ title, description, compact = false }: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">{title}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-amber-200 p-12 text-center">
      <div className="bg-amber-100 p-4 rounded-full inline-block mb-4">
        <Lock className="w-8 h-8 text-amber-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>
      
        href="/billing"
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
      <a>
        Upgrade to Pro →
      </a>
    </div>
  );
}