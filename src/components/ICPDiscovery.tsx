'use client';

import { useState } from 'react';

interface ICPDiscoveryProps {
  onResearchComplete: (researchId: string) => void;
}

export default function ICPDiscovery({ onResearchComplete }: ICPDiscoveryProps) {
  const [productDescription, setProductDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productDescription, website }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to research ICP');
      }

      const research = await response.json();
      onResearchComplete(research.id);
      setProductDescription('');
      setWebsite('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
        ICP Discovery
      </h2>
      <p className="text-[var(--muted)] text-sm mb-6">
        Enter a product description or website URL to discover your ideal customer personas
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Product Description
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="e.g., 19 yo OnlyFans creator from US, or A SaaS tool for email marketing..."
            className="w-full h-24 px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Website URL (Optional)
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g., https://onlyfans.com/creator or your product website"
            className="w-full px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!productDescription && !website)}
          className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--muted)] disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Researching ICP...
            </span>
          ) : (
            'Discover Personas'
          )}
        </button>
      </form>
    </div>
  );
}
