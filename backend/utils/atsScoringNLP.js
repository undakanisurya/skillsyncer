const axios = require('axios');
const JobseekerProfile = require('../models/JobseekerProfile');

/**
 * Embed text via a local or remote embedding service.
 * Default expects a local HTTP service exposing /embed returning { vector: number[] }
 * You can swap this with sentence-transformers server or OpenAI API.
 */
const embedText = async (text) => {
  if (!text || !text.trim()) return [];
  const endpoint = process.env.EMBEDDING_ENDPOINT || 'http://localhost:8000/embed';
  try {
    const { data } = await axios.post(endpoint, { text });
    return data.vector || [];
  } catch (err) {
    console.error('Embedding error:', err.message);
    return [];
  }
};

const cosineSimilarity = (a, b) => {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const DOMAIN_KEYWORDS = {
  ml: ['machine learning', 'supervised', 'unsupervised', 'regression', 'classification', 'xgboost', 'random forest', 'svm', 'feature engineering', 'model evaluation'],
  ai: ['artificial intelligence', 'reasoning', 'knowledge graphs'],
  nlp: ['nlp', 'tokenization', 'ner', 'pos', 'transformer', 'bert', 'gpt', 'spacy', 'huggingface'],
  cv: ['computer vision', 'opencv', 'cnn', 'resnet', 'yolo', 'segmentation', 'detection'],
  ocr: ['ocr', 'tesseract', 'paddleocr', 'docai', 'text extraction'],
  mlops: ['mlops', 'mlflow', 'kubeflow', 'dagster', 'airflow', 'dvc', 'feature store', 'monitoring'],
  cloud: ['aws', 'gcp', 'azure', 's3', 'ec2', 'lambda', 'gke', 'eks', 'aks', 'cloud run']
};

const ACTION_VERBS = ['built', 'designed', 'implemented', 'developed', 'optimized', 'deployed', 'automated', 'improved', 'reduced', 'increased', 'led', 'created'];

/**
 * Compute NLP-based ATS score given a profile and optional job description.
 */
const computeNLPScore = async (profile, jobDescriptionText = '') => {
  const resumeText = profile?.nlp?.parsedText || '';
  const extractedSkills = profile?.nlp?.extracted?.skills || profile?.skills || [];
  const education = profile?.nlp?.extracted?.education || profile?.education || [];

  const resumeVector = profile?.nlp?.embeddings?.resume?.length
    ? profile.nlp.embeddings.resume
    : await embedText(resumeText);

  const jobVector = jobDescriptionText ? await embedText(jobDescriptionText) : [];

  const jobSimilarity = jobVector.length ? cosineSimilarity(resumeVector, jobVector) : 0;

  // Skill match via semantic overlap (if skill vectors available, else lexical)
  const normalizedSkills = extractedSkills.map((s) => s.toLowerCase());
  const uniqueSkills = Array.from(new Set(normalizedSkills));
  const skillMatch = Math.min(1, uniqueSkills.length / 12); // heuristic target ~12 skills

  // Education presence/quality heuristic
  const educationMatch = Math.min(1, (education?.length || 0) / 2);

  // Experience summary presence
  const experiencePresent = profile?.nlp?.extracted?.experienceSummary?.length > 40 ? 1 : 0;

  // Keyword coverage across target domains
  const lowerText = (resumeText || '').toLowerCase();
  const allDomainKeywords = Object.values(DOMAIN_KEYWORDS).flat();
  const covered = allDomainKeywords.filter((k) => lowerText.includes(k)).length;
  const keywordCoverage = Math.min(1, covered / Math.max(10, allDomainKeywords.length / 4));

  // Formatting compliance: penalize tables/graphics indicators; reward ATS-friendly sections
  const hasTablesOrGraphics = /<table|{\\tbl|\\includegraphics|\bgraphic\b|\bimage\b/i.test(resumeText);
  const hasSections = /(education|experience|projects|skills|certifications)/i.test(resumeText);
  const formattingCompliance = Math.max(0, (hasSections ? 1 : 0.6) - (hasTablesOrGraphics ? 0.5 : 0));

  // Action verbs and quantifiable results
  const verbHits = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(resumeText)).length;
  const actionVerbScore = Math.min(1, verbHits / 6);
  const quantifiableHits = ((resumeText.match(/\b(\d+%|\d+\s*(?:k|m|million|billion)?|\$\d+)/gi)) || []).length;
  const quantifiableScore = Math.min(1, quantifiableHits / 5);

  // Structure compliance: typical US resume sections
  const structureHits = ['summary', 'experience', 'education', 'skills'].filter((s) => new RegExp(`\b${s}\b`, 'i').test(resumeText)).length;
  const structureCompliance = Math.min(1, structureHits / 4);

  // Weighted score
  const score = Math.round(
    (
      0.30 * (jobSimilarity || 0) +
      0.20 * skillMatch +
      0.10 * educationMatch +
      0.10 * experiencePresent +
      0.15 * keywordCoverage +
      0.10 * formattingCompliance +
      0.03 * actionVerbScore +
      0.02 * quantifiableScore
    ) * 100
  );

  const details = {
    skillMatch: Math.round(skillMatch * 100),
    educationMatch: Math.round(educationMatch * 100),
    experienceMatch: Math.round(experiencePresent * 100),
    jobSimilarity: Math.round((jobSimilarity || 0) * 100),
    keywordCoverage: Math.round(keywordCoverage * 100),
    formattingCompliance: Math.round(formattingCompliance * 100),
    actionVerbs: Math.round(actionVerbScore * 100),
    quantifiableResults: Math.round(quantifiableScore * 100),
    structureCompliance: Math.round(structureCompliance * 100)
  };

  const suggestions = [];
  if (uniqueSkills.length < 10) {
    suggestions.push({ field: 'skills', message: 'Add more relevant skills (aim for 10-15).', priority: 'high' });
  }
  if (!profile?.resumeUrl) {
    suggestions.push({ field: 'resume', message: 'Upload a resume PDF/DOCX for better parsing.', priority: 'high' });
  }
  if (!profile?.nlp?.extracted?.experienceSummary) {
    suggestions.push({ field: 'experience', message: 'Include a short experience summary.', priority: 'medium' });
  }
  if (details.keywordCoverage < 60) {
    suggestions.push({ field: 'keywords', message: 'Increase domain keywords for ML/AI/NLP/CV/OCR/MLOps/Cloud.', priority: 'high' });
  }
  if (details.actionVerbs < 60) {
    suggestions.push({ field: 'language', message: 'Use more impact action verbs (built, optimized, deployed, etc.).', priority: 'medium' });
  }
  if (details.quantifiableResults < 60) {
    suggestions.push({ field: 'impact', message: 'Add quantifiable metrics (% improvements, cost/time savings).', priority: 'medium' });
  }
  if (details.formattingCompliance < 60) {
    suggestions.push({ field: 'formatting', message: 'Avoid tables/graphics; use clear ATS-friendly sections.', priority: 'high' });
  }

  return { score, details, suggestions, resumeVector };
};

/**
 * End-to-end: set parsed text/entities, compute embeddings and score, persist to DB.
 */
const analyzeAndSaveNLP = async (userId, parsedText, extracted, jobDescriptionText = '') => {
  const profile = await JobseekerProfile.findOne({ userId });
  if (!profile) {
    return { success: false, error: 'Profile not found' };
  }

  // Prepare embeddings
  const resumeVector = await embedText(parsedText || '');

  const { score, details, suggestions } = await computeNLPScore(
    {
      ...profile.toObject(),
      nlp: {
        ...(profile.nlp || {}),
        parsedText: parsedText || '',
        extracted: extracted || {},
        embeddings: { resume: resumeVector }
      }
    },
    jobDescriptionText
  );

  // Save
  profile.nlp = profile.nlp || {};
  profile.nlp.parsedText = parsedText || '';
  profile.nlp.extracted = extracted || {};
  profile.nlp.embeddings = { resume: resumeVector };
  profile.nlp.atsNLP = { score, details, suggestions };
  profile.nlp.lastAnalyzedAt = new Date();
  await profile.save();

  return {
    success: true,
    atsNLP: profile.nlp.atsNLP,
    embeddings: profile.nlp.embeddings
  };
};

module.exports = {
  embedText,
  cosineSimilarity,
  computeNLPScore,
  analyzeAndSaveNLP
};


