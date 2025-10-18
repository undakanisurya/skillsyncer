const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const { Readable } = require('stream');

/**
 * Convert Buffer to Readable stream
 */
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

/**
 * Extract raw text from PDF or DOCX/TXT buffer
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @returns {Promise<string>} raw text
 */
const extractText = async (fileBuffer, mimeType) => {
  if (!fileBuffer) return '';

  if (mimeType === 'application/pdf') {
    const result = await pdfParse(fileBuffer);
    let text = result.text || '';
    if (text && text.trim().length > 20) return text;

    // Optional OCR fallback via external service
    if (process.env.OCR_ENDPOINT) {
      try {
        const { data } = await axios.post(process.env.OCR_ENDPOINT, {
          mimeType,
          contentBase64: fileBuffer.toString('base64')
        });
        if (data && data.text) return data.text;
      } catch (e) {
        console.warn('OCR fallback failed:', e.message);
      }
    }

    return text || '';
  }

  // DOCX via mammoth
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
      if (value && value.trim()) return value;
    } catch (e) {
      console.warn('DOCX parse failed:', e.message);
    }
  }

  // Legacy DOC or others: try OCR if configured
  if (process.env.OCR_ENDPOINT) {
    try {
      const { data } = await axios.post(process.env.OCR_ENDPOINT, {
        mimeType,
        contentBase64: fileBuffer.toString('base64')
      });
      if (data && data.text) return data.text;
    } catch (e) {
      console.warn('OCR fallback failed:', e.message);
    }
  }

  return '';
};

/**
 * Lightweight NLP extraction using regex + heuristics.
 * For production, connect to spaCy/transformers microservice.
 */
const extractEntities = (text) => {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return { skills: [], education: [], internships: [], experienceSummary: '' };
  }

  const skillPatterns = [
    /\b(java|javascript|typescript|python|react|node(?:\.js)?|express|mongodb|sql|html|css|aws|docker|kubernetes|git|ml|ai|data\s*science)\b/gi
  ];

  const degreePatterns = [
    /\b(b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|bachelor|master|phd|mba|bca|mca|diploma)\b/gi
  ];

  const skills = new Set();
  skillPatterns.forEach((re) => {
    (normalized.match(re) || []).forEach((m) => skills.add(m.toLowerCase()));
  });

  const education = [];
  (normalized.match(/(\b(?:bachelor|master|phd|b\.?tech|m\.?tech|bca|mca|mba)\b[^\n\r]{0,80})/gi) || []).forEach((line) => {
    const degree = (line.match(degreePatterns[0]) || [''])[0];
    education.push({ degree: degree || line.trim() });
  });

  const internships = [];
  (normalized.match(/\b(intern|internship)\b[^\n\r]{0,120}/gi) || []).forEach((line) => {
    internships.push({ title: line.trim() });
  });

  const experienceSummary = (normalized.match(/\b(experience|work\s*history)\b[\s\S]{0,400}/i) || [''])[0];

  return {
    skills: Array.from(skills),
    education,
    internships,
    experienceSummary: experienceSummary.trim()
  };
};

module.exports = {
  extractText,
  extractEntities,
  /**
   * Heuristic check to determine if extracted text likely represents a resume.
   * Rules:
   * - Minimum length
   * - Contains contact info (email or phone)
   * - Contains education keywords
   * - Contains at least one of experience/internship/project sections
   * - Prefer having a skills section or multiple tech keywords
   */
  isLikelyResume: (text) => {
    const content = String(text || '').replace(/\s+/g, ' ').trim();
    if (!content || content.length < 300) return false;

    const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(content);
    const hasPhone = /(?:\+?\d[\s-]?){7,}\d/.test(content);
    if (!(hasEmail || hasPhone)) return false;

    const hasEducation = /(education|b\.??tech|m\.??tech|b\.??e\.?|bachelor|master|phd|mba|bca|mca|degree|university|college)/i.test(content);
    if (!hasEducation) return false;

    const hasExperience = /(experience|work\s*history|employment|internship|intern)/i.test(content);
    const hasProjects = /(projects?|project\s*experience)/i.test(content);
    if (!(hasExperience || hasProjects)) return false;

    const hasSkillsSection = /(skills?\s*:|technical\s+skills|skills\s+summary)/i.test(content);
    const techKeywords = /(java(script)?|typescript|python|react|node(\.js)?|express|mongodb|sql|html|css|aws|docker|kubernetes|git|linux|azure|gcp)/i;
    const hasTech = techKeywords.test(content);
    if (!(hasSkillsSection || hasTech)) return false;

    // Reject if looks like a questionnaire or essay with no sections
    const hasSections = /(summary|objective|education|experience|skills|projects|certifications|achievements)/i.test(content);
    if (!hasSections) return false;

    return true;
  }
};


