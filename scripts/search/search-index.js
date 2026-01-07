// scripts/search/search-index.js
// Build MiniSearch index for the static site.
//
// INPUT (default):  rag/chunks.jsonl   (repo root)
// OUTPUT (default): _site/search/index.json + _site/search/docs.json
//
// Env overrides:
//   CHUNKS_PATH, SEARCH_OUT_DIR, MAX_TEXT_CHARS_PER_PAGE

import fs from "node:fs/promises";
import path from "node:path";
import MiniSearch from "minisearch";

const CHUNKS_PATH = process.env.CHUNKS_PATH || "rag/chunks.jsonl";
const OUT_DIR = process.env.SEARCH_OUT_DIR || "_site/search";
const MAX_TEXT_CHARS_PER_PAGE = Number(process.env.MAX_TEXT_CHARS_PER_PAGE || 20000);

function normalise(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

async function main() {
  const raw = await fs.readFile(CHUNKS_PATH, "utf8");
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

  // Merge chunks per URL into a single "page doc"
  const byUrl = new Map();
  for (const line of lines) {
    const rec = JSON.parse(line);
    const url = rec.url;
    const title = rec.title || url;
    const text = normalise(rec.text || "");

    if (!byUrl.has(url)) byUrl.set(url, { id: url, url, title, text: "" });

    const entry = byUrl.get(url);
    entry.title = title || entry.title;

    const combined = (entry.text ? entry.text + "\n\n" : "") + text;
    entry.text = combined.slice(0, MAX_TEXT_CHARS_PER_PAGE);
  }

  const docs = Array.from(byUrl.values());

  const miniSearch = new MiniSearch({
    fields: ["title", "text"],
    storeFields: ["url", "title"]
  });

  miniSearch.addAll(docs);

  await fs.mkdir(OUT_DIR, { recursive: true });

  // docs.json contains (trimmed) text so the UI/API can build snippets
  await fs.writeFile(
    path.join(OUT_DIR, "docs.json"),
    JSON.stringify(docs.map(d => ({ url: d.url, title: d.title, text: d.text }))),
    "utf8"
  );

  // index.json is the serialised MiniSearch index
  await fs.writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify(miniSearch),
    "utf8"
  );

  console.log(`Built search index for ${docs.length} pages`);
  console.log(`Wrote: ${path.join(OUT_DIR, "index.json")}`);
  console.log(`Wrote: ${path.join(OUT_DIR, "docs.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
