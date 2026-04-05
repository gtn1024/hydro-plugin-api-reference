---
title: loadMonaco
description: 按需加载 Monaco 编辑器，支持可选语言特性和插件扩展
source: packages/ui-default/components/monaco/loader.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/monaco/loader.ts
---
# loadMonaco

源码: [`packages/ui-default/components/monaco/loader.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/monaco/loader.ts)

按需加载 Monaco 编辑器，支持可选语言特性和插件扩展。对并发的加载调用进行序列化以避免重复初始化。

## 函数

### load

```ts
async function load(features?: string[]): Promise<{
  monaco: typeof import('monaco-editor/esm/vs/editor/editor.api');
  registerAction: (editor: monaco.editor.IStandaloneCodeEditor, model: monaco.editor.IModel, element?: HTMLElement) => Promise<any> | null;
  customOptions: monaco.editor.IStandaloneDiffEditorConstructionOptions;
  renderMarkdown: typeof import('monaco-editor/esm/vs/base/browser/markdownRenderer').renderMarkdown;
}>
```

默认导出，从插件 API 以 `loadMonaco` 名称重新导出。加载 Monaco 编辑器及指定特性。特性仅加载一次；后续调用中已加载的特性会被跳过。

**参数:**
- `features`（默认 `['markdown']`）— 要加载的特性名称数组。内置特性：`'markdown'`、`'typescript'`、`'yaml'`。插件贡献的特性通过 `getFeatures('monaco-{feat}')` 解析。

**行为:**
1. 通过内部 Promise 链序列化并发调用。
2. 首次调用时加载 i18n 语言数据（支持 zh、zh_TW、ko）。
3. 动态导入 `./index`（Monaco 编辑器模块）。
4. 遍历 `features`，通过内置加载器或外部插件加载器逐个加载。
5. 等待主题加载完成。
6. 返回 Monaco 实例及辅助工具。

**返回值:**
- `monaco` — 完整的 Monaco 编辑器 API 模块。
- `registerAction` — 在编辑器实例上注册键盘快捷键（Ctrl+Enter 提交、Ctrl+Shift+P 命令面板、Alt+Shift+F 格式化）。同时在 markdown 模式下启用图片/zip 粘贴上传。
- `customOptions` — 从 `localStorage('editor.config')` 读取的持久化编辑器配置。可变；更改通过 `saveCustomOptions()` 保存。
- `renderMarkdown` — 从 `monaco-editor/esm/vs/base/browser/markdownRenderer` 重新导出。

## 函数（已弃用）

### legacyLoadExternalModule

```ts
async function legacyLoadExternalModule(target: string): Promise<any>
```

**@deprecated** 通过向 `<head>` 注入 `<script>` 元素加载外部脚本。结果缓存在 `window.exports` 中。供外部特性加载器内部使用，用于基于 URL 的插件脚本。

## 内置特性加载器

| 特性 | 说明 |
|---------|-------------|
| `i18n` | 加载 Monaco UI 翻译的语言数据（zh、zh_TW、ko）。首次 `load()` 调用时自动加载。 |
| `markdown` | 导入 `./languages/markdown` 提供 Markdown 语法支持。 |
| `typescript` | 导入 `./languages/typescript` 并调用 `loadTypes()` 提供 TypeScript/JavaScript 支持。 |
| `yaml` | 导入 `./languages/yaml` 提供 YAML 语法支持。 |
| `external` | 通过 `getFeatures('monaco-{feat}')` 加载插件贡献的特性。每个条目可以是函数、URL 字符串或模块路径。 |
