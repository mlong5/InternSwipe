import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type PrismaLikeClient = Pick<PrismaClient, "$disconnect"> & {
  job: {
    upsert: (args: unknown) => Promise<unknown>;
  };
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface SimplifyJobEntry {
  company_name: string;
  job_title: string;
  location: string;
  job_description?: string;
  url: string;
  date_posted?: string;
}

//hardcoded specifically to use the SimplifyJobs Summer2026-Internships repo
const SIMPLIFY_REPO_OWNER = "SimplifyJobs";
const SIMPLIFY_REPO_NAME = "Summer2026-Internships";
const SIMPLIFY_BRANCH = "dev";
const LISTINGS_FILE = "listings.json";

// Keywords that indicate NOT_ELIGIBLE positions
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

export function determineEligibility(job: SimplifyJobEntry): "ELIGIBLE" | "NOT_ELIGIBLE" {
  const text = `${job.job_title} ${job.company_name} ${job.job_description}`.toLowerCase();

  const hasIneligibleKeyword = INELIGIBLE_KEYWORDS.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );

  return hasIneligibleKeyword ? "NOT_ELIGIBLE" : "ELIGIBLE";
}

export async function fetchListingsFromGitHub(
  fetchImpl: FetchLike = fetch
): Promise<SimplifyJobEntry[]> {
  const url = `https://api.github.com/repos/${SIMPLIFY_REPO_OWNER}/${SIMPLIFY_REPO_NAME}/contents/${LISTINGS_FILE}?ref=${SIMPLIFY_BRANCH}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
  };

  // Optional: Add GitHub token for higher rate limits (5000/hr vs 60/hr)
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers.Authorization = `token ${githubToken}`;
  }

  console.log(`Fetching jobs from GitHub API: ${url}`);

  const response = await fetchImpl(url, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch listings from GitHub: ${response.status} ${response.statusText}`
    );
  }

  const listings = (await response.json()) as SimplifyJobEntry[];
  console.log(`Fetched ${listings.length} job listings from SimpleifyJobs`);
  return listings;
}

export async function upsertJobs(
  listings: SimplifyJobEntry[],
  prismaClient: PrismaLikeClient = prisma
): Promise<{ upserted: number; skipped: number; errors: number }> {
  let upserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of listings) {
    try {
      const eligibilityStatus = determineEligibility(entry);

      await prismaClient.job.upsert({
        where: {
          title_company: {
            title: entry.job_title,
            company: entry.company_name,
          },
        },
        update: {
          location: entry.location,
          summary: entry.job_description || "",
          url: entry.url,
          eligibilityStatus,
          updatedAt: new Date(),
        },
        create: {
          title: entry.job_title,
          company: entry.company_name,
          location: entry.location,
          summary: entry.job_description || "",
          url: entry.url,
          eligibilityStatus,
        },
      });

      upserted++;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint failed")
      ) {
        skipped++;
      } else {
        console.error(`Error upserting job ${entry.job_title}:`, error);
        errors++;
      }
    }
  }

  console.log(`\nIngestion complete:`);
  console.log(`  ✓ Upserted: ${upserted}`);
  console.log(`  ⊘ Skipped: ${skipped}`);
  console.log(`  ✗ Errors: ${errors}`);

  return { upserted, skipped, errors };
}

export async function main(
  deps: { prismaClient?: PrismaLikeClient; fetchImpl?: FetchLike } = {}
): Promise<void> {
  const { prismaClient = prisma, fetchImpl = fetch } = deps;

  try {
    console.log("Starting job ingestion from SimplifyJobs GitHub repository...\n");

    const listings = await fetchListingsFromGitHub(fetchImpl);
    await upsertJobs(listings, prismaClient);

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
