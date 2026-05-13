import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

type PrismaLikeClient = PrismaClient;

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface SimplifyJobEntry {
  company_name: string;
  job_title: string;
  location: string;
  job_description?: string;
  url: string;
  date_posted?: string;
  source: string;
}

const INELIGIBLE_KEYWORDS = [
  "clearance",
  "TS/SCI",
  "citizenship",
  "visa",
  "ITAR",
  "export control",
  "DoD",
  "military",
  "government contractor",
];

const INTERNSHIP_QUERIES = [
  "software engineering internship",
  "software developer intern",
  "computer science internship",
];

export function determineEligibility(job: SimplifyJobEntry): "ELIGIBLE" | "NOT_ELIGIBLE" {
  const text = `${job.job_title} ${job.company_name} ${job.job_description}`.toLowerCase();
  return INELIGIBLE_KEYWORDS.some((k) => text.includes(k.toLowerCase()))
    ? "NOT_ELIGIBLE"
    : "ELIGIBLE";
}

// ── LinkedIn Jobs Search (linkedin-jobs-search.p.rapidapi.com) ──────────────

interface LinkedInJob {
  id?: string;
  jobId?: string;
  title?: string;
  company?: string | { name?: string };
  location?: string;
  description?: string;
  url?: string;
  jobUrl?: string;
  datePosted?: string;
  date_posted?: string;
}

