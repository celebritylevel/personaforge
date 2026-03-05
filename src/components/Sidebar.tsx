'use client';

import { ICPResearch } from '@/types';

interface SidebarProps {
  researchHistory: ICPResearch[];
  selectedResearchId: string | null;
  onSelectResearch: (id: string) => void;
}

export default function Sidebar({ researchHistory, selectedResearchId, onSelectResearch }: SidebarProps) {
  return (
    <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-bold text-[var(--primary)]">PersonaForge</h1>
        <p className="text-xs text-[var(--muted)] mt-1">Meta Ads Creative Tool</p>
      </div>
      
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[var(--muted)] mb-3 uppercase tracking-wider">
          Recent Research
        </h2>
        {researchHistory.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No research yet</p>
        ) : (
          <div className="space-y-2">
            {researchHistory.map((research) => (
              <button
                key={research.id}
                onClick={() => onSelectResearch(research.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedResearchId === research.id
                    ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                    : 'bg-[var(--secondary)] hover:bg-[var(--secondary)]/80'
                }`}
              >
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {research.productDescription || research.website}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {research.personas.length} personas
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
