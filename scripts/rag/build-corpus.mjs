// build-corpus.mjs
// Build-time corpus generator for RAG.
// Reads HTML files from a directory (default: _site), extracts main content,
// chunks it, counts tokens, and writes JSONL chunks + a pages index.
//
// Required deps:
//   fast-glob, jsdom, @mozilla/readability, turndown, @dqbd/tiktoken
//
// Outputs (default): rag/chunks.jsonl, rag/pages.json, rag/.meta.json

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { get_encoding } from "@dqbd/tiktoken";

const CONFIG_PATH = process.env.RAG_CONFIG || "rag.config.json";

// Write to repo root /rag by default
const OUT_DIR = process.env.RAG_OUT_DIR || "rag";

function normaliseWhitespace(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function safeJsonLine(obj) {
  return JSON.stringify(obj).replace(/\u2028|\u2029/g, "");
}

function tokenCount(encoding, text) {
  return encoding.encode(text).length;
}

/**
 * URL mapping options:
 * - "html": keep .html in URLs (about.html -> /about.html). Safer for pure static hosting.
 * - "pretty": drop .html (about.html -> /about) and treat index.html as folder route (/foo/index.html -> /foo/).
 */
function filePathToUrl(distDirAbs, fileAbs, baseUrl, urlStyle = "html") {
  const rel = path.relative(distDirAbs, fileAbs).replace(/\\/g, "/");

  // Root index.html => /
  if (rel === "index.html") return new URL("/", baseUrl).toString();

  // /foo/index.html => /foo/
  if (rel.endsWith("/index.html")) {
    const p = rel.slice(0, -"/index.html".length) + "/";
    return new URL("/" + p, baseUrl).toString();
  }

  // Other HTML files
  if (rel.endsWith(".html")) {
    if (urlStyle === "pretty") {
      const noExt = rel.slice(0, -".html".length);
      return new URL("/" + noExt, baseUrl).toString();
    }
    return new URL("/" + rel, baseUrl).toString();
  }

  // Fallback
  return new URL("/" + rel, baseUrl).toString();
}

function extractMainContent(html, url) {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  const title =
    normaliseWhitespace(doc.querySelector("title")?.textContent) ||
    normaliseWhitespace(doc.querySelector("h1")?.textContent) ||
    "";

  const reader = new Readability(doc);
  const article = reader.parse();

  if (article?.content) {
    return {
      title: title || normaliseWhitespace(article.title) || "",
      excerpt: normaliseWhitespace(article.excerpt) || "",
      contentHtml: article.content
    };
  }

  const body = doc.querySelector("body");
  const fallbackText = normaliseWhitespace(body?.textContent || "");
  if (!fallbackText) return null;

  const escaped = fallbackText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return {
    title,
    excerpt: "",
    contentHtml: `<div><p>${escaped}</p></div>`
  };
}

/**
 * Chunk markdown by headings, then by paragraphs as needed.
 * Keeps chunks within maxTokens; drops chunks smaller than minTokens.
 */
function chunkMarkdown({
  encoding,
  markdown,
  maxTokens,
  minTokens,
  overlapParagraphs = 0
}) {
  const parts = markdown
    .split(/\n(?=#+\s)/g)
    .map(p => p.trim())
    .filter(Boolean);

  const chunks = [];
  let buf = "";

  const flush = (text) => {
    const t = text.trim();
    if (!t) return;
    if (tokenCount(encoding, t) < minTokens) return;
    chunks.push(t);
  };

  for (const part of parts) {
    const next = buf ? `${buf}\n\n${part}` : part;

    if (tokenCount(encoding, next) <= maxTokens) {
      buf = next;
      continue;
    }

    flush(buf);
    buf = "";

    if (tokenCount(encoding, part) > maxTokens) {
      const paras = part.split(/\n{2,}/g).map(p => p.trim()).filter(Boolean);

      let pbuf = "";
      let prevParas = [];

      for (const para of paras) {
        const candidate = pbuf ? `${pbuf}\n\n${para}` : para;

        if (tokenCount(encoding, candidate) <= maxTokens) {
          pbuf = candidate;
          prevParas.push(para);
          if (prevParas.length > Math.max(3, overlapParagraphs)) prevParas.shift();
          continue;
        }

        flush(pbuf);

        if (overlapParagraphs > 0 && prevParas.length) {
          const overlap = prevParas.slice(-overlapParagraphs).join("\n\n");
          pbuf = `${overlap}\n\n${para}`.trim();
        } else {
          pbuf = para;
        }
        prevParas = [para];
      }

      flush(pbuf);
    } else {
      buf = part;
    }
  }

  flush(buf);
  return chunks;
}

async function main() {
  const rawConfig = JSON.parse(await fsp.readFile(CONFIG_PATH, "utf8"));

  // Read from _site by default
  const distDir = rawConfig.distDir ?? "_site";

  const baseUrl = rawConfig.baseUrl;
  if (!baseUrl) throw new Error("rag.config.json must include baseUrl");

  const include = rawConfig.include ?? ["**/*.html"];
  const exclude = rawConfig.exclude ?? [];
  const urlStyle = rawConfig.urlStyle ?? "html";

  const maxTokens = rawConfig.chunk?.maxTokens ?? 450;
  const minTokens = rawConfig.chunk?.minTokens ?? 120;
  const overlapParagraphs = rawConfig.chunk?.overlapParagraphs ?? 0;

  const distDirAbs = path.resolve(process.cwd(), distDir);
  const outDirAbs = path.resolve(process.cwd(), OUT_DIR);

  await fsp.mkdir(outDirAbs, { recursive: true });

  const files = await fg(include, {
    cwd: distDirAbs,
    absolute: true,
    ignore: exclude,
    onlyFiles: true
  });

  const chunksPath = path.join(outDirAbs, "chunks.jsonl");
  const pagesPath = path.join(outDirAbs, "pages.json");
  const metaPath = path.join(outDirAbs, ".meta.json");

  const chunksStream = fs.createWriteStream(chunksPath, { flags: "w" });
  const turndown = new TurndownService({ headingStyle: "atx" });
  const encoding = get_encoding("cl100k_base");

  const pages = [];
  let pagesOk = 0;
  let pagesSkipped = 0;
  let totalChunks = 0;

  for (const fileAbs of files) {
    const relPath = path.relative(distDirAbs, fileAbs).replace(/\\/g, "/");

    let html;
    try {
      html = await fsp.readFile(fileAbs, "utf8");
    } catch {
      pagesSkipped++;
      continue;
    }

    const url = filePathToUrl(distDirAbs, fileAbs, baseUrl, urlStyle);

    const extracted = extractMainContent(html, url);
    if (!extracted) {
      pagesSkipped++;
      continue;
    }

    const markdown = turndown.turndown(extracted.contentHtml).trim();
    if (markdown.length < 80) {
      pagesSkipped++;
      continue;
    }

    const title = extracted.title || url;

    const chunks = chunkMarkdown({
      encoding,
      markdown,
      maxTokens,
      minTokens,
      overlapParagraphs
    });

    if (!chunks.length) {
      pagesSkipped++;
      continue;
    }

    pages.push({
      url,
      title,
      excerpt: extracted.excerpt || "",
      source_path: relPath,
      chunkCount: chunks.length
    });

    chunks.forEach((text, i) => {
      const record = {
        id: `${url}#chunk=${i}`,
        url,
        title,
        source_path: relPath,
        chunk_index: i,
        token_count: tokenCount(encoding, text),
        text
      };
      chunksStream.write(safeJsonLine(record) + "\n");
      totalChunks++;
    });

    pagesOk++;
  }

  await new Promise((resolve) => chunksStream.end(resolve));
  await fsp.writeFile(pagesPath, JSON.stringify(pages, null, 2), "utf8");

  await fsp.writeFile(
    metaPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        configPath: CONFIG_PATH,
        distDir,
        distDirAbs,
        outDir: OUT_DIR,
        outDirAbs,
        baseUrl,
        urlStyle,
        include,
        exclude,
        pagesOk,
        pagesSkipped,
        totalPagesFound: files.length,
        totalChunks,
        chunk: { maxTokens, minTokens, overlapParagraphs }
      },
      null,
      2
    ),
    "utf8"
  );

  encoding.free();

  console.log(
    `RAG corpus built: pagesOk=${pagesOk}, pagesSkipped=${pagesSkipped}, totalChunks=${totalChunks}`
  );
  console.log(`Wrote: ${chunksPath}`);
  console.log(`Wrote: ${pagesPath}`);
  console.log(`Wrote: ${metaPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