export async function fetchFromLinkedIn(
  fetchImpl: FetchLike = fetch
): Promise<SimplifyJobEntry[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY is not set");

  const results: SimplifyJobEntry[] = [];

  for (const query of INTERNSHIP_QUERIES) {
    try {
      const url = new URL("https://linkedin-jobs-search.p.rapidapi.com/search-jobs-v2");
      url.searchParams.set("query", query);
      url.searchParams.set("location", "United States");
      url.searchParams.set("datePosted", "past month");
      url.searchParams.set("sort", "mostRelevant");
      url.searchParams.set("jobType", "internship");
      url.searchParams.set("experienceLevel", "internship");
      url.searchParams.set("page", "1");

      const response = await fetchImpl(url.toString(), {
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": "linkedin-jobs-search.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        console.error(`LinkedIn API error for "${query}": ${response.status} ${response.statusText}`);
        continue;
      }

      const jobs = (await response.json()) as LinkedInJob[];
      console.log(`  LinkedIn: ${jobs.length} results for "${query}"`);

      for (const job of jobs) {
        const jobId = job.id ?? job.jobId;
        const jobUrl =
          job.url ??
          job.jobUrl ??
          (jobId ? `https://www.linkedin.com/jobs/view/${jobId}` : "");

        if (!jobUrl) continue;

        results.push({
          company_name:
            typeof job.company === "string"
              ? job.company
              : job.company?.name ?? "",
          job_title: job.title ?? "",
          location: job.location ?? "",
          job_description: job.description ?? "",
          url: jobUrl,
          date_posted: job.datePosted ?? job.date_posted ?? "",
          source: "linkedin",
        });
      }
    } catch (err) {
      console.error(`Error fetching LinkedIn jobs for "${query}":`, err);
    }
  }

  return results;
}

// ── Indeed (indeed12.p.rapidapi.com) ────────────────────────────────────────

interface IndeedJob {
  id?: string;
  jobId?: string;
  job_id?: string;
  title?: string;
  job_title?: string;
  company?: string;
  company_name?: string;
  location?: string;
  formatted_location?: string;
  description?: string;
  snippet?: string;
  url?: string;
  link?: string;
  date?: string;
  date_posted?: string;
}

export async function fetchFromIndeed(
  fetchImpl: FetchLike = fetch
): Promise<SimplifyJobEntry[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY is not set");

  const results: SimplifyJobEntry[] = [];

  for (const query of INTERNSHIP_QUERIES) {
    try {
      const url = new URL("https://indeed12.p.rapidapi.com/jobs/search");
      url.searchParams.set("q", query);
      url.searchParams.set("l", "United States");
      url.searchParams.set("fromage", "30");
      url.searchParams.set("radius", "50");
      url.searchParams.set("start", "0");

      const response = await fetchImpl(url.toString(), {
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": "indeed12.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        console.error(`Indeed API error for "${query}": ${response.status} ${response.statusText}`);
        continue;
      }

      const data = (await response.json()) as { hits?: IndeedJob[]; jobs?: IndeedJob[] };
      const jobs = data.hits ?? data.jobs ?? [];
      console.log(`  Indeed: ${jobs.length} results for "${query}"`);

      for (const job of jobs) {
        const jobKey = job.job_id ?? job.jobId ?? job.id;
        const jobUrl =
          job.url ??
          job.link ??
          (jobKey ? `https://www.indeed.com/viewjob?jk=${jobKey}` : "");

        if (!jobUrl) continue;

        results.push({
          company_name: job.company ?? job.company_name ?? "",
          job_title: job.title ?? job.job_title ?? "",
          location: job.formatted_location ?? job.location ?? "",
          job_description: job.description ?? job.snippet ?? "",
          url: jobUrl,
          date_posted: job.date ?? job.date_posted ?? "",
          source: "indeed",
        });
      }
    } catch (err) {
      console.error(`Error fetching Indeed jobs for "${query}":`, err);
    }
  }

  return results;
}

// ── Upsert ───────────────────────────────────────────────────────────────────

export async function upsertJobs(
  listings: SimplifyJobEntry[],
  prismaClient: PrismaLikeClient = prisma
): Promise<{ upserted: number; skipped: number; errors: number }> {
  // Deduplicate by title+company before hitting the DB
  const seen = new Set<string>();
  const unique = listings.filter((entry) => {
    const key = `${entry.job_title.toLowerCase()}|${entry.company_name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let upserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of unique) {
    try {
      const eligibilityStatus = determineEligibility(entry);

      await prismaClient.job.upsert({
        where: { title_company: { title: entry.job_title, company: entry.company_name } },
        update: {
          location: entry.location,
          summary: entry.job_description ?? "",
          url: entry.url,
          eligibilityStatus,
        },
        create: {
          title: entry.job_title,
          company: entry.company_name,
          location: entry.location,
          summary: entry.job_description ?? "",
          url: entry.url,
          source: entry.source,
          eligibilityStatus,
        },
      });

      upserted++;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint failed")) {
        skipped++;
      } else {
        console.error(`Error upserting job ${entry.job_title}:`, error);
        errors++;
      }
    }
  }

  console.log(`\nIngestion complete:`);
  console.log(`  ✓ Upserted: ${upserted}`);
  console.log(`  ⊘ Skipped:  ${skipped}`);
  console.log(`  ✗ Errors:   ${errors}`);

  return { upserted, skipped, errors };
}

// ── Main ─────────────────────────────────────────────────────────────────────

export async function main(
  deps: { prismaClient?: PrismaLikeClient; fetchImpl?: FetchLike } = {}
): Promise<void> {
  const { prismaClient = prisma, fetchImpl = fetch } = deps;

  try {
    console.log("Starting job ingestion from LinkedIn and Indeed...\n");

    const [linkedInJobs, indeedJobs] = await Promise.all([
      fetchFromLinkedIn(fetchImpl),
      fetchFromIndeed(fetchImpl),
    ]);

    const all = [...linkedInJobs, ...indeedJobs];
    console.log(`\nTotal fetched: ${all.length} (LinkedIn: ${linkedInJobs.length}, Indeed: ${indeedJobs.length})`);

    await upsertJobs(all, prismaClient);

    console.log("\nJob ingestion successful!");
  } catch (error) {
    console.error("Job ingestion failed:", error);
    process.exit(1);
  } finally {
    await prismaClient.$disconnect();
  }
}

if (require.main === module) {
  void main();
}
