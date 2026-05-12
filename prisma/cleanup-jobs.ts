import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const { count } = await prisma.job.deleteMany({
      where: { url: { contains: "example.com" } },
    });
    console.log(`Deleted ${count} placeholder job(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
