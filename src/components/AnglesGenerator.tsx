'use client';

import { useState } from 'react';

export default function AnglesGenerator({ research }: { research: any }) {
  const [angles, setAngles] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAngle, setExpandedAngle] = useState<string | null>(null);

  if (!research) {
    return (
      <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6 text-center">
        <p className="text-[#737373]">Complete ICP Discovery first to generate ad angles</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icpResearchId: research.id }),
      });
      const data = await response.json();
      setAngles(data.angles);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-semibold text-[#ededed] mb-2">Generate Ad Angles</h2>
        <p className="text-[#737373] text-sm mb-6">Create Meta Ads creatives based on the discovered personas</p>

        <div className="p-4 bg-[#1a1a1a] rounded-lg mb-4">
          <p className="text-sm text-[#737373]"><span className="text-[#3ecf8e] font-medium">Product: </span>{research.productDescription}</p>
          <p className="text-sm text-[#737373] mt-1"><span className="text-[#3ecf8e] font-medium">Personas: </span>{research.personas?.length || 0} discovered</p>
        </div>

        <button onClick={handleGenerate} disabled={isLoading} className="w-full py-3 px-4 bg-[#3ecf8e] hover:bg-[#2ea97a] disabled:bg-[#737373] disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors">
          {isLoading ? 'Generating Angles...' : 'Generate Angles'}
        </button>
      </div>

      {angles && angles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#ededed]">Generated Angles ({angles.length})</h3>
          <div className="grid gap-4">
            {angles.map((angle) => (
              <div key={angle.id} className="bg-[#161616] rounded-lg border border-[#2a2a2a] overflow-hidden">
                <div onClick={() => setExpandedAngle(expandedAngle === angle.id ? null : angle.id)} className="p-4 cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                  <p className="text-xs text-[#3ecf8e] font-medium mb-1">{angle.personaName}</p>
                  <p className="text-lg font-semibold text-[#ededed]">{angle.hook}</p>
                  <p className="text-sm text-[#737373] mt-2">{angle.angle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
