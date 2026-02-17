import { NextResponse } from "next/server";
import { APP_VERSION, GITHUB_REPO } from "@/config/version";

interface GitHubRelease {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string;
}

// Compare semantic versions: returns 1 if a > b, -1 if a < b, 0 if equal
function compareVersions(a: string, b: string): number {
  const partsA = a.replace(/^v/, "").split(".").map(Number);
  const partsB = b.replace(/^v/, "").split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

export async function GET(request: Request) {
  // Support force refresh via query parameter
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("force") === "true";

  try {
    // Fetch latest release from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Pilbum-Update-Checker",
        },
        // Use no-store when force refresh, otherwise cache for 1 hour
        ...(forceRefresh
          ? { cache: "no-store" as const }
          : { next: { revalidate: 3600 } }),
      }
    );

    if (!response.ok) {
      // No releases found or API error
      if (response.status === 404) {
        return NextResponse.json({
          currentVersion: APP_VERSION,
          latestVersion: null,
          hasUpdate: false,
          releaseUrl: null,
          releaseName: null,
          publishedAt: null,
          releaseNotes: null,
        });
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const release: GitHubRelease = await response.json();
    const latestVersion = release.tag_name.replace(/^v/, "");
    const hasUpdate = compareVersions(latestVersion, APP_VERSION) > 0;

    return NextResponse.json({
      currentVersion: APP_VERSION,
      latestVersion,
      hasUpdate,
      releaseUrl: release.html_url,
      releaseName: release.name,
      publishedAt: release.published_at,
      releaseNotes: release.body,
    });
  } catch (error) {
    // Update check failure is non-critical, log at warn level
    return NextResponse.json(
      {
        currentVersion: APP_VERSION,
        latestVersion: null,
        hasUpdate: false,
        error: "Failed to check for updates",
      },
      { status: 500 }
    );
  }
}
