'use client';

import { useState } from 'react';
import { ICPResearch, AdAngle } from '@/types';

interface AnglesGeneratorProps {
  research: ICPResearch | null;
  angles: AdAngle[] | null;
  onGenerateAngles: () => void;
  isLoading: boolean;
}

export default function AnglesGenerator({ research, angles, onGenerateAngles, isLoading }: AnglesGeneratorProps) {
  const [expandedAngle, setExpandedAngle] = useState<string | null>(null);

  if (!research) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-center">
        <p className="text-[var(--muted)]">
          Complete ICP Discovery first to generate ad angles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Generate Ad Angles
        </h2>
        <p className="text-[var(--muted)] text-sm mb-6">
          Create Meta Ads creatives based on the discovered personas and their pain points
        </p>

        <div className="p-4 bg-[var(--secondary)] rounded-lg mb-4">
          <p className="text-sm text-[var(--muted)]">
            <span className="text-[var(--primary)] font-medium">Product: </span>
            {research.productDescription}
          </p>
          {research.website && (
            <p className="text-sm text-[var(--muted)] mt-1">
              <span className="text-[var(--primary)] font-medium">Website: </span>
              {research.website}
            </p>
          )}
          <p className="text-sm text-[var(--muted)] mt-1">
            <span className="text-[var(--primary)] font-medium">Personas: </span>
            {research.personas.length} discovered
          </p>
        </div>

        <button
          onClick={onGenerateAngles}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--muted)] disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Angles...
            </span>
          ) : (
            'Generate Angles'
          )}
        </button>
      </div>

      {angles && angles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Generated Angles ({angles.length})
          </h3>
          <div className="grid gap-4">
            {angles.map((angle) => (
              <div
                key={angle.id}
                className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden"
              >
                <div
                  onClick={() => setExpandedAngle(expandedAngle === angle.id ? null : angle.id)}
                  className="p-4 cursor-pointer hover:bg-[var(--secondary)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-[var(--primary)] font-medium mb-1">
                        {angle.personaName}
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {angle.hook}
                      </p>
                      <p className="text-sm text-[var(--muted)] mt-2">
                        {angle.angle}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-[var(--muted)] transition-transform ${
                        expandedAngle === angle.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {expandedAngle === angle.id && (
                  <div className="p-4 pt-0 border-t border-[var(--border)] mt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--primary)] mb-1">Pain Point</p>
                      <p className="text-sm text-[var(--muted)]">{angle.painPoint}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--primary)] mb-1">Call to Action</p>
                      <p className="text-sm text-[var(--muted)]">{angle.callToAction}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--primary)] mb-2">Creative Suggestions</p>
                      <ul className="space-y-2">
                        {angle.creativeSuggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                            <span className="text-[var(--primary)]">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
