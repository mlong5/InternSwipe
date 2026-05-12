import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env.local" });
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const jobs = await prisma.job.findMany({
    take: 10,
    orderBy: { createdAt: "asc" },
  });

  console.log("First 10 jobs ingested:\n");
  jobs.forEach((job: any, index: number) => {
    console.log(`${index + 1}. ${job.title}`);
    console.log(`   Company: ${job.company}`);
    console.log(`   Location: ${job.location}`);
    console.log(`   Eligibility: ${job.eligibilityStatus}`);
    console.log();
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
