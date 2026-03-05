export interface Persona {
  id: string;
  name: string;
  description: string;
  painPoints: string[];
  buyingReasons: string[];
  demographics: {
    ageRange: string;
    gender: string;
    location: string;
    income: string;
    occupation: string;
  };
  psychographics: string[];
  angleHook: string;
}

export interface ICPResearch {
  id: string;
  productDescription: string;
  website: string;
  personas: Persona[];
  createdAt: string;
  updatedAt: string;
}

export interface AdAngle {
  id: string;
  personaId: string;
  personaName: string;
  hook: string;
  painPoint: string;
  angle: string;
  callToAction: string;
  creativeSuggestions: string[];
}

export interface AnglesResponse {
  id: string;
  icpResearchId: string;
  angles: AdAngle[];
  createdAt: string;
}

export interface ResearchRequest {
  productDescription?: string;
  website?: string;
}

export interface AnglesRequest {
  icpResearchId: string;
}
