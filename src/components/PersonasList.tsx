'use client';

import { Persona } from '@/types';

interface PersonasListProps {
  personas: Persona[];
  selectedPersonaIds: string[];
  onTogglePersona: (personaId: string) => void;
}

export default function PersonasList({ personas, selectedPersonaIds, onTogglePersona }: PersonasListProps) {
  if (personas.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">
        Discovered Personas ({personas.length})
      </h3>
      <div className="grid gap-4">
        {personas.map((persona) => (
          <div
            key={persona.id}
            onClick={() => onTogglePersona(persona.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedPersonaIds.includes(persona.id)
                ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--foreground)] mb-1">
                  {persona.name}
                </h4>
                <p className="text-sm text-[var(--muted)] mb-3">
                  {persona.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--primary)] font-medium">Pain Points:</span>
                    <ul className="mt-1 space-y-1">
                      {persona.painPoints.slice(0, 2).map((pp, i) => (
                        <li key={i} className="text-[var(--muted)]">• {pp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[var(--primary)] font-medium">Buying Reasons:</span>
                    <ul className="mt-1 space-y-1">
                      {persona.buyingReasons.slice(0, 2).map((br, i) => (
                        <li key={i} className="text-[var(--muted)]">• {br}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPersonaIds.includes(persona.id)
                    ? 'bg-[var(--primary)] border-[var(--primary)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {selectedPersonaIds.includes(persona.id) && (
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <p className="text-sm">
                <span className="text-[var(--primary)] font-medium">Hook: </span>
                <span className="text-[var(--muted)]">{persona.angleHook}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
