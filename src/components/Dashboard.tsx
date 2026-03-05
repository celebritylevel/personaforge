'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ICPDiscovery from '@/components/ICPDiscovery';
import PersonasList from '@/components/PersonasList';
import AnglesGenerator from '@/components/AnglesGenerator';

export default function Dashboard() {
  const [researchHistory, setResearchHistory] = useState<any[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<any | null>(null);
  const [angles, setAngles] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState('discovery');

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar
        researchHistory={researchHistory}
        selectedResearchId={selectedResearch?.id || null}
        onSelectResearch={() => {}}
      />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'discovery'
                  ? 'bg-[var(--primary)] text-black'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              ICP Discovery
            </button>
            <button
              onClick={() => setActiveTab('angles')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'angles'
                  ? 'bg-[var(--primary)] text-black'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Ad Angles
            </button>
          </div>

          {activeTab === 'discovery' && (
            <div className="space-y-6">
              <ICPDiscovery />
              {selectedResearch && <PersonasList personas={selectedResearch.personas} />}
            </div>
          )}

          {activeTab === 'angles' && <AnglesGenerator research={selectedResearch} />}
        </div>
      </main>
    </div>
  );
}
