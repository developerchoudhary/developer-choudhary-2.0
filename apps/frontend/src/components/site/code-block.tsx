import { codeToHtml } from "shiki";

export async function CodeBlock({
  code,
  language,
  filename,
}: {
  code: string;
  language: string;
  filename?: string;
}) {
  let html = "";
  try {
    html = await codeToHtml(code, { lang: language || "text", theme: "github-dark-default" });
  } catch {
    html = `<pre><code>${code.replace(/</g, "&lt;")}</code></pre>`;
  }
  return (
    <figure className="not-prose overflow-hidden rounded-xl border border-line bg-[#0d1117]">
      {filename && (
        <figcaption className="border-b border-white/10 px-4 py-2 font-mono text-xs text-[#8b949e]">
          {filename}
        </figcaption>
      )}
      <div
        className="overflow-x-auto p-4 text-[0.85rem] leading-relaxed"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is escaped
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
