/**
 * Backfill the `keywords` column on every existing Job row by extracting
 * vocabulary terms from the job's title + summary.
 *
 * Run once after the schema migration:
 *   npx tsx prisma/backfill-keywords.ts
 *
 * Safe to re-run — it overwrites with whatever the current extractor produces,
 * so any updates to KEYWORD_UNIVERSE in src/lib/keywords.ts are picked up on
 * the next run.
 */
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { extractJobKeywords } from "../src/lib/keywords";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = createPrismaClient();

  const total = await prisma.job.count();
  console.log(`Backfilling keywords for ${total} jobs...`);

  let processed = 0;
  let updated = 0;
  let cursor: string | undefined;
  const pageSize = 200;

  for (;;) {
    const page = await prisma.job.findMany({
      select: { id: true, title: true, summary: true, keywords: true },
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
    });
    if (page.length === 0) break;

    for (const job of page) {
      const next = extractJobKeywords(job.title, job.summary);
      const same =
        next.length === job.keywords.length &&
        next.every((k, i) => k === job.keywords[i]);
      if (!same) {
        await prisma.job.update({ where: { id: job.id }, data: { keywords: next } });
        updated++;
      }
      processed++;
    }

    cursor = page[page.length - 1].id;
    process.stdout.write(`\r  processed ${processed}/${total}  (${updated} updated)`);
  }

  console.log(`\nDone. ${processed} scanned, ${updated} updated.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
