import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

interface SeedJob {
  source: string
  company: string
  title: string
  location: string
  summary: string
  url: string
  eligibilityStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE'
}

const jobs: SeedJob[] = [
  // ── 15 ELIGIBLE internships ──────────────────────────────
  {
    source: 'seed',
    company: 'Google',
    title: 'Software Engineering Intern',
    location: 'Mountain View, CA',
    summary:
      'Join Google as a Software Engineering Intern and work on large-scale distributed systems. You will collaborate with a team of engineers to build products used by billions of people worldwide.',
    url: 'https://example.com/jobs/google-swe-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Stripe',
    title: 'Backend Engineering Intern',
    location: 'San Francisco, CA',
    summary:
      'Build and maintain APIs that power global commerce at Stripe. This internship focuses on scalable backend systems and payments infrastructure.',
    url: 'https://example.com/jobs/stripe-backend-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Figma',
    title: 'Product Design Intern',
    location: 'San Francisco, CA',
    summary:
      'Design collaborative tools used by millions of designers. Work alongside product teams to ship features in Figma\'s flagship design application.',
    url: 'https://example.com/jobs/figma-design-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Airbnb',
    title: 'Frontend Engineering Intern',
    location: 'San Francisco, CA',
    summary:
      'Build user-facing features for Airbnb\'s marketplace using React and modern web technologies. Contribute to a platform that connects travelers worldwide.',
    url: 'https://example.com/jobs/airbnb-frontend-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Coinbase',
    title: 'Blockchain Engineering Intern',
    location: 'Remote',
    summary:
      'Work on smart contract integrations and blockchain infrastructure at Coinbase. Gain hands-on experience with Web3 technologies and crypto markets.',
    url: 'https://example.com/jobs/coinbase-blockchain-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Notion',
    title: 'Full Stack Engineering Intern',
    location: 'New York, NY',
    summary:
      'Build features for Notion\'s collaborative workspace product. Work across the stack using TypeScript, React, and server-side technologies.',
    url: 'https://example.com/jobs/notion-fullstack-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Vercel',
    title: 'Developer Experience Intern',
    location: 'Remote',
    summary:
      'Improve developer workflows and tooling at Vercel. Help shape the future of frontend deployment and the Next.js ecosystem.',
    url: 'https://example.com/jobs/vercel-dx-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Robinhood',
    title: 'Data Engineering Intern',
    location: 'Menlo Park, CA',
    summary:
      'Build data pipelines and analytics infrastructure that powers financial products for millions of users. Work with Spark, Kafka, and cloud-native tools.',
    url: 'https://example.com/jobs/robinhood-data-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Plaid',
    title: 'API Platform Intern',
    location: 'San Francisco, CA',
    summary:
      'Design and maintain APIs that connect thousands of fintech applications to banking infrastructure. Focus on reliability, security, and developer experience.',
    url: 'https://example.com/jobs/plaid-api-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Databricks',
    title: 'Machine Learning Intern',
    location: 'San Francisco, CA',
    summary:
      'Build ML models and tooling on top of the Databricks Lakehouse Platform. Work on cutting-edge problems in data engineering and applied AI.',
    url: 'https://example.com/jobs/databricks-ml-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Shopify',
    title: 'Mobile Engineering Intern',
    location: 'Toronto, ON',
    summary:
      'Develop features for the Shopify mobile app used by merchants worldwide. Work with React Native and native iOS/Android technologies.',
    url: 'https://example.com/jobs/shopify-mobile-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Discord',
    title: 'Infrastructure Engineering Intern',
    location: 'San Francisco, CA',
    summary:
      'Scale real-time communication systems serving hundreds of millions of users. Work on distributed systems, networking, and cloud infrastructure.',
    url: 'https://example.com/jobs/discord-infra-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Spotify',
    title: 'Backend Engineering Intern',
    location: 'New York, NY',
    summary:
      'Build microservices that power music discovery and streaming for millions. Work with Java, Python, and event-driven architectures.',
    url: 'https://example.com/jobs/spotify-backend-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Linear',
    title: 'Product Engineering Intern',
    location: 'Remote',
    summary:
      'Build high-performance project management tools at Linear. Focus on fast, elegant UIs using React, TypeScript, and real-time sync technology.',
    url: 'https://example.com/jobs/linear-product-intern',
    eligibilityStatus: 'ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Ramp',
    title: 'Software Engineering Intern',
    location: 'New York, NY',
    summary:
      'Build financial automation tools for businesses at Ramp. Work across the stack on expense management, accounting integrations, and payments.',
    url: 'https://example.com/jobs/ramp-swe-intern',
    eligibilityStatus: 'ELIGIBLE',
  },

  // ── 10 NOT_ELIGIBLE internships ──────────────────────────
  {
    source: 'seed',
    company: 'U.S. Department of Defense',
    title: 'Cybersecurity Intern (Pathways Program)',
    location: 'Washington, DC',
    summary:
      'Government internship requiring SF-86 security clearance application, multi-step USAJobs process, and federal background investigation. Not eligible for quick-apply.',
    url: 'https://example.com/jobs/dod-cyber-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Lockheed Martin',
    title: 'Systems Engineering Intern',
    location: 'Bethesda, MD',
    summary:
      'Defense contractor internship requiring Workday application portal, security clearance eligibility, and multi-stage interview process with separate assessments.',
    url: 'https://example.com/jobs/lockheed-systems-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Goldman Sachs',
    title: 'Investment Banking Summer Analyst',
    location: 'New York, NY',
    summary:
      'Competitive IB program with HireVue video assessments, Superday interviews, and multi-round evaluation. Application through proprietary Goldman Sachs careers portal.',
    url: 'https://example.com/jobs/gs-ib-summer-analyst',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'NASA',
    title: 'Aerospace Engineering Intern',
    location: 'Houston, TX',
    summary:
      'Federal government internship through OSSI portal requiring U.S. citizenship verification, faculty endorsement, and multi-step federal application process.',
    url: 'https://example.com/jobs/nasa-aero-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'JPMorgan Chase',
    title: 'Quantitative Research Intern',
    location: 'New York, NY',
    summary:
      'Quant internship requiring HackerRank coding assessment, math aptitude tests, and multi-round Pymetrics behavioral evaluation through proprietary portal.',
    url: 'https://example.com/jobs/jpm-quant-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Deloitte',
    title: 'Consulting Intern',
    location: 'Chicago, IL',
    summary:
      'Big Four consulting internship with Workday-based application, case study interviews, and multi-week evaluation timeline. Requires separate transcript upload portal.',
    url: 'https://example.com/jobs/deloitte-consulting-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'U.S. State Department',
    title: 'Foreign Affairs IT Intern',
    location: 'Washington, DC',
    summary:
      'Federal internship requiring USAJobs application, DS-160 clearance forms, and extensive background check. Multi-month application process with no quick-apply option.',
    url: 'https://example.com/jobs/state-dept-it-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'McKinsey & Company',
    title: 'Business Analyst Intern',
    location: 'Atlanta, GA',
    summary:
      'Elite consulting internship with proprietary application portal, Imbellus problem-solving assessment, and multiple rounds of case-based interviews.',
    url: 'https://example.com/jobs/mckinsey-ba-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Raytheon Technologies',
    title: 'Embedded Systems Intern',
    location: 'Tucson, AZ',
    summary:
      'Defense contractor internship requiring Workday portal, ITAR compliance verification, and security clearance eligibility. Not eligible for automated application.',
    url: 'https://example.com/jobs/raytheon-embedded-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
  {
    source: 'seed',
    company: 'Booz Allen Hamilton',
    title: 'Data Science Intern',
    location: 'McLean, VA',
    summary:
      'Government consulting internship with Workday application, TS/SCI clearance requirement, and multi-stage federal hiring process. Quick-apply not supported.',
    url: 'https://example.com/jobs/booz-allen-data-intern',
    eligibilityStatus: 'NOT_ELIGIBLE',
  },
]

async function main() {
  console.log('Seeding 25 jobs...')

  for (const job of jobs) {
    await prisma.job.upsert({
      where: {
        title_company: {
          title: job.title,
          company: job.company,
        },
      },
      update: {
        source: job.source,
        location: job.location,
        summary: job.summary,
        url: job.url,
        eligibilityStatus: job.eligibilityStatus,
      },
      create: {
        source: job.source,
        company: job.company,
        title: job.title,
        location: job.location,
        summary: job.summary,
        url: job.url,
        eligibilityStatus: job.eligibilityStatus,
      },
    })
  }

  const count = await prisma.job.count()
  console.log(`Seeding complete. Total jobs in database: ${count}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
