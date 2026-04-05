import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';

interface ParsedDoc {
  rel: string;
  attrs: Record<string, string>;
  body: string;
  section: string;
}

/**
 * Parse YAML front matter from markdown content.
 * Handles quoted values (e.g. title: "@foo/bar baz").
 */
function parseFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { attrs: {}, body: content };
  const attrs: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      let val = line.slice(idx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      attrs[line.slice(0, idx).trim()] = val;
    }
  }
  return { attrs, body: match[2] };
}

/**
 * Collect all .md files recursively, excluding index.md and TEMPLATE.md.
 */
function collectMdFiles(dir: string): string[] {
  const files: string[] = [];
  function walk(d: string) {
    for (const entry of readdirSync(d)) {
      const full = resolve(d, entry);
      if (statSync(full).isDirectory()) {
        if (entry !== '.vitepress') walk(full);
      } else if (entry.endsWith('.md') && entry !== 'index.md' && entry !== 'TEMPLATE.md') {
        files.push(full);
      }
    }
  }
  walk(dir);
  return files;
}

const SECTIONS: { title: string; pattern: RegExp }[] = [
  { title: '核心', pattern: /^backend\/(context|event|error)/ },
  { title: '数据模型', pattern: /^backend\/models\// },
  { title: '服务', pattern: /^backend\/service[s]?\// },
  { title: '处理器', pattern: /^backend\/handler\// },
  { title: '框架', pattern: /^backend\/framework\// },
  { title: '工具 (Backend)', pattern: /^backend\/utils\// },
  { title: 'UI 组件', pattern: /^ui\/(page|context|dialog|socket|lazyload|page-loader|third-party|upload-files|notification)/ },
  { title: '子组件', pattern: /^ui\/components\// },
  { title: '工具 (UI)', pattern: /^ui\/utils\// },
];

function getSection(relPath: string): string {
  for (const s of SECTIONS) {
    if (s.pattern.test(relPath)) return s.title;
  }
  return 'Other';
}

/**
 * Generate llms.txt and llms-full.txt as VitePress build output.
 * Uses siteConfig.srcDir from VitePress to locate docs at build time.
 */
export function generateLlmsTxt() {
  return (siteConfig: { srcDir: string; outDir: string }) => {
    const docsDir = siteConfig.srcDir;
    const outDir = siteConfig.outDir;
    const mdFiles = collectMdFiles(docsDir);

    // Parse all docs
    const docs: ParsedDoc[] = mdFiles.map((fp) => {
      const content = readFileSync(fp, 'utf-8');
      const { attrs, body } = parseFrontmatter(content);
      const rel = relative(docsDir, fp).replace(/\.md$/, '');
      return { rel, attrs, body, section: getSection(rel) };
    });

    // Group by section
    const grouped = new Map<string, ParsedDoc[]>();
    for (const doc of docs) {
      const list = grouped.get(doc.section) ?? [];
      list.push(doc);
      grouped.set(doc.section, list);
    }

    // --- llms.txt (index) ---
    let index = '# Hydro API Docs\n\n';
    index += '> Hydro 在线评测系统插件开发 API 文档。\n';
    index += '> Source: https://github.com/hydro-dev/Hydro\n\n';
    index += 'This file is an LLM-friendly index. Full content: [llms-full.txt](/llms-full.txt)\n\n';

    for (const [section, items] of grouped) {
      index += `## ${section}\n\n`;
      for (const item of items) {
        const title = item.attrs.title ?? item.rel;
        const desc = item.attrs.description ?? '';
        index += `- [${title}](/${item.rel}.md)`;
        if (desc) index += `: ${desc}`;
        index += '\n';
      }
      index += '\n';
    }

    // --- llms-full.txt (full content) ---
    let full = '# Hydro API Docs — Full Reference\n\n';
    full += '> Hydro 在线评测系统插件开发 API 文档（完整版）。\n';
    full += '> Source: https://github.com/hydro-dev/Hydro\n\n';

    for (const [section, items] of grouped) {
      full += `---\n\n## ${section}\n\n`;
      for (const item of items) {
        const title = item.attrs.title ?? item.rel;
        const sourceUrl = item.attrs.source_url ?? '';
        full += `### ${title}\n\n`;
        if (sourceUrl) {
          full += `> Source: ${sourceUrl}\n\n`;
        }
        full += item.body.trim();
        full += '\n\n';
      }
    }

    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'llms.txt'), index, 'utf-8');
    writeFileSync(resolve(outDir, 'llms-full.txt'), full, 'utf-8');
  };
}
