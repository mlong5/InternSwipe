// Shared keyword vocabulary used for both the settings UI (skill / interest chips)
// and the match-score calculation. Single source of truth so a keyword added to
// the user's selection list is automatically discoverable in job postings.
//
// Each entry is a canonical display name plus the literal phrases that should
// be considered a hit in job text. Matching is case-insensitive and uses
// alphanumeric-boundary lookarounds so "java" doesn't substring-match inside
// "javascript" and "c++" / "node.js" work despite their special characters.

type KeywordDef = {
  canonical: string
  patterns: string[]
}

const KEYWORD_DEFS: KeywordDef[] = [
  // Languages
  { canonical: 'Python',         patterns: ['python'] },
  { canonical: 'JavaScript',     patterns: ['javascript'] },
  { canonical: 'TypeScript',     patterns: ['typescript'] },
  { canonical: 'Java',           patterns: ['java'] },
  { canonical: 'C++',            patterns: ['c++'] },
  { canonical: 'C#',             patterns: ['c#', 'csharp'] },
  { canonical: 'Go',             patterns: ['golang'] },
  { canonical: 'Rust',           patterns: ['rust'] },
  { canonical: 'Swift',          patterns: ['swift'] },
  { canonical: 'Kotlin',         patterns: ['kotlin'] },
  { canonical: 'Ruby',           patterns: ['ruby'] },
  { canonical: 'PHP',            patterns: ['php'] },
  { canonical: 'Scala',          patterns: ['scala'] },
  { canonical: 'SQL',            patterns: ['sql'] },
  { canonical: 'HTML',           patterns: ['html'] },
  { canonical: 'CSS',            patterns: ['css'] },

  // Frontend frameworks
  { canonical: 'React',          patterns: ['react', 'reactjs', 'react.js'] },
  { canonical: 'Vue',            patterns: ['vue', 'vuejs', 'vue.js'] },
  { canonical: 'Angular',        patterns: ['angular'] },
  { canonical: 'Next.js',        patterns: ['next.js', 'nextjs'] },
  { canonical: 'Tailwind',       patterns: ['tailwind'] },

  // Backend frameworks / runtimes
  { canonical: 'Node.js',        patterns: ['node.js', 'nodejs', 'node js'] },
  { canonical: 'Django',         patterns: ['django'] },
  { canonical: 'Flask',          patterns: ['flask'] },
  { canonical: 'Spring',         patterns: ['spring boot', 'springboot', 'spring framework'] },
  { canonical: 'Rails',          patterns: ['ruby on rails', 'rails'] },

  // Databases
  { canonical: 'PostgreSQL',     patterns: ['postgresql', 'postgres'] },
  { canonical: 'MySQL',          patterns: ['mysql'] },
  { canonical: 'MongoDB',        patterns: ['mongodb', 'mongo db'] },
  { canonical: 'Redis',          patterns: ['redis'] },
  { canonical: 'NoSQL',          patterns: ['nosql', 'no-sql'] },

  // Cloud / infra
  { canonical: 'AWS',            patterns: ['aws', 'amazon web services'] },
  { canonical: 'GCP',            patterns: ['gcp', 'google cloud'] },
  { canonical: 'Azure',          patterns: ['azure'] },
  { canonical: 'Docker',         patterns: ['docker'] },
  { canonical: 'Kubernetes',     patterns: ['kubernetes', 'k8s'] },
  { canonical: 'Terraform',      patterns: ['terraform'] },
  { canonical: 'CI/CD',          patterns: ['ci/cd', 'cicd', 'continuous integration'] },

  // Data / ML
  { canonical: 'Machine Learning', patterns: ['machine learning', 'machine-learning'] },
  { canonical: 'Deep Learning',  patterns: ['deep learning'] },
  { canonical: 'TensorFlow',     patterns: ['tensorflow', 'tensor flow'] },
  { canonical: 'PyTorch',        patterns: ['pytorch'] },
  { canonical: 'NLP',            patterns: ['nlp', 'natural language processing'] },
  { canonical: 'Data Science',   patterns: ['data science', 'data scientist'] },
  { canonical: 'Data Analysis',  patterns: ['data analysis', 'data analyst', 'data analytics'] },
  { canonical: 'Data Engineering', patterns: ['data engineering', 'data engineer'] },
  { canonical: 'Statistics',     patterns: ['statistics', 'statistical'] },

  // Mobile
  { canonical: 'iOS',            patterns: ['ios'] },
  { canonical: 'Android',        patterns: ['android'] },
  { canonical: 'React Native',   patterns: ['react native'] },
  { canonical: 'Flutter',        patterns: ['flutter'] },

  // Role / domain
  { canonical: 'Full-Stack',     patterns: ['full-stack', 'full stack', 'fullstack'] },
  { canonical: 'Frontend',       patterns: ['frontend', 'front-end', 'front end'] },
  { canonical: 'Backend',        patterns: ['backend', 'back-end', 'back end'] },
  { canonical: 'Mobile',         patterns: ['mobile'] },
  { canonical: 'DevOps',         patterns: ['devops', 'dev ops'] },
  { canonical: 'SRE',            patterns: ['sre', 'site reliability'] },
  { canonical: 'Security',       patterns: ['security engineer', 'security analyst', 'application security'] },
  { canonical: 'Cybersecurity',  patterns: ['cybersecurity', 'cyber security', 'infosec'] },
  { canonical: 'Embedded',       patterns: ['embedded'] },
  { canonical: 'Firmware',       patterns: ['firmware'] },
  { canonical: 'Hardware',       patterns: ['hardware'] },
  { canonical: 'Game Dev',       patterns: ['game development', 'game developer', 'game engineer', 'gameplay'] },
  { canonical: 'Quantitative',   patterns: ['quantitative', 'quant developer', 'quant analyst', 'quant researcher'] },
  { canonical: 'Blockchain',     patterns: ['blockchain', 'web3'] },
  { canonical: 'Robotics',       patterns: ['robotics'] },
  { canonical: 'AR/VR',          patterns: ['augmented reality', 'virtual reality', 'ar/vr'] },

  // Industry
  { canonical: 'Fintech',        patterns: ['fintech'] },
  { canonical: 'Healthcare',     patterns: ['healthcare', 'health care'] },
  { canonical: 'Climate Tech',   patterns: ['climate tech', 'climate-tech', 'sustainability'] },
  { canonical: 'EdTech',         patterns: ['edtech', 'education technology'] },

  // Tooling
  { canonical: 'Git',            patterns: ['git'] },
  { canonical: 'Figma',          patterns: ['figma'] },
  { canonical: 'Linux',          patterns: ['linux'] },

  // High-level role categories (multi-word so they don't collide with plain "engineer")
  { canonical: 'Software Eng',   patterns: ['software engineer', 'software engineering', 'software developer'] },
  { canonical: 'Product Design', patterns: ['product design', 'product designer', 'ux design', 'ui design'] },
  { canonical: 'Product Mgmt',   patterns: ['product management', 'product manager', 'product mgmt'] },
  { canonical: 'Cloud Infra',    patterns: ['cloud infrastructure', 'cloud infra', 'cloud computing'] },
  { canonical: 'ML / AI',        patterns: ['ml engineer', 'ai engineer', 'ml/ai', 'artificial intelligence'] },
]

