import { getSite } from "@/lib/data";
import { defaultShareCard, shareCacheControl } from "@/lib/og";

// The site-wide share image follows the active theme and the profile, so it is drawn on request.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return defaultShareCard(await getSite(), { "Cache-Control": shareCacheControl(request) });
}
