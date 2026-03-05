'use client';

import { useState } from 'react';

export default function ICPDiscovery() {
  const [productDescription, setProductDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
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
      setResult(research);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
      <h2 className="text-xl font-semibold text-[#ededed] mb-2">ICP Discovery</h2>
      <p className="text-[#737373] text-sm mb-6">Enter a product description or website URL to discover your ideal customer personas</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#ededed] mb-2">Product Description</label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="e.g., 19 yo OnlyFans creator from US, or A SaaS tool for email marketing..."
            className="w-full h-24 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#ededed] placeholder-[#737373] focus:outline-none focus:border-[#3ecf8e] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#ededed] mb-2">Website URL (Optional)</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g., https://onlyfans.com/creator or your product website"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#ededed] placeholder-[#737373] focus:outline-none focus:border-[#3ecf8e] transition-colors"
          />
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading || (!productDescription && !website)}
          className="w-full py-3 px-4 bg-[#3ecf8e] hover:bg-[#2ea97a] disabled:bg-[#737373] disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
        >
          {isLoading ? 'Researching ICP...' : 'Discover Personas'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-[#3ecf8e] mb-2">Found {result.personas?.length || 0} Personas</h3>
          <p className="text-sm text-[#737373]">Switch to the Ad Angles tab to generate creatives</p>
        </div>
      )}
    </div>
  );
}
