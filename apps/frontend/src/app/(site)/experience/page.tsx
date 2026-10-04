import { redirect } from "next/navigation";

/** Experience now lives on the About page; keep old links working. */
export default function ExperiencePage() {
  redirect("/about#experience");
}
