# 懒加载系统

源码: [`packages/ui-default/lazyload.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/lazyload.ts)

前端模块懒加载系统，用于动态加载脚本和管理插件贡献的特性。支持内置懒加载模块（通过脚本注入）和外部注册的特性。

## 函数

### load

```ts
async function load(name: string): Promise<any>
```

默认导出。通过注入 `<script>` 标签并等待模块的解析回调来动态加载懒加载模块。对 `'echarts'` 和 `'moment'` 做特殊处理，使用原生动态导入。对相同名称的后续调用返回缓存结果。

**参数:**
- `name` — 要加载的模块名称。必须存在于 `window.lazyloadMetadata` 中（格式为 `{name}.lazy.js`），或是特殊情况之一（`'echarts'`、`'moment'`）。

**行为:**
1. 检查特殊情况（`echarts`、`moment`）— 直接使用 `import()`。
2. 验证模块存在于 `window.lazyloadMetadata` 中。
3. 若已在加载/已加载，从 `lazyModules[name]` 返回缓存的 Promise。
4. 创建 `<script>` 元素，指向 `{host}lazy/{hash}/{name}.lazy.js`（若配置了 CDN 则使用 CDN）。
5. 在 `window.lazyModuleResolver[name]` 中注册解析器以 resolve 该 Promise。
6. 设置 30 秒超时，超时则 reject。
7. 将脚本追加到 `document.body`。

### getFeatures

```ts
async function getFeatures(name: string): Promise<(string | (() => Promise<any>))[]>
```

收集匹配给定名称的所有已注册特性（包括带版本号的变体如 `name@version`）。同时搜索插件注册的 `features` 映射和旧的 `window.externalModules`。返回合并后的特性条目数组（函数或 URL 字符串）。

**参数:**
- `name` — 要查询的特性名称。匹配精确名称及任何 `name@...` 变体。

### loadFeatures

```ts
async function loadFeatures(name: string, ...args: any[]): Promise<void>
```

加载并应用注册在给定名称下的所有特性。幂等操作 —— 每个特性名称仅加载一次，通过 `loaded` 数组跟踪。每个特性条目根据其类型以不同方式解析：

- **函数** — 直接以 `...args` 调用。
- **URL 字符串**（以 `http` 或 `/` 开头）— 通过 `legacyLoadExternalModule` 加载，然后调用已解析模块的 `apply` 或 `default` 函数。
- **模块路径字符串** — 通过 `load()` 加载，然后调用模块的 `apply` 或 `default.apply` 函数。

**参数:**
- `name` — 要加载的特性名称。
- `...args` — 转发给每个特性 apply 函数的参数。

### provideFeature

```ts
function provideFeature(name: string, content: string | (() => Promise<any>)): void
```

注册一个特性，后续可通过 `loadFeatures()` 加载。若特性名称已注册或已加载，则在控制台发出警告。

**参数:**
- `name` — 特性名称。可包含版本后缀（如 `'markdown@2'`）。
- `content` — 返回 Promise 的函数，或 URL/模块路径字符串。

## 属性

### loaded

```ts
const loaded: string[]
```

导出数组，跟踪已被 `loadFeatures()` 加载的特性名称。内部用于幂等检查 —— 一旦名称出现在此数组中，`loadFeatures()` 在后续调用中会跳过它。
