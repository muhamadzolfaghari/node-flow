import { RELEASES_V1 } from "./changelog/releasesv1.ts";
import { RELEASES_V0 } from "./changelog/releasesv0.ts";

export { UPCOMING_ROADMAP } from "./changelog/roadmap.ts";

export const CHANGELOG_ENTRIES = [...RELEASES_V1, ...RELEASES_V0];
// @ts-nocheck