export const KEYWORD_UNIVERSE: readonly string[] = KEYWORD_DEFS.map(d => d.canonical)

// User-selectable lists rendered as chips in Settings. These are the keywords
// a user can claim on their profile; the score formula intersects these with
// the keywords each job posting actually contains.
export const SKILL_KEYWORDS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Ruby', 'SQL', 'HTML', 'CSS',
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Django', 'Flask',
  'PostgreSQL', 'MongoDB', 'Redis',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Analysis', 'Statistics',
  'iOS', 'Android', 'React Native', 'Flutter',
  'Git', 'Figma', 'Linux',
] as const

export const INTEREST_KEYWORDS = [
  'Software Eng', 'Full-Stack', 'Frontend', 'Backend', 'Mobile',
  'Data Science', 'Data Engineering', 'ML / AI', 'NLP',
  'Cloud Infra', 'DevOps', 'SRE',
  'Cybersecurity', 'Security',
  'Product Design', 'Product Mgmt',
  'Game Dev', 'Quantitative', 'Embedded', 'Hardware', 'Robotics', 'AR/VR',
  'Blockchain',
  'Fintech', 'Healthcare', 'Climate Tech', 'EdTech',
] as const

// Compile one regex per canonical keyword, joining its patterns with `|` and
// wrapping each pattern in alphanumeric-boundary lookarounds.
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const KEYWORD_REGEXES = KEYWORD_DEFS.map(def => ({
  canonical: def.canonical,
  regex: new RegExp(
    def.patterns
      .map(p => `(?<![a-zA-Z0-9])${escapeRegex(p)}(?![a-zA-Z0-9])`)
      .join('|'),
    'i',
  ),
}))

// Extract the canonical keywords that appear in a job posting's title + summary.
// Each canonical is reported at most once even if multiple aliases fire.
export function extractJobKeywords(title: string, summary: string | null): string[] {
  const text = `${title}\n${summary ?? ''}`
  const seen: string[] = []
  for (const { canonical, regex } of KEYWORD_REGEXES) {
    if (regex.test(text)) seen.push(canonical)
  }
  return seen
}

// Score one job against a user's selected keywords (skills + interests merged).
//
// Formula: 30 base + up to 70 from coverage.
//   coverage = (job keywords the user also selected) / (job keywords detected)
//
//   - 0 job keywords detected OR 0 user selections → 50 (neutral; no signal)
//   - 0 user keywords overlap the job's → 30 (low fit, but never an alarming 0%)
//   - all of the job's keywords match the user's → 100
//
// Pass `storedKeywords` to use the keywords column from the jobs table; otherwise
// the keywords are extracted on the fly from title + summary as a fallback.
// Returns the score plus the keyword breakdown so callers can debug / display it.
export function computeKeywordScore(
  jobTitle: string,
  jobSummary: string | null,
  userSelections: string[],
  storedKeywords?: string[] | null,
): { score: number; jobKeywords: string[]; matched: string[] } {
  const jobKeywords =
    storedKeywords && storedKeywords.length > 0
      ? storedKeywords
      : extractJobKeywords(jobTitle, jobSummary)
  const selectionSet = new Set(userSelections.map(s => s.toLowerCase().trim()).filter(Boolean))

  if (jobKeywords.length === 0 || selectionSet.size === 0) {
    return { score: 50, jobKeywords, matched: [] }
  }

  const matched = jobKeywords.filter(k => selectionSet.has(k.toLowerCase()))
  const coverage = matched.length / jobKeywords.length
  const score = Math.round(30 + coverage * 70)
  return { score, jobKeywords, matched }
}
