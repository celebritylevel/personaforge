'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function LandingPagesPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [domainConfig, setDomainConfig] = useState<any>(null);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);

  const [domainForm, setDomainForm] = useState({
    primaryDomain: '',
    edgeDomain: '',
    businessEmail: '',
    businessAddress: ''
  });

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    if (selectedCreator) {
      fetchDomainConfig(selectedCreator.id);
      fetchLandingPages(selectedCreator.id);
      const creatorPersonas = selectedCreator.personas || [];
      setPersonas(creatorPersonas);
    }
  }, [selectedCreator]);

  async function fetchCreators() {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setCreators(data);
    } catch (e) {
      console.error('Failed to fetch creators:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDomainConfig(creatorId: string) {
    try {
      const res = await fetch(`/api/domain-config?creatorId=${creatorId}`);
      const data = await res.json();
      setDomainConfig(data);
      if (data) {
        setDomainForm({
          primaryDomain: data.primaryDomain || '',
          edgeDomain: data.edgeDomain || '',
          businessEmail: data.businessEmail || '',
          businessAddress: data.businessAddress || ''
        });
      } else {
        setDomainForm({
          primaryDomain: '',
          edgeDomain: '',
          businessEmail: '',
          businessAddress: ''
        });
      }
    } catch (e) {
      console.error('Failed to fetch domain config:', e);
    }
  }

  async function fetchLandingPages(creatorId: string) {
    try {
      const res = await fetch(`/api/landing-pages?creatorId=${creatorId}`);
      const data = await res.json();
      setLandingPages(data);
    } catch (e) {
      console.error('Failed to fetch landing pages:', e);
    }
  }

  async function saveDomainConfig() {
    if (!selectedCreator) return;
    try {
      await fetch('/api/domain-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          ...domainForm
        })
      });
      fetchDomainConfig(selectedCreator.id);
    } catch (e) {
      console.error('Failed to save domain config:', e);
    }
  }

  async function generatePages() {
    if (!selectedCreator) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          creatorId: selectedCreator.id,
          personaIds: selectedPersonas,
          generateCoaching: true,
          generateQuiz: true,
          domainConfig: domainForm
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchLandingPages(selectedCreator.id);
        setShowGenerator(false);
        setSelectedPersonas([]);
      }
    } catch (e) {
      console.error('Failed to generate pages:', e);
    } finally {
      setGenerating(false);
    }
  }

  async function deletePage(pageId: string) {
    if (!confirm('Delete this landing page?')) return;
    try {
      await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: pageId })
      });
      fetchLandingPages(selectedCreator.id);
    } catch (e) {
      console.error('Failed to delete page:', e);
    }
  }

  function togglePersona(personaId: string) {
    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  }

  if (selectedPage) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar researchHistory={[]} selectedResearchId={null} onSelectResearch={() => {}} currentPage="/landing-pages" />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setSelectedPage(null)}
              className="mb-4 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Back to Landing Pages
            </button>
            <LandingPageEditor page={selectedPage} onUpdate={() => fetchLandingPages(selectedCreator.id)} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar researchHistory={[]} selectedResearchId={null} onSelectResearch={() => {}} currentPage="/landing-pages" />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Landing Pages</h1>

          {!selectedCreator ? (
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">Select a Creator</h2>
              {loading ? (
                <p className="text-[var(--muted)]">Loading creators...</p>
              ) : creators.length === 0 ? (
                <p className="text-[var(--muted)]">No creators found. Analyze an OnlyFans URL first.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {creators.map((creator) => (
                    <button
                      key={creator.id}
                      onClick={() => setSelectedCreator(creator)}
                      className="flex items-center gap-4 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors text-left"
                    >
                      {creator.avatar && (
                        <img src={creator.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{creator.name || `@${creator.username}`}</p>
                        <p className="text-sm text-[var(--muted)]">@{creator.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedCreator.avatar && (
                    <img src={selectedCreator.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{selectedCreator.name || `@${selectedCreator.username}`}</h2>
                    <p className="text-sm text-[var(--muted)]">@{selectedCreator.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Change Creator
                </button>
              </div>

              <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold mb-4">Domain Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--muted)] mb-1">Primary Domain</label>
                    <input
                      type="text"
                      value={domainForm.primaryDomain}
                      onChange={(e) => setDomainForm({ ...domainForm, primaryDomain: e.target.value })}
                      placeholder="elliemayees.com"
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--muted)] mb-1">Edge Domain</label>
                    <input
                      type="text"
                      value={domainForm.edgeDomain}
                      onChange={(e) => setDomainForm({ ...domainForm, edgeDomain: e.target.value })}
                      placeholder="elliemayees.pages.dev"
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--muted)] mb-1">Business Email</label>
                    <input
                      type="email"
                      value={domainForm.businessEmail}
                      onChange={(e) => setDomainForm({ ...domainForm, businessEmail: e.target.value })}
                      placeholder="support@elliemayees.com"
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--muted)] mb-1">Business Address</label>
                    <input
                      type="text"
                      value={domainForm.businessAddress}
                      onChange={(e) => setDomainForm({ ...domainForm, businessAddress: e.target.value })}
                      placeholder="123 Business St, City, ST 12345"
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    />
                  </div>
                </div>
                <button
                  onClick={saveDomainConfig}
                  className="mt-4 px-4 py-2 bg-[var(--primary)] text-black rounded-lg font-medium"
                >
                  Save Domain Config
                </button>
              </div>

              <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Landing Pages ({landingPages.length})</h3>
                  <button
                    onClick={() => setShowGenerator(!showGenerator)}
                    className="px-4 py-2 bg-[var(--primary)] text-black rounded-lg font-medium"
                  >
                    Generate Pages
                  </button>
                </div>

                {showGenerator && (
                  <div className="mb-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <h4 className="font-medium mb-3">Select Personas</h4>
                    {personas.length === 0 ? (
                      <p className="text-[var(--muted)]">No personas found for this creator.</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {personas.map((persona, i) => (
                            <label
                              key={i}
                              className="flex items-center gap-2 p-2 rounded border border-[var(--border)] cursor-pointer hover:border-[var(--primary)]"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPersonas.includes(persona.id || `persona-${i}`)}
                                onChange={() => togglePersona(persona.id || `persona-${i}`)}
                                className="rounded"
                              />
                              <span className="text-sm">{persona.name}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={generatePages}
                          disabled={generating || selectedPersonas.length === 0}
                          className="px-4 py-2 bg-[var(--primary)] text-black rounded-lg font-medium disabled:opacity-50"
                        >
                          {generating ? 'Generating...' : 'Generate Coaching & Quiz Pages'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {landingPages.length === 0 ? (
                  <p className="text-[var(--muted)]">No landing pages yet. Click "Generate Pages" to create some.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-[var(--muted)] border-b border-[var(--border)]">
                          <th className="pb-2">Persona</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Slug</th>
                          <th className="pb-2">Meta-Safe</th>
                          <th className="pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landingPages.map((page) => (
                          <tr key={page.id} className="border-b border-[var(--border)]">
                            <td className="py-3">{page.persona_name || '-'}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 text-xs rounded ${page.type === 'coaching' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                {page.type}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-sm">/{page.slug}</td>
                            <td className="py-3">
                              {page.metaSafe ? (
                                <span className="text-green-400">✓ Safe</span>
                              ) : (
                                <span className="text-red-400">⚠ Issues</span>
                              )}
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedPage(page)}
                                  className="text-[var(--primary)] hover:underline text-sm"
                                >
                                  View/Edit
                                </button>
                                <button
                                  onClick={() => deletePage(page.id)}
                                  className="text-red-400 hover:underline text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function LandingPageEditor({ page, onUpdate }: { page: any; onUpdate: () => void }) {
  const [spec, setSpec] = useState(page.spec);
  const [saving, setSaving] = useState(false);

  async function saveSpec() {
    setSaving(true);
    try {
      await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: page.id, spec })
      });
      onUpdate();
    } catch (e) {
      console.error('Failed to save:', e);
    } finally {
      setSaving(false);
    }
  }

  function updateHero(field: string, value: string) {
    setSpec({ ...spec, hero: { ...spec.hero, [field]: value } });
  }

  function updateSection(index: number, updates: any) {
    const newSections = [...spec.sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSpec({ ...spec, sections: newSections });
  }

  function updateFooter(field: string, value: any) {
    setSpec({ ...spec, footer: { ...spec.footer, [field]: value } });
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/5">
          <h1 className="text-2xl font-bold">{spec.hero.headline}</h1>
          <p className="text-[var(--muted)] mt-2">{spec.hero.subheadline}</p>
          <button className="mt-4 px-6 py-2 bg-[var(--primary)] text-black rounded-lg font-medium">
            {spec.hero.primaryCta.label}
          </button>
        </div>

        <div className="p-4 space-y-6">
          {spec.sections.map((section: any, i: number) => (
            <div key={i} className="border-t border-[var(--border)] pt-4">
              <h3 className="font-semibold mb-2">{section.title}</h3>
              
              {section.type === 'benefits' && (
                <ul className="space-y-2">
                  {section.bullets.map((bullet: string, j: number) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-[var(--primary)]">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {section.type === 'how_it_works' && (
                <ol className="space-y-2">
                  {section.steps.map((step: string, j: number) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-[var(--primary)] font-bold">{j + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}

              {section.type === 'about' && (
                <p className="text-[var(--muted)]">{section.body}</p>
              )}

              {section.type === 'quiz' && (
                <div className="space-y-4">
                  <p className="text-[var(--muted)]">{section.intro}</p>
                  {section.questions.map((q: any, j: number) => (
                    <div key={j} className="p-3 bg-[var(--background)] rounded-lg">
                      <p className="font-medium mb-2">{q.question}</p>
                      <div className="space-y-1">
                        {q.options.map((opt: string, k: number) => (
                          <div key={k} className="p-2 border border-[var(--border)] rounded text-sm">{opt}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'lead_capture' && (
                <div className="p-4 bg-[var(--background)] rounded-lg">
                  <p className="mb-2">{section.body}</p>
                  <input type="email" placeholder="Enter your email" className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded mb-2" />
                  <p className="text-xs text-[var(--muted)] mb-2">{section.consentText}</p>
                  <button className="w-full py-2 bg-[var(--primary)] text-black rounded font-medium">{section.submitLabel}</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-[var(--background)] border-t border-[var(--border)] text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">{spec.footer.brandName}</p>
          <p>{spec.footer.businessEmail}</p>
          <p>{spec.footer.businessAddress}</p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-[var(--primary)]">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--primary)]">Terms of Service</a>
            <a href="#" className="hover:text-[var(--primary)]">Contact</a>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <h3 className="font-semibold mb-3">Hero Section</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Headline</label>
              <input
                type="text"
                value={spec.hero.headline}
                onChange={(e) => updateHero('headline', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Subheadline</label>
              <textarea
                value={spec.hero.subheadline}
                onChange={(e) => updateHero('subheadline', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">CTA Label</label>
              <input
                type="text"
                value={spec.hero.primaryCta.label}
                onChange={(e) => updateHero('primaryCta', { ...spec.hero.primaryCta, label: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <h3 className="font-semibold mb-3">Footer</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Brand Name</label>
              <input
                type="text"
                value={spec.footer.brandName}
                onChange={(e) => updateFooter('brandName', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Business Email</label>
              <input
                type="email"
                value={spec.footer.businessEmail}
                onChange={(e) => updateFooter('businessEmail', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Business Address</label>
              <input
                type="text"
                value={spec.footer.businessAddress}
                onChange={(e) => updateFooter('businessAddress', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded"
              />
            </div>
          </div>
        </div>

        <button
          onClick={saveSpec}
          disabled={saving}
          className="w-full py-3 bg-[var(--primary)] text-black rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
