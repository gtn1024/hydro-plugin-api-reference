---
title: llms.txt
description: 使用 LLM 友好的文档文件让 AI 编程工具直接加载 Hydro API 上下文
---

# llms.txt

本站自动生成 [llms.txt](https://llmstxt.org) 规范的文档文件，供 AI 编程工具直接加载 Hydro API 上下文，帮助 AI 更好地理解 Hydro 插件系统的组件库、API 及使用模式。

## 什么是 llms.txt？

[llms.txt](https://llmstxt.org) 是一种为 LLM 提供文档上下文的标准格式。通过在网站根目录放置 `llms.txt`（结构化索引）和 `llms-full.txt`（完整内容），AI 工具可以在编码时自动获取项目文档，提供更准确的代码建议。

## 可用资源

| 文件 | 说明 |
|------|------|
| [`/llms.txt`](/llms.txt) | 文档索引 — 按模块列出所有 API 及简要描述，包含指向完整文档的链接 |
| [`/llms-full.txt`](/llms-full.txt) | 完整文档 — 所有 API 参考的全文拼接，包含代码示例和类型签名 |

## 在 AI 工具中使用

### Cursor

在 Cursor 中使用 `@Docs` 功能加载 llms.txt：

1. 打开 **Settings → Features → Docs**
2. 点击 **Add new doc**
3. 输入 `https://hydro-plugin-api-reference.pages.dev/llms-full.txt`
4. 在对话中通过 `@Docs` 引用

详细了解 [Cursor @Docs](https://docs.cursor.com/context/@docs)

### Windsurf

在 Windsurf 中通过以下方式使用：

- 对话中通过 `@` 引用 `https://hydro-plugin-api-reference.pages.dev/llms-full.txt`
- 或在 `.windsurfrules` 文件中添加文档链接

详细了解 [Windsurf 文档](https://docs.codeium.com/windsurf)

### Claude Code

在 Claude Code 中，将文档链接添加到项目的 `CLAUDE.md`：

```markdown
Hydro API 文档见 https://hydro-plugin-api-reference.pages.dev/llms-full.txt
```

或在 **Docs / Context Files** 配置中添加该 URL。

详细了解 [Claude Code 文档上下文配置](https://docs.anthropic.com/en/docs/claude-code/memory)

### Gemini CLI

在 Gemini CLI 中，通过 `--context` 参数或在 `.gemini/config.json` 中指定文档路径：

```json
{
  "context": "https://hydro-plugin-api-reference.pages.dev/llms-full.txt"
}
```

### 其他 AI 工具

任何支持加载远程文档的 LLM 工具，均可使用以上资源：

- **Trae** — 将文件放入项目的 Knowledge Sources
- **Qoder** — 在 `.qoder/config.yml` 中添加为外部知识文件
- **通用方式** — 直接将 `/llms-full.txt` 的内容粘贴到对话上下文中
