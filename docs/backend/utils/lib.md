---
title: 工具库
description: 插件开发者可用的各种工具函数和重新导出的第三方模块
source: packages/hydrooj/src/lib/
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/lib/
import: "import { nanoid, moment, buildContent, definePlugin, _, Schema, ObjectId, ... } from 'hydrooj'"
---
# 工具库

插件开发者可用的各种工具函数和重新导出的第三方模块。

---

## 核心重新导出（libs.ts）

`libs.ts` 通过 `export *` 和具名导出提供了大量核心依赖的统一入口：

### 传递模块导出

| 模块 | 说明 |
|------|------|
| `./interface` | 所有接口类型定义（`export *`） |
| `./typeutils` | 类型工具函数（`export *`） |
| `./utils` | 通用工具函数（`export *`） |

### 第三方依赖重新导出

| 导出名 | 来源 | 说明 |
|--------|------|------|
| `_` | `lodash` | Lodash 工具库 |
| `ObjectID` | `mongodb`（别名） | MongoDB `ObjectId` 的别名 |
| `ObjectId` | `mongodb` | MongoDB ObjectId 类 |
| `Filter` | `mongodb` | MongoDB 查询过滤器类型 |
| `Schema` | `schemastery` | Schema 验证库 |
| `superagent` | `superagent` | HTTP 请求库 |
| `Zip` | `@zip.js/zip.js` | ZIP 文件处理库 |
| `AdmZip` | `adm-zip` | **@deprecated** 请使用 `Zip` 代替 |
| `WebSocket` | `@hydrooj/framework` | WebSocket 类 |
| `WebSocketServer` | `@hydrooj/framework` | WebSocket 服务器类 |

### definePlugin

```typescript
function definePlugin<T = never>(args: {
  inject?: keyof Context[] | Record<keyof Context, any>;
  apply: (ctx: Context, config: T) => Promise<void> | void;
  schema?: Schema<T>;
  name?: string;
  Config?: Schema<T>;
}): typeof args
```

插件定义辅助函数。接受插件配置并原样返回，用于获得类型推断支持。

**参数**：
- `inject` — 依赖注入声明，指定插件需要的服务。
- `apply` — 插件主函数，接收 `Context` 和配置对象。
- `schema` / `Config` — 插件配置的 Schema 验证定义（两者等效）。
- `name` — 插件名称。

---

## 工具库函数

以下函数来自 `packages/hydrooj/src/lib/` 目录：

## 重新导出的第三方模块

### nanoid

```typescript
import { nanoid } from 'hydrooj';
```

