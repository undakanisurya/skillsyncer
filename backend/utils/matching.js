const DOMAIN_KEYWORDS = {
  ecommerce: ['e-commerce', 'ecommerce', 'shopify', 'woocommerce', 'magento', 'cart', 'checkout'],
  finance: ['fintech', 'banking', 'payments', 'ledger', 'kYC', 'kyc', 'aml', 'loan', 'credit', 'debit'],
  marketing: ['seo', 'sem', 'campaign', 'social media', 'content marketing', 'brand'],
  technology: ['software', 'saas', 'cloud', 'microservices', 'api', 'devops', 'kubernetes', 'docker'],
  education: ['edtech', 'learning', 'course', 'student', 'teacher', 'classroom'],
  healthcare: ['healthcare', 'medical', 'patient', 'clinical', 'hospital', 'diagnostic'],
  other: []
};

const SKILL_REGEX = /\b(java|javascript|typescript|python|react|node(?:\.js)?|express|mongodb|sql|postgres|mysql|html|css|tailwind|next(?:\.js)?|angular|vue|redux|docker|kubernetes|aws|gcp|azure|git|figma|photoshop|illustrator|nlp|ml|ai|data(?:\s*science)?|rest|graphql)\b/gi;

function extractPostingCriteria(internship) {
  const description = (internship.description || '').toLowerCase();
  const title = (internship.title || '').toLowerCase();
  const tags = Array.isArray(internship.tags) ? internship.tags.map((t) => String(t).toLowerCase()) : [];

  // Visible skills
  const visibleSkills = (internship.skillsRequired || []).map((s) => String(s).toLowerCase());

  // Hidden/implied skills from description/title/tags
  const hiddenSkills = new Set();
  const scanText = [description, title, tags.join(' ')].join(' ');
  (scanText.match(SKILL_REGEX) || []).forEach((m) => hiddenSkills.add(m.toLowerCase()));

  // Domain detection
  let domain = internship.industry || 'Other';
  const domainHits = [];
  Object.entries(DOMAIN_KEYWORDS).forEach(([key, words]) => {
    const hits = words.filter((w) => scanText.includes(w));
    if (hits.length) domainHits.push({ key, hits: hits.length });
  });
  if (domainHits.length) {
    domainHits.sort((a, b) => b.hits - a.hits);
    domain = domainHits[0].key;
  }

  // Qualifications/preferences heuristics
  const qualifications = [];
  if (/b\.?tech|bachelor|be\b/i.test(scanText)) qualifications.push('bachelor');
  if (/m\.?tech|master|me\b/i.test(scanText)) qualifications.push('master');
  if (/fresher|freshers only/i.test(scanText)) qualifications.push('freshers');
  if (/experience|experienced/i.test(scanText)) qualifications.push('experienced');

  return {
    skills: Array.from(new Set([...visibleSkills, ...Array.from(hiddenSkills)])),
    domain,
    qualifications,
    mode: (internship.mode || '').toLowerCase(),
    location: (internship.location || '').toLowerCase(),
    eligibilityText: (internship.eligibility || '').toLowerCase()
  };
}

function extractApplicant(profile) {
  const skills = new Set();
  (profile?.nlp?.extracted?.skills || []).forEach((s) => skills.add(String(s).toLowerCase()));
  (profile?.skills || []).forEach((s) => skills.add(String(s).toLowerCase()));

  const educationStrings = (profile?.education || []).map((e) => `${e.degree || ''} ${e.specialization || ''}`.trim().toLowerCase());
  const preferredLocation = (profile?.preferredLocation || '').toLowerCase();

  // Domain guess from resume text keywords
  const resumeText = (profile?.nlp?.parsedText || '').toLowerCase();
  let domain = 'other';
  const domainHits = [];
  Object.entries(DOMAIN_KEYWORDS).forEach(([key, words]) => {
    const hits = words.filter((w) => resumeText.includes(w)).length;
    if (hits) domainHits.push({ key, hits });
  });
  if (domainHits.length) {
    domainHits.sort((a, b) => b.hits - a.hits);
    domain = domainHits[0].key;
  }

  return {
    skills: Array.from(skills),
    educationStrings,
    domain,
    preferredLocation
  };
}

function computeMatchScore(criteria, applicant) {
  const matched = [];
  const unmatched = [];

  // Skill overlap (60%)
  const requiredSkills = criteria.skills || [];
  const applicantSkills = new Set(applicant.skills || []);
  let skillMatches = 0;
  requiredSkills.forEach((s) => {
    if (applicantSkills.has(s)) {
      matched.push(`skill:${s}`);
      skillMatches++;
    } else {
      unmatched.push(`skill:${s}`);
    }
  });
  const skillScore = requiredSkills.length ? (skillMatches / requiredSkills.length) : 0;

  // Domain relevance (20%)
  const domainScore = criteria.domain && applicant.domain && criteria.domain.toLowerCase() === applicant.domain.toLowerCase() ? 1 : 0;
  if (domainScore) matched.push(`domain:${criteria.domain}`); else unmatched.push(`domain:${criteria.domain}`);

  // Qualification hint match (10%)
  const qualText = applicant.educationStrings.join(' ');
  let qualHit = 0;
  if (criteria.qualifications?.includes('master') && /master|m\.tech|me\b/i.test(qualText)) qualHit = 1;
  else if (criteria.qualifications?.includes('bachelor') && /bachelor|b\.tech|be\b/i.test(qualText)) qualHit = 1;
  const qualScore = qualHit;
  if (qualScore) matched.push('qualification'); else if ((criteria.qualifications || []).length) unmatched.push('qualification');

  // Mode/location preference soft match (10%)
  let prefScore = 0;
  if (criteria.mode && criteria.mode === 'online') prefScore += 0.5; // easier match
  if (criteria.location && applicant.preferredLocation && applicant.preferredLocation && criteria.location.includes(applicant.preferredLocation)) {
    prefScore += 0.5;
  }

  const total = Math.round((0.6 * skillScore + 0.2 * domainScore + 0.1 * qualScore + 0.1 * prefScore) * 100);
  return { score: total, matched, unmatched };
}

function decideAction(score, threshold = 55) {
  return score >= threshold ? 'Proceed to Recruiter' : 'Auto-Rejected';
}

function buildSummary(applicantName, score, matched, unmatched) {
  const topMatched = matched.filter((m) => m.startsWith('skill:')).slice(0, 5).map((m) => m.replace('skill:', ''));
  const topMissing = unmatched.filter((m) => m.startsWith('skill:')).slice(0, 5).map((m) => m.replace('skill:', ''));
  return `${applicantName || 'Applicant'} match score ${score}%. Matched: ${topMatched.join(', ') || 'none'}. Missing: ${topMissing.join(', ') || 'none'}.`;
}

module.exports = {
  extractPostingCriteria,
  extractApplicant,
  computeMatchScore,
  decideAction,
  buildSummary
};


