import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { tags?: string[]; paths?: string[] };
  const tags = (body.tags ?? []).filter((t) => typeof t === "string").slice(0, 50);
  const paths = (body.paths ?? []).filter((p) => typeof p === "string" && p.startsWith("/")).slice(0, 50);
  // Content edits from the admin should be visible on the very next request, so stale content is
  // never served for a revalidated tag (the API is local and fast, so the one blocking fetch is cheap).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  for (const path of paths) revalidatePath(path);
  return NextResponse.json({ success: true, revalidated: { tags, paths }, at: new Date().toISOString() });
}
