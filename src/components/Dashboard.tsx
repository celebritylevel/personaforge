'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ICPDiscovery from '@/components/ICPDiscovery';
import PersonasList from '@/components/PersonasList';
import AnglesGenerator from '@/components/AnglesGenerator';
import OverviewPage from '@/components/OverviewPage';

export default function Dashboard() {
  const [researchHistory, setResearchHistory] = useState<any[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<any | null>(null);
  const [angles, setAngles] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [creatorUrl, setCreatorUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const handleCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorUrl.trim()) return;
    
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: creatorUrl.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
      
      setProfile(data);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProfileLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'discovery', label: 'ICP Discovery' },
    { id: 'angles', label: 'Ad Angles' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar
        researchHistory={researchHistory}
        selectedResearchId={selectedResearch?.id || null}
        onSelectResearch={() => {}}
        currentPage="/"
      />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <form onSubmit={handleCreatorSubmit} className="flex gap-3">
              <input
                type="text"
                value={creatorUrl}
                onChange={(e) => setCreatorUrl(e.target.value)}
                placeholder="Enter OnlyFans or Fanvue URL..."
                className="flex-1 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <button
                type="submit"
                disabled={profileLoading || !creatorUrl.trim()}
                className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/80 disabled:bg-[var(--muted)] disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
              >
                {profileLoading ? 'Loading...' : 'Analyze'}
              </button>
            </form>
            {profileError && (
              <p className="mt-2 text-sm text-red-400">{profileError}</p>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--primary)] text-black'
                    : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <OverviewPage profile={profile} />}

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