'use client';

import Link from 'next/link';

export default function Sidebar({ researchHistory, selectedResearchId, onSelectResearch, currentPage }: { researchHistory: any; selectedResearchId: string | null; onSelectResearch: (id: string) => void; currentPage?: string }) {
  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/landing-pages', label: 'Landing Pages', icon: '🌐' },
  ];

  return (
    <aside className="w-64 bg-[#161616] border-r border-[#2a2a2a] h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold text-[#3ecf8e]">PersonaForge</h1>
        <p className="text-xs text-[#737373] mt-1">Meta Ads Creative Tool</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === item.href
                    ? 'bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e]'
                    : 'text-[#ededed] hover:bg-[#1a1a1a]'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#2a2a2a]">
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
