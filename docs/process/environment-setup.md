# Environment setup

| Field        | Value                                |
|--------------|--------------------------------------|
| Project      | InternSwipe                          |
| Course       | CS 250                               |
| Owner        | Brandon                              |
| Last updated | March 5, 2026                        |
| Version      | 2.0                                  |

## Overview

This guide walks you through setting up the InternSwipe project on your local machine from scratch. Follow each step in order. By the end of this guide, you should have the application running locally and be able to complete a test sign-up to verify that everything is working correctly.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

| Tool | Required version | How to check |
|------|-----------------|--------------|
| Node.js | Version 18 or later | Run `node --version` in your terminal. |
| npm | Version 9 or later (ships with Node.js) | Run `npm --version` in your terminal. |
| Git | Any recent version | Run `git --version` in your terminal. |

If you do not have Node.js installed, download it from the official Node.js website and install the LTS version. npm is included with the Node.js installation.

## Step 1: Clone the repository — **done**

Clone the InternSwipe repository from GitHub to your local machine:

```bash
git clone https://github.com/BryanD17/InternSwipe.git
```

Navigate into the project directory:

```bash
cd InternSwipe
```

## Step 2: Install dependencies — **done**

Install all project dependencies using npm:

```bash
npm install
```

This command reads the `package.json` file and installs all required packages into the `node_modules` directory. The installation may take a few minutes on the first run.

## Step 3: Configure environment variables — **done**

Copy the example environment file to create your local configuration:

```bash
cp .env.local.example .env.local
```

Open the `.env.local` file in your editor and fill in the Supabase credentials. You will need the following values from the Supabase project dashboard:

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project. | Supabase dashboard, under Settings, then API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous public key for client-side authentication. | Supabase dashboard, under Settings, then API. |
| `DATABASE_URL` | The PostgreSQL connection string for the pooled connection. | Supabase dashboard, under Settings, then Database, then Connection string (pooled). |
| `DIRECT_URL` | The PostgreSQL connection string for the direct connection, used by Prisma for migrations. | Supabase dashboard, under Settings, then Database, then Connection string (direct). |

If you do not have access to the Supabase project, ask Bryan to add you as a team member in the Supabase dashboard.

## Step 4: Run Prisma migrations — **done**

Apply all database migrations to set up the schema in your Supabase database:

```bash
npx prisma migrate dev
```

This command reads the migration files in the `prisma/migrations` directory and applies them to the database specified in your `DIRECT_URL` environment variable. If this is a fresh database, all migrations will be applied in order.

After running migrations, generate the Prisma client:

```bash
npx prisma generate
```

## Step 5: Seed the database — **done**

Populate the database with initial data, including curated job postings:

```bash
npx prisma db seed
```

This command runs the seed script defined in the project configuration and inserts the initial set of jobs with eligibility flags into the database.

## Step 6: Start the development server — **done**

Start the Next.js development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default. You should see output in your terminal indicating that the server is ready.

## Step 7: Verify the setup

Open your browser and navigate to `http://localhost:3000`. Verify that the application loads correctly by completing the following steps:

1. Confirm that the landing page renders without errors. — **done**
2. Create a new account using the sign-up flow. — **done** (API route implemented; UI sign-up page not yet built)
3. Log in with the account you just created. — **done** (API route implemented; UI login page not yet built)
4. Navigate to the swipe deck and confirm that job cards are displayed.

If any step fails, check the terminal output for error messages and verify that your environment variables are set correctly in the `.env.local` file.

## Troubleshooting

If you encounter issues during setup, check the following common problems:

| Problem | Solution |
|---------|----------|
| `npm install` fails with permission errors. | Do not use `sudo` with npm. If you see permission errors, fix your Node.js installation or use a version manager such as `nvm`. |
| Prisma migration fails with a connection error. | Verify that your `DIRECT_URL` in `.env.local` is correct and that your IP address is allowed in the Supabase database settings. |
| The development server starts but the page shows a blank screen. | Open the browser developer console and check for JavaScript errors. Verify that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly. |
| Sign-up does not work. | Verify that email authentication is enabled in the Supabase dashboard under Authentication, then Providers. |

If none of the above solutions resolve your issue, post a message in the team channel with the exact error message and the step where the failure occurred.
