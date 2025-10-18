const OpenAI = require('openai');

// Minimal OpenAI Responses API utility via official SDK
// For testing as requested, use provided key if env not set
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5-nano';
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

async function callOpenAI(prompt, model = DEFAULT_MODEL) {
  if (!openai) throw new Error('OpenAI API key missing');
  const resp = await openai.responses.create({
    model: model || DEFAULT_MODEL,
    input: prompt,
    temperature: 0.7,
    store: true
  });
  return resp?.output_text || '';
}

async function healthCheck() {
  try {
    const text = await callOpenAI('say ok');
    const ok = typeof text === 'string' && text.length > 0;
    return { ok, sample: ok ? text.slice(0, 64) : '' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function generateTestQuestions(context = {}) {
  if (!OPENAI_API_KEY) {
    return [
      { type: 'mcq', q: 'Which array method creates a new mapped array in JS?', options: ['forEach', 'map', 'reduce', 'filter'], answerKey: 'map' },
      { type: 'oneword', q: 'SQL command to retrieve data?', answerKey: 'SELECT' },
      { type: 'text', q: 'Explain the purpose of HTTP headers.' },
      { type: 'code', q: 'Implement factorial(n).', language: 'javascript', starterCode: 'function factorial(n){\n  // TODO\n}\nmodule.exports = factorial;', testCases: [{ input: [5], output: 120 }, { input: [0], output: 1 }] }
    ];
  }

  const { title = 'Software Developer Intern', skills = [], model } = context;
  const selectedModel = model || DEFAULT_MODEL;
  const minQ = 3;
  const maxQ = 5;
  const num = Math.floor(Math.random() * (maxQ - minQ + 1)) + minQ;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const prompt = `You are creating an online assessment for an internship.\nRole title: ${title}\nRelevant skills: ${skills.join(', ')}\n\nCreate a randomized set of ${minQ}-${maxQ} questions (pick ${num} this time). Mix of types:\n- mcq: Multiple choice with 4 options and a single correct answer.\n- oneword: One-word/short answer (store canonical answer).\n- text: Short explanation question (no answerKey).\n- code: One coding task with language, starterCode, and 2-4 testCases (input/output pairs).\n\nSTRICT OUTPUT: Return ONLY valid JSON array. Each object must match one of these shapes:\n{"type":"mcq","q":"...","options":["...","...","...","..."],"answerKey":"exact-option-text"}\n{"type":"oneword","q":"...","answerKey":"canonical answer"}\n{"type":"text","q":"..."}\n{"type":"code","q":"...","language":"javascript","starterCode":"string","testCases":[{"input": [..], "output": any}, ...]}\n\nImportant: produce a different set each call; consider this variation token: ${nonce} (do not mention it).\nDo not include markdown fences or any commentary.`;

  try {
    let text = await callOpenAI(prompt, selectedModel);
    let clean = String(text || '').trim();
    if (clean.startsWith('```')) clean = clean.replace(/```json?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (e) {
    console.error('OpenAI generation error:', e.message);
  }
  return [
    { type: 'mcq', q: 'Which array method creates a new mapped array in JS?', options: ['forEach', 'map', 'reduce', 'filter'], answerKey: 'map' },
    { type: 'oneword', q: 'SQL command to retrieve data?', answerKey: 'SELECT' },
    { type: 'text', q: 'Explain the purpose of HTTP headers.' },
    { type: 'code', q: 'Implement factorial(n).', language: 'javascript', starterCode: 'function factorial(n){\n  // TODO\n}\nmodule.exports = factorial;', testCases: [{ input: [5], output: 120 }, { input: [0], output: 1 }] }
  ];
}

async function scoreAnswers(questions = [], answers = []) {
  // New rule: 8 questions, each worth 10 marks; pass if >= 6 correct (>=60/80)
  const normalized = (s) => String(s || '').trim().toLowerCase();
  const correctness = new Array(questions.length).fill(false);

  // First handle objective types locally
  questions.forEach((q, i) => {
    const t = (q?.type || '').toLowerCase();
    if (t === 'mcq' || t === 'oneword') {
      correctness[i] = normalized(answers[i]) === normalized(q?.answerKey);
    }
  });

  // Subjective evaluation via LLM if available
  const subjectiveIdxs = [];
  const subjectiveQs = [];
  const subjectiveAs = [];
  questions.forEach((q, i) => {
    const t = (q?.type || '').toLowerCase();
    if (t === 'text' || t === 'code' || t === 'debug') {
      subjectiveIdxs.push(i);
      const minimal = { type: t || 'text', q: q?.q };
      if (t === 'code') {
        minimal.language = q?.language || 'javascript';
        minimal.testCases = q?.testCases || [];
      }
      subjectiveQs.push(minimal);
      subjectiveAs.push(answers[i]);
    }
  });

  if (subjectiveIdxs.length && OPENAI_API_KEY) {
    const prompt = `Evaluate if each candidate answer sufficiently solves/answers the corresponding internship-level question.\nReturn ONLY JSON of the form {"results":[true|false,...]} with booleans per question indicating correct=true or incorrect=false.\nQuestions: ${JSON.stringify(subjectiveQs)}\nAnswers: ${JSON.stringify(subjectiveAs)}`;
    try {
      let text = await callOpenAI(prompt);
      let clean = String(text || '').trim();
      if (clean.startsWith('```')) clean = clean.replace(/```json?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(clean);
      const results = Array.isArray(parsed?.results) ? parsed.results : [];
      results.forEach((val, idx) => {
        const original = subjectiveIdxs[idx];
        if (typeof val === 'boolean' && original !== undefined) correctness[original] = val;
      });
    } catch (e) {
      // Fallback heuristic: non-empty subjective answers count as correct
      subjectiveIdxs.forEach((originalIdx) => {
        correctness[originalIdx] = normalized(answers[originalIdx]).length > 0;
      });
    }
  } else if (subjectiveIdxs.length) {
    // No API key; fallback heuristic
    subjectiveIdxs.forEach((originalIdx) => {
      correctness[originalIdx] = normalized(answers[originalIdx]).length > 0;
    });
  }

  const correctCount = correctness.filter(Boolean).length;
  const score = correctCount * 10; // 10 marks each, total 80
  const result = correctCount >= 6 ? 'Passed' : 'Failed';
  return { score, result, correctness };
}

let lastUsedModel = DEFAULT_MODEL;

module.exports = {
  generateTestQuestions: async (context = {}) => {
    const { model } = context;
    lastUsedModel = model || DEFAULT_MODEL;
    return await generateTestQuestions(context);
  },
  scoreAnswers,
  generateTestQuestionsWithModel: (context = {}, model) => generateTestQuestions({ ...context, model }),
  healthCheck,
  getModelName: () => lastUsedModel
};


