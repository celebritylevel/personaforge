'use client';

export default function PersonasList({ personas }) {
  if (!personas || personas.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#ededed]">Discovered Personas ({personas.length})</h3>
      <div className="grid gap-4">
        {personas.map((persona) => (
          <div key={persona.id} className="p-4 rounded-lg border border-[#2a2a2a] bg-[#161616] hover:border-[#3ecf8e]/50 transition-all">
            <h4 className="font-semibold text-[#ededed] mb-1">{persona.name}</h4>
            <p className="text-sm text-[#737373] mb-3">{persona.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#3ecf8e] font-medium">Pain Points:</span>
                <ul className="mt-1 space-y-1">
                  {persona.painPoints?.slice(0, 2).map((pp, i) => (
                    <li key={i} className="text-[#737373]">• {pp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[#3ecf8e] font-medium">Buying Reasons:</span>
                <ul className="mt-1 space-y-1">
                  {persona.buyingReasons?.slice(0, 2).map((br, i) => (
                    <li key={i} className="text-[#737373]">• {br}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
