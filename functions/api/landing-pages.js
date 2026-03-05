import { createClient } from '@supabase/supabase-js';

const FORBIDDEN_KEYWORDS = [
  'onlyfans', 'only fans', 'nude', 'nudes', 'nsfw', 'porn', 'xxx',
  'sex', 'sexual', 'sext', 'spicy content', 'escort', 'hookup',
  'meet girls', 'dating app', 'camgirl', 'fetish', 'erotic'
];

function containsForbidden(text) {
  const hits = [];
  if (!text) return hits;
  const lower = text.toLowerCase();
  for (const w of FORBIDDEN_KEYWORDS) {
    if (lower.includes(w)) hits.push(w);
  }
  return hits;
}

function validateSpec(spec) {
  const problems = [];
  const check = (t) => {
    if (!t) return;
    problems.push(...containsForbidden(t));
  };

  check(spec.metaTitle);
  check(spec.metaDescription);
  check(spec.hero?.headline);
  check(spec.hero?.subheadline);

  for (const s of (spec.sections || [])) {
    if (s.type === 'benefits') {
      check(s.title);
      (s.bullets || []).forEach(check);
    } else if (s.type === 'how_it_works') {
      check(s.title);
      (s.steps || []).forEach(check);
    } else if (s.type === 'about') {
      check(s.title);
      check(s.body);
    } else if (s.type === 'quiz') {
      check(s.title);
      check(s.intro);
      (s.questions || []).forEach(q => {
        check(q.question);
        (q.options || []).forEach(check);
      });
    } else if (s.type === 'lead_capture') {
      check(s.title);
      check(s.body);
      check(s.consentText);
    }
  }

  return [...new Set(problems)];
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getSupabase(env) {
  return createClient(
    env.SUPABASE_URL || 'https://bmsvxytzueetnlhsefuv.supabase.co',
    env.SUPABASE_SERVICE_KEY || env.SUPABASE_SECRET_KEY
  );
}

async function callPerplexity(apiKey, systemPrompt, userPrompt) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function getVirtualOfficeAddress(perplexityKey) {
  const prompt = `Find one example of a real US virtual office street address from iPostal1 in a top-tier US city (New York, Los Angeles, Miami, Chicago, or San Francisco). Return only the formatted postal address, one line, no commentary. Example format: "123 Business Ave, Suite 100, New York, NY 10001"`;

  try {
    const addr = await callPerplexity(perplexityKey, 'You provide real business addresses. Return only the address, nothing else.', prompt);
    if (addr && addr.length > 10) return addr.trim();
  } catch (e) {
    console.error('Failed to get iPostal1 address:', e);
  }

  return '123 Business Center Dr, Suite 400, Miami, FL 33101';
}

async function generateCoachingPageSpec(perplexityKey, persona, creator, domainConfig) {
  const systemPrompt = `You are a copywriter creating Meta-compliant, non-sexual landing pages for coaching or emotional support offers.

Rules:
- Do NOT use or imply sexual services, dating apps, pornographic content, or adult chat.
- Do NOT mention OnlyFans or explicit content.
- Focus on emotional support, feeling heard, loneliness, work stress, and general well-being.
- Use a warm, supportive tone suitable for a young female coach/content creator talking to men.
- The page must be suitable for Meta Ads in March 2026 and follow Meta landing-page standards.
- Include clear business name, contact email, postal address, privacy/terms links.
- Output ONLY valid JSON, no markdown formatting, no comments.

Return this exact JSON structure for a coaching page:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "hero": {
    "headline": "...",
    "subheadline": "...",
    "heroImagePrompt": "...",
    "primaryCta": {"label": "...", "urlPlaceholder": "{{telegram_link}}"}
  },
  "sections": [
    {"type": "benefits", "title": "...", "bullets": ["...", "..."]},
    {"type": "how_it_works", "title": "...", "steps": ["...", "..."]},
    {"type": "about", "title": "...", "body": "..."},
    {"type": "lead_capture", "title": "...", "body": "...", "consentText": "...", "submitLabel": "..."}
  ],
  "footer": {
    "brandName": "...",
    "businessEmail": "...",
    "businessAddress": "...",
    "links": {"privacy": "/privacy", "terms": "/terms", "contact": "/contact"}
  }
}`;

  const userPrompt = `Build a LandingPageSpec JSON for a coaching/support page.

Persona: ${JSON.stringify(persona, null, 2)}

Creator: ${creator.name || creator.username}
About: ${creator.about || 'No description'}

Offer: A free 20-minute clarity session by video or chat to talk about feeling lonely and unheard.
CTA: "Apply for a Free 20-Minute Session"

Domain: ${domainConfig.primaryDomain || domainConfig.edgeDomain || 'example.com'}
Business Email: ${domainConfig.businessEmail || `support@${domainConfig.primaryDomain || 'example.com'}`}
Business Address: ${domainConfig.businessAddress || '123 Business St, City, ST 12345'}

FORBIDDEN WORDS (do NOT use): ${FORBIDDEN_KEYWORDS.join(', ')}

Output valid JSON only.`;

  const content = await callPerplexity(perplexityKey, systemPrompt, userPrompt);
  const jsonMatch = content.match(/\{[\s\S]*"metaTitle"[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse coaching page spec');
  return JSON.parse(jsonMatch[0]);
}

async function generateQuizPageSpec(perplexityKey, persona, creator, domainConfig) {
  const systemPrompt = `You are a copywriter creating Meta-compliant, non-sexual landing pages with interactive quizzes.

Rules:
- Do NOT use or imply sexual services, dating apps, pornographic content, or adult chat.
- Do NOT mention OnlyFans or explicit content.
- Focus on emotional support, feeling heard, loneliness, work stress, and general well-being.
- Use a warm, supportive tone.
- The page must be suitable for Meta Ads in March 2026.
- Include clear business name, contact email, postal address, privacy/terms links.
- Output ONLY valid JSON, no markdown formatting, no comments.

Return this exact JSON structure for a quiz page:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "hero": {
    "headline": "...",
    "subheadline": "...",
    "heroImagePrompt": "...",
    "primaryCta": {"label": "...", "urlPlaceholder": "{{telegram_link}}"}
  },
  "sections": [
    {
      "type": "quiz",
      "title": "...",
      "intro": "...",
      "questions": [
        {"id": "q1", "question": "...", "options": ["...", "...", "..."]},
        {"id": "q2", "question": "...", "options": ["...", "...", "..."]}
      ],
      "resultLogicHint": "..."
    },
    {"type": "lead_capture", "title": "...", "body": "...", "consentText": "...", "submitLabel": "..."}
  ],
  "footer": {
    "brandName": "...",
    "businessEmail": "...",
    "businessAddress": "...",
    "links": {"privacy": "/privacy", "terms": "/terms", "contact": "/contact"}
  }
}`;

  const userPrompt = `Build a LandingPageSpec JSON for a quiz page.

Persona: ${JSON.stringify(persona, null, 2)}

Creator: ${creator.name || creator.username}
About: ${creator.about || 'No description'}

Offer: A 5-question quiz to help visitors understand what kind of support they need. At the end, invite them to join a free Telegram updates space or apply for a call.
CTA: "Get My Results"

Domain: ${domainConfig.primaryDomain || domainConfig.edgeDomain || 'example.com'}
Business Email: ${domainConfig.businessEmail || `support@${domainConfig.primaryDomain || 'example.com'}`}
Business Address: ${domainConfig.businessAddress || '123 Business St, City, ST 12345'}

FORBIDDEN WORDS (do NOT use): ${FORBIDDEN_KEYWORDS.join(', ')}

Output valid JSON only. Include exactly 5 quiz questions.`;

  const content = await callPerplexity(perplexityKey, systemPrompt, userPrompt);
  const jsonMatch = content.match(/\{[\s\S]*"metaTitle"[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse quiz page spec');
  return JSON.parse(jsonMatch[0]);
}

function generateLandingPageHTML(spec, slug) {
  const sectionsHTML = (spec.sections || []).map((section) => {
    switch (section.type) {
      case 'benefits':
        return `
          <section class="py-16 bg-white">
            <div class="max-w-4xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-8">${section.title}</h2>
              <ul class="grid md:grid-cols-2 gap-4">
                ${(section.bullets || []).map((b) => `<li class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"><span class="text-green-500 text-xl">✓</span><span>${b}</span></li>`).join('')}
              </ul>
            </div>
          </section>`;
      case 'how_it_works':
        return `
          <section class="py-16 bg-gray-50">
            <div class="max-w-4xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-8">${section.title || 'How It Works'}</h2>
              <ol class="space-y-6">
                ${(section.steps || []).map((s, i) => `<li class="flex items-start gap-4"><span class="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">${i + 1}</span><span class="pt-2">${s}</span></li>`).join('')}
              </ol>
            </div>
          </section>`;
      case 'about':
        return `
          <section class="py-16 bg-white">
            <div class="max-w-4xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-8">${section.title}</h2>
              <p class="text-lg text-gray-600 text-center max-w-2xl mx-auto">${section.body}</p>
            </div>
          </section>`;
      case 'quiz':
        return `
          <section class="py-16 bg-gray-50" id="quiz">
            <div class="max-w-2xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-4">${section.title}</h2>
              <p class="text-gray-600 text-center mb-8">${section.intro}</p>
              <div id="quiz-container">
                ${(section.questions || []).map((q, i) => `
                  <div class="quiz-question mb-8" data-question="${q.id}" style="display: ${i === 0 ? 'block' : 'none'}">
                    <h3 class="text-xl font-semibold mb-4">${i + 1}. ${q.question}</h3>
                    <div class="space-y-2">
                      ${(q.options || []).map((opt) => `<button class="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition" onclick="selectOption(this, '${q.id}')">${opt}</button>`).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>`;
      case 'lead_capture':
        return `
          <section class="py-16 bg-green-50">
            <div class="max-w-xl mx-auto px-4 text-center">
              <h2 class="text-3xl font-bold mb-4">${section.title}</h2>
              <p class="text-gray-600 mb-6">${section.body}</p>
              <form class="space-y-4" onsubmit="handleLeadSubmit(event)">
                <input type="email" placeholder="Enter your email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <p class="text-xs text-gray-500">${section.consentText}</p>
                <button type="submit" class="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">${section.submitLabel}</button>
              </form>
            </div>
          </section>`;
      default:
        return '';
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec.metaTitle || 'Landing Page'}</title>
  <meta name="description" content="${spec.metaDescription || ''}">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans antialiased text-gray-900">
  <header class="bg-gradient-to-r from-green-500 to-green-600 text-white py-20">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">${spec.hero?.headline || ''}</h1>
      <p class="text-xl opacity-90 mb-8">${spec.hero?.subheadline || ''}</p>
      <a href="${spec.hero?.primaryCta?.urlPlaceholder || '#'}" class="inline-block px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition text-lg">
        ${spec.hero?.primaryCta?.label || 'Learn More'}
      </a>
    </div>
  </header>
  
  ${sectionsHTML}
  
  <footer class="py-12 bg-gray-900 text-gray-400">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <p class="text-white font-bold text-lg mb-2">${spec.footer?.brandName || ''}</p>
      <p class="mb-1">${spec.footer?.businessEmail || ''}</p>
      <p class="text-sm mb-4">${spec.footer?.businessAddress || ''}</p>
      <div class="flex justify-center gap-6 text-sm">
        <a href="${spec.footer?.links?.privacy || '/privacy'}" class="hover:text-white transition">Privacy Policy</a>
        <a href="${spec.footer?.links?.terms || '/terms'}" class="hover:text-white transition">Terms of Service</a>
        <a href="${spec.footer?.links?.contact || '/contact'}" class="hover:text-white transition">Contact</a>
      </div>
    </div>
  </footer>
  
  <script>
    const answers = {};
    function selectOption(btn, qId) {
      const parent = btn.parentElement;
      parent.querySelectorAll('button').forEach(b => b.classList.remove('border-green-500', 'bg-green-50'));
      btn.classList.add('border-green-500', 'bg-green-50');
      answers[qId] = btn.textContent;
      const questions = document.querySelectorAll('.quiz-question');
      const current = document.querySelector('.quiz-question[style*="block"]');
      const idx = Array.from(questions).indexOf(current);
      if (idx < questions.length - 1) {
        setTimeout(() => {
          questions[idx].style.display = 'none';
          questions[idx + 1].style.display = 'block';
        }, 300);
      }
    }
    function handleLeadSubmit(e) {
      e.preventDefault();
      alert('Thank you! We\\'ll be in touch soon.');
    }
  </script>
</body>
</html>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const creatorId = url.searchParams.get('creatorId');
  const pageId = url.searchParams.get('id');

  const supabase = getSupabase(env);

  if (pageId) {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({
      ...data,
      metaSafe: data.meta_safe
    }), { headers: CORS_HEADERS });
  }

  if (creatorId) {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    return new Response(JSON.stringify((data || []).map(p => ({
      ...p,
      metaSafe: p.meta_safe
    }))), { headers: CORS_HEADERS });
  }

  const { data, error } = await supabase
    .from('landing_pages')
    .select('*, creator_profiles(name, username)')
    .order('created_at', { ascending: false });

  return new Response(JSON.stringify((data || []).map(p => ({
    ...p,
    creator_name: p.creator_profiles?.name,
    creator_username: p.creator_profiles?.username,
    metaSafe: p.meta_safe
  }))), { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const perplexityKey = env.PERPLEXITY_API_KEY;

  try {
    const body = await request.json();
    const { action, creatorId, personaIds, generateCoaching, generateQuiz, domainConfig } = body;

    if (action === 'generate') {
      if (!creatorId) {
        return new Response(JSON.stringify({ error: 'Creator ID required' }), { status: 400, headers: CORS_HEADERS });
      }

      const { data: creator, error: creatorError } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('id', creatorId)
        .single();

      if (creatorError || !creator) {
        return new Response(JSON.stringify({ error: 'Creator not found' }), { status: 404, headers: CORS_HEADERS });
      }

      const creatorPersonas = creator.personas || [];
      const selectedPersonas = personaIds && personaIds.length > 0
        ? creatorPersonas.filter((p, i) => personaIds.includes(`persona-${i}`) || personaIds.includes(p.id))
        : creatorPersonas;

      if (selectedPersonas.length === 0) {
        return new Response(JSON.stringify({ error: 'No personas found for this creator' }), { status: 400, headers: CORS_HEADERS });
      }

      let { data: domainCfg } = await supabase
        .from('creator_domain_configs')
        .select('*')
        .eq('creator_id', creatorId)
        .single();

      if (!domainCfg && domainConfig) {
        const address = domainConfig.businessAddress || await getVirtualOfficeAddress(perplexityKey);
        const newDomainCfg = {
          id: generateId(),
          creator_id: creatorId,
          primary_domain: domainConfig.primaryDomain || null,
          edge_domain: domainConfig.edgeDomain || null,
          auto_address_provider: domainConfig.autoAddressProvider || 'ipostal1',
          business_email: domainConfig.businessEmail || null,
          business_address: address
        };

        await supabase.from('creator_domain_configs').insert([newDomainCfg]);
        domainCfg = newDomainCfg;
      }

      const generatedPages = [];
      let coachingCount = 0;
      let quizCount = 0;

      const { data: existingPages } = await supabase
        .from('landing_pages')
        .select('slug')
        .eq('creator_id', creatorId);

      const existingSlugs = new Set((existingPages || []).map(p => p.slug));
      existingSlugs.forEach(s => {
        if (s && s.startsWith('coaching-')) coachingCount = Math.max(coachingCount, parseInt(s.split('-')[1]) || 0);
        if (s && s.startsWith('quiz-')) quizCount = Math.max(quizCount, parseInt(s.split('-')[1]) || 0);
      });

      for (const persona of selectedPersonas) {
        if (generateCoaching) {
          coachingCount++;
          try {
            const spec = await generateCoachingPageSpec(perplexityKey, persona, creator, domainCfg || {});
            const problems = validateSpec(spec);
            const metaSafe = problems.length === 0;
            const slug = `coaching-${coachingCount}`;
            const id = generateId();
            const html = generateLandingPageHTML(spec, slug);

            await supabase.from('landing_pages').insert([{
              id,
              creator_id: creatorId,
              persona_id: persona.id || null,
              persona_name: persona.name || null,
              slug,
              full_path: domainCfg?.primary_domain ? `https://${domainCfg.primary_domain}/${slug}` : null,
              type: 'coaching',
              spec,
              meta_safe: metaSafe,
              html_content: html
            }]);

            generatedPages.push({ id, slug, type: 'coaching', personaName: persona.name, metaSafe, problems });
          } catch (e) {
            console.error('Failed to generate coaching page:', e);
          }
        }

        if (generateQuiz) {
          quizCount++;
          try {
            const spec = await generateQuizPageSpec(perplexityKey, persona, creator, domainCfg || {});
            const problems = validateSpec(spec);
            const metaSafe = problems.length === 0;
            const slug = `quiz-${quizCount}`;
            const id = generateId();
            const html = generateLandingPageHTML(spec, slug);

            await supabase.from('landing_pages').insert([{
              id,
              creator_id: creatorId,
              persona_id: persona.id || null,
              persona_name: persona.name || null,
              slug,
              full_path: domainCfg?.primary_domain ? `https://${domainCfg.primary_domain}/${slug}` : null,
              type: 'quiz',
              spec,
              meta_safe: metaSafe,
              html_content: html
            }]);

            generatedPages.push({ id, slug, type: 'quiz', personaName: persona.name, metaSafe, problems });
          } catch (e) {
            console.error('Failed to generate quiz page:', e);
          }
        }
      }

      return new Response(JSON.stringify({ success: true, pages: generatedPages }), { headers: CORS_HEADERS });
    }

    if (action === 'update') {
      const { id, spec } = body;
      if (!id || !spec) {
        return new Response(JSON.stringify({ error: 'ID and spec required' }), { status: 400, headers: CORS_HEADERS });
      }

      const problems = validateSpec(spec);
      const metaSafe = problems.length === 0;
      const { data: page } = await supabase.from('landing_pages').select('slug').eq('id', id).single();
      const html = generateLandingPageHTML(spec, page?.slug || '');

      await supabase
        .from('landing_pages')
        .update({ spec, meta_safe: metaSafe, html_content: html, updated_at: new Date().toISOString() })
        .eq('id', id);

      return new Response(JSON.stringify({ success: true, metaSafe, problems }), { headers: CORS_HEADERS });
    }

    if (action === 'delete') {
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers: CORS_HEADERS });
      }

      await supabase.from('landing_pages').delete().eq('id', id);
      return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: CORS_HEADERS });
  } catch (error) {
    console.error('Landing pages error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500, headers: CORS_HEADERS });
  }
}
