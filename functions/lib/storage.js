function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function saveResearch(db, data) {
  const id = generateId();
  const research = {
    id,
    productDescription: data.productDescription,
    website: data.website,
    personas: data.personas,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.prepare('INSERT INTO icp_research (id, product_description, website, personas, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, data.productDescription, data.website, JSON.stringify(data.personas), research.createdAt, research.updatedAt)
    .run();

  return research;
}

export async function getResearch(db, id) {
  const result = await db.prepare('SELECT * FROM icp_research WHERE id = ?').bind(id).first();
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

export async function getAllResearch(db) {
  const results = await db.prepare('SELECT * FROM icp_research ORDER BY created_at DESC').all();
  return results.results.map(r => ({
    id: r.id,
    productDescription: r.product_description,
    website: r.website,
    personas: JSON.parse(r.personas),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function saveAngles(db, data) {
  const id = generateId();
  const angles = { id, icpResearchId: data.icpResearchId, angles: data.angles, createdAt: new Date().toISOString() };
  await db.prepare('INSERT INTO angles (id, icp_research_id, angles, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, data.icpResearchId, JSON.stringify(data.angles), angles.createdAt)
    .run();
  return angles;
}

export async function getAngles(db, icpResearchId) {
  const result = await db.prepare('SELECT * FROM angles WHERE icp_research_id = ?').bind(icpResearchId).first();
  if (!result) return null;
  return { id: result.id, icpResearchId: result.icp_research_id, angles: JSON.parse(result.angles), createdAt: result.created_at };
}
