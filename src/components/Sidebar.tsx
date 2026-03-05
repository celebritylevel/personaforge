'use client';

export default function Sidebar({ researchHistory, selectedResearchId, onSelectResearch }: { researchHistory: any; selectedResearchId: string | null; onSelectResearch: (id: string) => void }) {
  return (
    <aside className="w-64 bg-[#161616] border-r border-[#2a2a2a] h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold text-[#3ecf8e]">PersonaForge</h1>
        <p className="text-xs text-[#737373] mt-1">Meta Ads Creative Tool</p>
      </div>
      
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#737373] mb-3 uppercase tracking-wider">Recent Research</h2>
        {(!researchHistory || researchHistory.length === 0) ? (
          <p className="text-sm text-[#737373]">No research yet</p>
        ) : (
          <div className="space-y-2">
            {researchHistory.map((research: any) => (
              <button
                key={research.id}
                onClick={() => onSelectResearch(research.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedResearchId === research.id
                    ? 'bg-[#3ecf8e]/10 border border-[#3ecf8e]/30'
                    : 'bg-[#1a1a1a] hover:bg-[#1a1a1a]/80'
                }`}
              >
                <p className="text-sm font-medium text-[#ededed] truncate">{research.productDescription || research.website}</p>
                <p className="text-xs text-[#737373] mt-1">{research.personas?.length || 0} personas</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
