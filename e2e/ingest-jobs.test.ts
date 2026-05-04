import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      job = { upsert: vi.fn() };
      $disconnect = vi.fn().mockResolvedValue(undefined);
    },
  };
});

const { determineEligibility, fetchListingsFromGitHub, upsertJobs } = await import("../prisma/ingest-jobs");

type SimplifyJobEntry = import("../prisma/ingest-jobs").SimplifyJobEntry;

describe("determineEligibility", () => {
  it("marks roles with restricted keywords as NOT_ELIGIBLE", () => {
    const job: SimplifyJobEntry = {
      company_name: "DefenseCo",
      job_title: "Software Intern",
      location: "Remote",
      job_description: "Requires TS/SCI clearance.",
      url: "https://example.com/job/1",
    };

    expect(determineEligibility(job)).toBe("NOT_ELIGIBLE");
  });

  it("marks normal roles as ELIGIBLE", () => {
    const job: SimplifyJobEntry = {
      company_name: "StartupCo",
      job_title: "Backend Intern",
      location: "San Francisco, CA",
      job_description: "Build internal tools and APIs.",
      url: "https://example.com/job/2",
    };

    expect(determineEligibility(job)).toBe("ELIGIBLE");
  });
});

describe("fetchListingsFromGitHub", () => {
  beforeEach(() => {
    delete process.env.GITHUB_TOKEN;
  });

  it("fetches and returns listings from GitHub", async () => {
    const listings: SimplifyJobEntry[] = [
      {
        company_name: "Acme",
        job_title: "Software Intern",
        location: "Remote",
        url: "https://example.com/job/3",
      },
    ];

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(listings), { status: 200 }));

    const result = await fetchListingsFromGitHub(fetchMock);

    expect(result).toEqual(listings);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({ Accept: "application/vnd.github.v3.raw" });
  });

  it("adds authorization header when GITHUB_TOKEN is set", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    await fetchListingsFromGitHub(fetchMock);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({
      Accept: "application/vnd.github.v3.raw",
      Authorization: "token test-token",
    });
  });

  it("throws when GitHub returns a non-OK response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("rate limited", { status: 429, statusText: "Too Many Requests" }));

    await expect(fetchListingsFromGitHub(fetchMock)).rejects.toThrow(
      "Failed to fetch listings from GitHub: 429 Too Many Requests"
    );
  });
});

describe("upsertJobs", () => {
  it("upserts jobs and returns counters", async () => {
    const listings: SimplifyJobEntry[] = [
      {
        company_name: "Acme",
        job_title: "Platform Intern",
        location: "Austin, TX",
        job_description: "Build services",
        url: "https://example.com/job/4",
      },
    ];

    const upsert = vi.fn().mockResolvedValue({});
    const prismaMock = {
      job: { upsert },
      $disconnect: vi.fn().mockResolvedValue(undefined),
    };

    const result = await upsertJobs(listings, prismaMock);

    expect(result).toEqual({ upserted: 1, skipped: 0, errors: 0 });
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith({
      where: {
        title_company: {
          title: "Platform Intern",
          company: "Acme",
        },
      },
      update: {
        location: "Austin, TX",
        summary: "Build services",
        url: "https://example.com/job/4",
        eligibilityStatus: "ELIGIBLE",
        updatedAt: expect.any(Date),
      },
      create: {
        title: "Platform Intern",
        company: "Acme",
        location: "Austin, TX",
        summary: "Build services",
        url: "https://example.com/job/4",
        eligibilityStatus: "ELIGIBLE",
      },
    });
  });

  it("counts unique-constraint failures as skipped and other failures as errors", async () => {
    const listings: SimplifyJobEntry[] = [
      {
        company_name: "Acme",
        job_title: "First Intern",
        location: "Remote",
        url: "https://example.com/job/5",
      },
      {
        company_name: "Acme",
        job_title: "Second Intern",
        location: "Remote",
        url: "https://example.com/job/6",
      },
    ];

    const uniqueError = new Error("Unique constraint failed");
    const genericError = new Error("database unavailable");
    const upsert = vi
      .fn()
      .mockRejectedValueOnce(uniqueError)
      .mockRejectedValueOnce(genericError);

    const prismaMock = {
      job: { upsert },
      $disconnect: vi.fn().mockResolvedValue(undefined),
    };

    const result = await upsertJobs(listings, prismaMock);

    expect(result).toEqual({ upserted: 0, skipped: 1, errors: 1 });
  });
});
