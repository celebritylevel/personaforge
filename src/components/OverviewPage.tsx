'use client';

import { useState } from 'react';

export default function OverviewPage({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="bg-[var(--card)] rounded-xl p-8 border border-[var(--border)]">
        <p className="text-[var(--muted)]">Enter a creator URL above to get started</p>
      </div>
    );
  }

  const stats = [
    { label: 'Subscribers', value: profile.subscribersCount?.toLocaleString() || '0' },
    { label: 'Media', value: profile.mediasCount?.toLocaleString() || '0' },
    { label: 'Photos', value: profile.photosCount?.toLocaleString() || '0' },
    { label: 'Videos', value: profile.videosCount?.toLocaleString() || '0' },
    { label: 'Subscription', value: profile.subscribePrice ? `$${profile.subscribePrice}` : 'Free' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)]">
        {profile.header && (
          <div className="h-48 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/5 relative">
            <img 
              src={profile.header} 
              alt="Header" 
              className="w-full h-full object-cover opacity-50"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            {profile.avatar && (
              <img 
                src={profile.avatar} 
                alt={profile.name || profile.username}
                className="w-20 h-20 rounded-full border-4 border-[var(--background)] object-cover -mt-12 relative z-10"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  {profile.name || `@${profile.username}`}
                </h2>
                {profile.isVerified && (
                  <span className="text-[var(--primary)]">✓</span>
                )}
              </div>
              <p className="text-[var(--muted)]">@{profile.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/20 text-[var(--primary)] capitalize">
                  {profile.platform}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-lg bg-[var(--background)]">
                <div className="text-xl font-bold text-[var(--foreground)]">{stat.value}</div>
                <div className="text-xs text-[var(--muted)]">{stat.label}</div>
              </div>
            ))}
          </div>

          {profile.about && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--muted)] mb-2">About</h3>
              <div 
                className="text-[var(--foreground)] prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: profile.about }}
              />
            </div>
          )}
        </div>
      </div>

      {profile.personas && profile.personas.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Discovered Personas ({profile.personas.length})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {profile.personas.map((persona: any, i: number) => (
              <div key={i} className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <h4 className="font-semibold text-[var(--foreground)] mb-2">{persona.name}</h4>
                <p className="text-sm text-[var(--muted)] mb-3">{persona.description}</p>
                
                {persona.demographics && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-[var(--muted)] mb-1">Demographics</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.demographics.ageRange && (
                        <span className="px-2 py-0.5 text-xs rounded bg-[var(--primary)]/20 text-[var(--primary)]">
                          {persona.demographics.ageRange}
                        </span>
                      )}
                      {persona.demographics.gender && (
                        <span className="px-2 py-0.5 text-xs rounded bg-[var(--primary)]/20 text-[var(--primary)]">
                          {persona.demographics.gender}
                        </span>
                      )}
                      {persona.demographics.income && (
                        <span className="px-2 py-0.5 text-xs rounded bg-[var(--primary)]/20 text-[var(--primary)]">
                          {persona.demographics.income}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {persona.painPoints && persona.painPoints.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-[var(--muted)] mb-1">Pain Points</p>
                    <ul className="text-xs text-[var(--foreground)] space-y-1">
                      {persona.painPoints.slice(0, 2).map((point: string, j: number) => (
                        <li key={j} className="flex items-start gap-1">
                          <span className="text-red-400">•</span> {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {persona.angleHook && (
                  <div className="mt-3 p-2 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    <p className="text-xs text-[var(--primary)] font-medium">"{persona.angleHook}"</p>
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