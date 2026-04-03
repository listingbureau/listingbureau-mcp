// Module-level state — reset via resetForTesting() in test files
let updateNotice: string | null = null;
let noticeConsumed = false;

/** Compare semver strings. Returns true only if latest > current. */
export function isNewerVersion(latest: string, current: string): boolean {
  const latestParts = latest.split(".").map(Number);
  const currentParts = current.split(".").map(Number);

  if (latestParts.length !== 3 || currentParts.length !== 3) return false;
  if (latestParts.some((n) => !Number.isFinite(n)) || currentParts.some((n) => !Number.isFinite(n)))
    return false;

  for (let i = 0; i < 3; i++) {
    if (latestParts[i] > currentParts[i]) return true;
    if (latestParts[i] < currentParts[i]) return false;
  }
  return false;
}

/** Fire-and-forget npm registry check. Stores notice for later retrieval. */
export async function checkForUpdate(currentVersion: string): Promise<void> {
  try {
    const res = await fetch("https://registry.npmjs.org/listingbureau-mcp/latest", {
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { version?: string };
    const latest = json.version;
    if (!latest || !/^\d+\.\d+\.\d+$/.test(latest)) return;

    if (isNewerVersion(latest, currentVersion)) {
      updateNotice =
        `📦 Update available: v${currentVersion} → v${latest}\n` +
        `To update:\n` +
        `  npm: npx listingbureau-mcp@latest (or npm update -g listingbureau-mcp)\n` +
        `  Desktop: Download from https://github.com/listingbureau/listingbureau-mcp/releases/latest`;
    }
  } catch {
    // Silent failure — network errors, timeouts, bad JSON all swallowed
  }
}

/** Returns the update notice once, then null for all subsequent calls. */
export function getUpdateNotice(): string | null {
  if (noticeConsumed) return null;
  if (updateNotice) {
    noticeConsumed = true;
    return updateNotice;
  }
  return null;
}

/** Reset state for testing. */
export function resetForTesting(): void {
  updateNotice = null;
  noticeConsumed = false;
}
