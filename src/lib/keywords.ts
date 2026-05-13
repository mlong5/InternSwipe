// Shared keyword vocabulary used for both the settings UI (skill / interest chips)
// and the match-score calculation. Keeping a single source of truth here means a
// keyword added to the user's selection list is automatically discoverable in
// job postings, and vice versa.

export const SKILL_KEYWORDS = [
  'Python', 'JavaScript', 'React', 'SQL', 'Java', 'C++', 'Figma',
  'TypeScript', 'Machine Learning', 'Data Analysis', 'Node.js', 'AWS',
  'Docker', 'Git', 'Product Mgmt', 'Statistics',
] as const

export const INTEREST_KEYWORDS = [
  'Software Eng', 'Data Science', 'Product Design', 'Product Mgmt',
  'ML / AI', 'Cloud Infra', 'Cybersecurity', 'Fintech', 'Healthcare',
  'Climate Tech', 'EdTech', 'Robotics',
] as const

export const KEYWORD_UNIVERSE: readonly string[] = [
  ...SKILL_KEYWORDS,
  ...INTEREST_KEYWORDS,
]

// Extract the subset of vocabulary keywords that appear in a job posting's
// title + summary (case-insensitive substring match). Each keyword is reported
// at most once even if it appears multiple times.
export function extractJobKeywords(title: string, summary: string | null): string[] {
  const haystack = `${title} ${summary ?? ''}`.toLowerCase()
  const seen = new Set<string>()
  for (const kw of KEYWORD_UNIVERSE) {
    const needle = kw.toLowerCase().trim()
    if (needle.length > 0 && haystack.includes(needle)) seen.add(kw)
  }
  return Array.from(seen)
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
