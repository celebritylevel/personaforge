import { ICPResearch, AnglesResponse, AdAngle } from '@/types';
import { generateId } from './utils';

const memoryResearchStore = new Map<string, ICPResearch>();
const memoryAnglesStore = new Map<string, AnglesResponse>();

function getD1Database() {
  if (typeof process !== 'undefined' && process.env.CLOUDFLARE_D1) {
    return (globalThis as unknown as { DB: D1Database }).DB;
  }
  return null;
}

export async function saveResearch(data: {
  productDescription: string;
  website: string;
  personas: ICPResearch['personas'];
}): Promise<ICPResearch> {
  const id = generateId();
  const research: ICPResearch = {
    id,
    productDescription: data.productDescription,
    website: data.website,
    personas: data.personas,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = getD1Database();
  if (db) {
    await db.prepare(
      'INSERT INTO icp_research (id, product_description, website, personas, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(id, data.productDescription, data.website, JSON.stringify(data.personas), research.createdAt, research.updatedAt)
      .run();
  } else {
    memoryResearchStore.set(id, research);
  }

  return research;
}

export async function getResearch(id: string): Promise<ICPResearch | null> {
  const db = getD1Database();
  
  if (db) {
    const result = await db.prepare('SELECT * FROM icp_research WHERE id = ?')
      .bind(id)
      .first<{ id: string; product_description: string; website: string; personas: string; created_at: string; updated_at: string }>();
    
    if (!result) return null;
    
    return {
      id: result.id,
      productDescription: result.product_description,
      website: result.website,
      personas: JSON.parse(result.personas),
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
  
  return memoryResearchStore.get(id) || null;
}

export async function getAllResearch(): Promise<ICPResearch[]> {
  const db = getD1Database();
  
  if (db) {
    const results = await db.prepare('SELECT * FROM icp_research ORDER BY created_at DESC')
      .all<{ id: string; product_description: string; website: string; personas: string; created_at: string; updated_at: string }>();
    
    return results.results.map((result) => ({
      id: result.id,
      productDescription: result.product_description,
      website: result.website,
      personas: JSON.parse(result.personas),
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }));
  }
  
  return Array.from(memoryResearchStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveAngles(data: {
  icpResearchId: string;
  angles: AdAngle[];
}): Promise<AnglesResponse> {
  const id = generateId();
  const angles: AnglesResponse = {
    id,
    icpResearchId: data.icpResearchId,
    angles: data.angles,
    createdAt: new Date().toISOString(),
  };

  const db = getD1Database();
  if (db) {
    await db.prepare(
      'INSERT INTO angles (id, icp_research_id, angles, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(id, data.icpResearchId, JSON.stringify(data.angles), angles.createdAt)
      .run();
  } else {
    memoryAnglesStore.set(id, angles);
  }

  return angles;
}

export async function getAngles(icpResearchId: string): Promise<AnglesResponse | null> {
  const db = getD1Database();
  
  if (db) {
    const result = await db.prepare('SELECT * FROM angles WHERE icp_research_id = ?')
      .bind(icpResearchId)
      .first<{ id: string; icp_research_id: string; angles: string; created_at: string }>();
    
    if (!result) return null;
    
    return {
      id: result.id,
      icpResearchId: result.icp_research_id,
      angles: JSON.parse(result.angles),
      createdAt: result.created_at,
    };
  }
  
  const allAngles = Array.from(memoryAnglesStore.values());
  return allAngles.find(a => a.icpResearchId === icpResearchId) || null;
}
