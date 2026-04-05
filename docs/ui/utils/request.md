---
title: api() & request 工具
description: 面向插件开发者的前端 HTTP 请求工具和语言辅助函数
source: packages/ui-default/utils/index.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/utils/index.ts
---
# api() & request 工具

源码：[`packages/ui-default/utils/index.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/utils/index.ts)、[`packages/ui-default/utils/base.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/utils/base.ts)

面向插件开发者的前端 HTTP 请求工具和语言辅助函数。

---

## api()

```ts
function api(method: string, args: Record<string, any>, projection: any): Promise<any>
```

通过 `/d/{domainId}/api/{method}` 端点调用 Hydro 后端 API 方法。将 `args` 和可选 `projection` 作为 JSON 正文通过 POST 发送。如果响应包含 `error` 字段则抛出异常。

| 参数 | 类型 | 说明 |
|------|------|------|
| `method` | `string` | 后端 API 方法名（如 `"contest.add"`） |
| `args` | `Record<string, any>` | 转发到后端方法的参数 |
| `projection` | `any` | 可选，响应字段投影 |

---

## request

```ts
const request: { ajax, post, get, postFile }
```

基于 jQuery 的 HTTP 客户端对象，具有结构化错误处理。

### request.ajax()

```ts
function ajax(options: Record<string, any>): Promise<any>
```

`$.ajax` 的底层封装，默认 JSON 配置和统一错误处理。默认设置 `dataType: 'json'` 和 `Accept: application/json`。出错时保留原始调用栈。

**错误处理：**

| 条件 | 行为 |
|------|------|
| 请求被中止 | 以 `err.aborted = true` 的 `Error` 拒绝 |
| 网络故障（`readyState === 0`） | 以 "Network error" 拒绝 |
| 服务端 JSON 错误（带参数） | 对 `error.message` 使用 `error.params` 应用 i18n |
| 服务端 JSON 错误（无参数） | 以 `error.message` 拒绝 |
| 其他失败 | 以状态文本或抛出的错误拒绝 |

### request.post()

```ts
function post(url: string, dataOrForm?: JQueryStatic | Node | string | Record<string, any>, options?: Record<string, any>): Promise<any>
```

发送 POST 请求。`dataOrForm` 参数接受多种输入类型：

| 输入类型 | 行为 |
|----------|------|
| jQuery 表单（`$(form)`） | 通过 `.serialize()` 序列化 |
| DOM 表单元素 | 通过 `$().serialize()` 序列化 |
| 字符串 | 作为原始查询字符串正文发送 |
| 纯对象 | 以 `Content-Type: application/json` JSON 序列化 |

### request.get()

```ts
function get(url: string, qs?: Record<string, any>, options?: Record<string, any>): Promise<any>
```

发送带查询字符串参数的 GET 请求。

### request.postFile()

```ts
function postFile(url: string, form: FormData, options?: Record<string, any>): Promise<any>
```

通过 `FormData` 上传文件。设置 `processData: false` 和 `contentType: false`，使 jQuery 原样传递 FormData（浏览器会设置正确的 multipart 边界）。

---

## getAvailableLangs()

```ts
function getAvailableLangs(langsList?: string[]): Record<string, any>
```

过滤 `window.LANGS`，仅返回可用的语言条目。排除作为其他键前缀的条目（如存在 `"en.section"` 时的 `"en"`）、标记为 `disabled` 的条目。当提供 `langsList` 时，它作为完整白名单——仅返回列表中包含的键（同时覆盖 `hidden` 检查）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `langsList` | `string[]` | 可选，语言键白名单（提供时仅返回列表中的键，同时覆盖 `hidden` 检查） |
