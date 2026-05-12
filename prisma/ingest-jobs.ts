import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Load environment variables from .env.local
loadEnv({ path: ".env.local" });
loadEnv();
if (!process.env.DATABASE_URL) {
  loadEnv({ path: ".env.local.example" });
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
}

type PrismaLikeClient = PrismaClient;

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
  const url = `https://raw.githubusercontent.com/${SIMPLIFY_REPO_OWNER}/${SIMPLIFY_REPO_NAME}/${SIMPLIFY_BRANCH}/README.md`;

  console.log(`Fetching jobs from GitHub: ${url}`);

  const response = await fetchImpl(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch listings from GitHub: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();
  const listings = parseReadmeMarkdown(text);
  console.log(`Fetched ${listings.length} job listings from SimplifyJobs`);
  return listings;
}

function parseReadmeMarkdown(markdown: string): SimplifyJobEntry[] {
  const listings: SimplifyJobEntry[] = [];
  const today = new Date().toISOString().split('T')[0] || "";
  
  // Match HTML table rows: <tr><td>Company</td><td>Title</td><td>Location</td>...
  const trMatches = markdown.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
  
  for (const trHtml of trMatches) {
    // Extract all <td> content from the row
    const tdMatches = trHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    const cells: string[] = [];
    
    for (const tdHtml of tdMatches) {
      // Extract text between <td> tags
      const match = tdHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/);
      if (match && match[1]) {
        const cellHtml = match[1];
        // Extract text content, removing HTML tags and extra whitespace
        const text = cellHtml
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (text) {
          cells.push(text);
        }
      }
    }
    
    // Table structure: [Company, Title, Location, Links/Apply, Days]
    if (cells.length >= 4) {
      const company = cells[0] || "";
      const title = cells[1] || "";
      const location = cells[2] || "";
      
      // Validate entries - skip headers and empty rows
      if (company && title && location &&
          company !== 'Company' &&
          title !== 'Title' &&
          !company.includes('Apply') &&
          company.length > 2 &&
          title.length > 2 &&
          location.length > 0) {
        
        listings.push({
          company_name: company,
          job_title: title,
          location: location,
          job_description: "",
          url: `https://github.com/${SIMPLIFY_REPO_OWNER}/${SIMPLIFY_REPO_NAME}`,
          date_posted: today,
        });
      }
    }
  }
  
  return listings;
}

export async function upsertJobs(
  listings: SimplifyJobEntry[],
  prismaClient: PrismaLikeClient | undefined = undefined
): Promise<{ upserted: number; skipped: number; errors: number }> {
  const client = prismaClient || getPrismaClient();
  let upserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of listings) {
    try {
      const eligibilityStatus = determineEligibility(entry);

      await client.job.upsert({
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
        },
        create: {
          source: "SimplifyJobs",
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
  const { prismaClient = getPrismaClient(), fetchImpl = fetch } = deps;

  try {
    console.log("Starting job ingestion from SimplifyJobs GitHub repository...\n");

    const listings = await fetchListingsFromGitHub(fetchImpl);
    await upsertJobs(listings, prismaClient);

    console.log("\nJob ingestion successful!");
  } catch (error) {
    console.error("Job ingestion failed:", error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

const isMainModule = () => {
  const argv = process.argv[1];
  if (!argv) return false;
  return import.meta.url === `file://${argv}` || import.meta.url.endsWith(argv);
};

if (isMainModule()) {
  void main();
}
