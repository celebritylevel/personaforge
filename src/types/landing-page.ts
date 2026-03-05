export type LandingPageType = 'coaching' | 'quiz';

export type CTA = {
  label: string;
  urlPlaceholder: string;
};

export type HeroSection = {
  headline: string;
  subheadline: string;
  heroImagePrompt: string;
  primaryCta: CTA;
};

export type BenefitsSection = {
  type: 'benefits';
  title: string;
  bullets: string[];
};

export type HowItWorksSection = {
  type: 'how_it_works';
  title?: string;
  steps: string[];
};

export type AboutSection = {
  type: 'about';
  title: string;
  body: string;
};

export type QuizSection = {
  type: 'quiz';
  title: string;
  intro: string;
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
  resultLogicHint: string;
};

export type LeadCaptureSection = {
  type: 'lead_capture';
  title: string;
  body: string;
  consentText: string;
  submitLabel: string;
};

export type Section = BenefitsSection | HowItWorksSection | AboutSection | QuizSection | LeadCaptureSection;

export type Footer = {
  brandName: string;
  businessEmail: string;
  businessAddress: string;
  links: {
    privacy: string;
    terms: string;
    contact: string;
  };
};

export type LandingPageSpec = {
  metaTitle: string;
  metaDescription: string;
  hero: HeroSection;
  sections: Section[];
  footer: Footer;
};

export type LandingPage = {
  id: string;
  creatorId: string;
  personaId: string | null;
  personaName: string | null;
  slug: string;
  fullPath: string | null;
  type: LandingPageType;
  spec: LandingPageSpec;
  metaSafe: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatorDomainConfig = {
  id: string;
  creatorId: string;
  primaryDomain: string | null;
  edgeDomain: string | null;
  autoAddressProvider: 'ipostal1' | 'fallback';
  businessEmail: string | null;
  businessAddress: string | null;
  createdAt: string;
  updatedAt: string;
};

export const FORBIDDEN_KEYWORDS = [
  'onlyfans', 'only fans', 'nude', 'nudes', 'nsfw', 'porn', 'xxx',
  'sex', 'sexual', 'sext', 'spicy content', 'escort', 'hookup',
  'meet girls', 'dating app', 'camgirl', 'fetish', 'erotic'
];

export function containsForbidden(text: string): string[] {
  const hits: string[] = [];
  const lower = text.toLowerCase();
  for (const w of FORBIDDEN_KEYWORDS) {
    if (lower.includes(w)) hits.push(w);
  }
  return hits;
}

export function validateSpec(spec: LandingPageSpec): string[] {
  const problems: string[] = [];
  const check = (t?: string) => {
    if (!t) return;
    problems.push(...containsForbidden(t));
  };

  check(spec.metaTitle);
  check(spec.metaDescription);
  check(spec.hero.headline);
  check(spec.hero.subheadline);

  for (const s of spec.sections) {
    if (s.type === 'benefits') {
      check(s.title);
      s.bullets.forEach(check);
    } else if (s.type === 'how_it_works') {
      check(s.title);
      s.steps.forEach(check);
    } else if (s.type === 'about') {
      check(s.title);
      check(s.body);
    } else if (s.type === 'quiz') {
      check(s.title);
      check(s.intro);
      s.questions.forEach(q => {
        check(q.question);
        q.options.forEach(check);
      });
    } else if (s.type === 'lead_capture') {
      check(s.title);
      check(s.body);
      check(s.consentText);
    }
  }

  return [...new Set(problems)];
}
