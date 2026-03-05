'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ICPDiscovery from '@/components/ICPDiscovery';
import PersonasList from '@/components/PersonasList';
import AnglesGenerator from '@/components/AnglesGenerator';
import { ICPResearch, AdAngle } from '@/types';

export default function Dashboard() {
  const [researchHistory, setResearchHistory] = useState<ICPResearch[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<ICPResearch | null>(null);
  const [angles, setAngles] = useState<AdAngle[] | null>(null);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [isLoadingAngles, setIsLoadingAngles] = useState(false);
  const [activeTab, setActiveTab] = useState<'discovery' | 'angles'>('discovery');

  useEffect(() => {
    fetchResearchHistory();
  }, []);

  const fetchResearchHistory = async () => {
    try {
      const response = await fetch('/api/icp');
      const data = await response.json();
      setResearchHistory(data);
    } catch (error) {
      console.error('Failed to fetch research history:', error);
    }
  };

  const handleResearchComplete = async (researchId: string) => {
    await fetchResearchHistory();
    const response = await fetch(`/api/icp/${researchId}`);
    if (response.ok) {
      const research = await response.json();
      setSelectedResearch(research);
      setSelectedPersonaIds(research.personas.map((p: { id: string }) => p.id));
      setActiveTab('angles');
    }
  };

  const handleSelectResearch = async (id: string) => {
    try {
      const response = await fetch(`/api/icp/${id}`);
      if (response.ok) {
        const research = await response.json();
        setSelectedResearch(research);
        setSelectedPersonaIds(research.personas.map((p: { id: string }) => p.id));
        
        const anglesResponse = await fetch(`/api/angles?icpResearchId=${id}`);
        if (anglesResponse.ok) {
          const anglesData = await anglesResponse.json();
          setAngles(anglesData.angles);
        } else {
          setAngles(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch research:', error);
    }
  };

  const handleTogglePersona = (personaId: string) => {
    setSelectedPersonaIds((prev) =>
      prev.includes(personaId)
        ? prev.filter((id) => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleGenerateAngles = async () => {
    if (!selectedResearch) return;
    
    setIsLoadingAngles(true);
    try {
      const response = await fetch('/api/angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icpResearchId: selectedResearch.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAngles(data.angles);
      }
    } catch (error) {
      console.error('Failed to generate angles:', error);
    } finally {
      setIsLoadingAngles(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar
        researchHistory={researchHistory}
        selectedResearchId={selectedResearch?.id || null}
        onSelectResearch={handleSelectResearch}
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
              <ICPDiscovery onResearchComplete={handleResearchComplete} />
              
              {selectedResearch && (
                <PersonasList
                  personas={selectedResearch.personas}
                  selectedPersonaIds={selectedPersonaIds}
                  onTogglePersona={handleTogglePersona}
                />
              )}
            </div>
          )}

          {activeTab === 'angles' && (
            <AnglesGenerator
              research={selectedResearch}
              angles={angles}
              onGenerateAngles={handleGenerateAngles}
              isLoading={isLoadingAngles}
            />
          )}
        </div>
      </main>
    </div>
  );
}