从 [`nanoid`](https://github.com/ai/nanoid) 包重新导出。生成唯一的 URL 友好字符串 ID。内部用于生成令牌 ID、存储键和其他随机标识符。

### moment

```typescript
import { moment } from 'hydrooj';
```

作为 `moment-timezone` 的默认导出重新导出。支持完整时区的日期/时间操作库。请使用此模块而非裸 `moment` 以获取时区感知的日期处理。

### isMoment

```typescript
import { isMoment } from 'hydrooj';
```

从 `moment-timezone` 重新导出。类型守卫函数，当给定值为 Moment.js 对象时返回 `true`。

---

## 内容构建

### buildContent

```typescript
function buildContent(
  source: ProblemSource,
  type?: 'markdown' | 'html',
  translate?: (s: string) => string
): string
```

将结构化的题目描述对象转换为格式化的 markdown 或 HTML 字符串。各节（背景、描述、输入、输出、提示、来源）使用适当的标题渲染。样例输入/输出格式化为围栏代码块（markdown）或 `<pre><code>` 块（HTML）。

**参数**：
- `source` — 具有可选字段的对象：`background`、`description`、`input`、`output`、`samples`、`samplesRaw`、`hint`、`source`。也接受旧版数组格式以向后兼容。
- `type` — 输出格式，默认 `'markdown'`。
- `translate` — 可选的翻译函数，应用于节标题（如将 `"Background"` 翻译为本地化文本）。

---

## MIME 类型检测

### mime

```typescript
function mime(file: string): string
```

返回给定文件名的 MIME 类型。`.in`、`.out`、`.ans` 扩展名特殊处理为 `'text/plain'`（竞赛编程中常见）。回退到 `mime-types` 查找，最后为 `'application/octet-stream'`。

---

## 难度计算

### difficultyAlgorithm

```typescript
function difficultyAlgorithm(nSubmit: number, nAccept: number): number | null
```

根据提交数和通过数计算题目难度分数（1-10）。使用对数正态概率密度函数的数值积分，按通过率加权。当 `nSubmit` 为 0 时返回 `null`。

---

## Rating 计算

### rating

```typescript
function rating(users: RatingInputUser[]): RatingOutputUser[]
```

实现 Codeforces 风格的 Elo 评分系统。接收包含 `old` 评分、`rank` 和 `uid` 的用户数组，返回比赛后的新评分。处理种子计算、增量标准化和反膨胀调整。

**类型**：

```typescript
interface RatingInputUser {
  old: number;   // 原评分
  uid: number;   // 用户标识
  rank: number;  // 比赛排名（从 1 开始）
}

interface RatingOutputUser {
  new: number;   // 更新后的评分
  uid: number;   // 用户标识
}
```

---

## 头像 URL 生成

### avatar

```typescript
function avatar(src: string, size?: number, fallback?: string): string
```

从带有提供者前缀的标识字符串（如 `"gravatar:user@example.com"`、`"qq:12345"`、`"github:username"`、`"url:https://..."`）生成头像 URL。当提供者未知或字符串无法解析时，回退到使用空邮箱的 Gravatar。

**参数**：
- `src` — 带提供者前缀的标识符（格式：`"provider:value"`）。
- `size` — 请求的图片尺寸（像素），默认 `64`。
- `fallback` — 当主地址为空或无法解析时使用的备选 `src`。

**内置提供者**：

| 提供者    | 格式                 | 说明                              |
|-----------|----------------------|-----------------------------------|
| `gravatar` | `gravatar:email`    | 通过 MD5 邮箱哈希的 Gravatar 头像 |
| `qq`      | `qq:QQ号`           | 通过 q1.qlogo.cn 的 QQ 头像      |
| `github`  | `github:username`   | GitHub 头像                       |
| `url`     | `url:https://...`   | 直接 URL 透传                     |

---

## 题目配置解析

### testdataConfig

```typescript
function testdataConfig(
  config: string | ProblemConfigFile = {},
  files: string[]
): Promise<ProblemConfig>
```

将题目配置（YAML 字符串或预解析对象）和测试用例文件名列表解析为汇总的 `ProblemConfig` 对象。计算所有子任务的聚合时间/内存限制，统计测试点数量，并提取 `type`、`hackable`、`langs`、`redirect` 等元数据。

**备注**：在 Hydro 插件 API 中以 `testdataConfig` 导出（从内部 `parseConfig` 函数名别名而来）。

---

## 邮件

### sendMail

```typescript
function sendMail(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<any>
```

使用系统配置中的 SMTP 设置（`smtp.host`、`smtp.port`、`smtp.secure`、`smtp.user`、`smtp.pass`、`smtp.from`）发送邮件。内部使用 `nodemailer`。失败时抛出 `SendMailError`。

---

## 密码哈希

### pwsh

```typescript
function pwsh(password: string, salt: string): Promise<string>
```

使用给定盐值对密码进行 PBKDF2 哈希（SHA-256、100,000 次迭代、64 字节密钥）。返回派生密钥的前 64 个十六进制字符。在模块加载时注册为 `global.Hydro.module.hash.hydro`。

---

## UI 上下文

### UiContextBase

```typescript
interface UiContextBase {
  cdn_prefix: string;
  cdn_dynamic: boolean;
  url_prefix: string;
  ws_prefix: string;
}
```

提供默认 CDN、URL 和 WebSocket 前缀值的常量对象。用作基础模板，在每次请求时根据特定域的覆盖（CDN URL、WebSocket 前缀、域信息）进行扩展。
