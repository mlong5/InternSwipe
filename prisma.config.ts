import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Prisma CLI does not automatically load .env.local.
loadEnv({ path: '.env.local' })
loadEnv()
if (!process.env.DATABASE_URL) {
  loadEnv({ path: '.env.local.example' })
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
})
