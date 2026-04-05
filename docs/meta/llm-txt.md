---
title: llms.txt
description: 使用 LLM 友好的文档文件让 AI 编程工具直接加载 Hydro API 上下文
---

# llms.txt

本站自动生成 LLM 友好的文档文件，供 AI 编程工具直接加载 Hydro API 上下文：

| 文件 | 说明 |
|------|------|
| [`/llms.txt`](/llms.txt) | 文档索引 — 按模块列出所有 API 及简要描述 |
| [`/llms-full.txt`](/llms-full.txt) | 完整文档 — 所有 API 参考的全文拼接 |

---

## 使用方式

**Claude Code** — 在项目根目录创建 `CLAUDE.md`，添加：

```
Hydro API 文档见 https://your-docs-site/llms-full.txt
```

**Cursor / Windsurf** — 在 `.cursorrules` 或 `.windsurfrules` 中引用 `/llms.txt` 链接。

**通用** — 任何支持加载远程文档的 LLM 工具，直接喂入 `/llms-full.txt` 即可获得完整的 API 参考。
