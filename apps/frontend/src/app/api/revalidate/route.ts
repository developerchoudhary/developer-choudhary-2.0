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
  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);
  return NextResponse.json({ success: true, revalidated: { tags, paths }, at: new Date().toISOString() });
}
