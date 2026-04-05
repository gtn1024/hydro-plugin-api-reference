---
title: StorageService
description: 文件存储后端服务，支持本地文件系统和 S3 兼容对象存储
source: packages/hydrooj/src/service/storage.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/service/storage.ts
---
# StorageService

文件存储后端服务，提供上传、下载、删除和签名 URL 生成。支持本地文件系统和 S3 兼容对象存储。

> **源码**: [`packages/hydrooj/src/service/storage.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/service/storage.ts)
>
> **导出**: `import * as StorageService from 'hydrooj';`
> **访问**: `ctx.storage`（实例，服务启动后可用）

`StorageService` 是一个命名空间导出，包含两个后端类（`RemoteStorageService` 用于 S3，`LocalStorageService` 用于文件系统）以及 `Config` schema 和 `encodeRFC5987ValueChars` 工具。运行时，`ctx.storage` 返回所配置的后端实例。

两个后端共享相同的公开 API 接口：

---

## 公开方法

### `put(target: string, file: string | Buffer | Readable, meta?: Record<string, string>): Promise<void>`

将文件上传到存储路径。接受文件路径、Buffer 或 Readable 流。S3 后端对大于 5MB 的文件使用分片上传，并支持 `meta` 元数据参数。本地后端写入磁盘，不支持 `meta` 参数（该参数被忽略）。路径会进行校验（不允许 `..`、`//` 等）。

### `get(target: string, path?: string): Promise<Readable | null>`

获取文件。默认返回 `Readable` 流。若提供 `path`，则将文件同时保存到该本地路径；此时 S3 后端返回 `null`，本地后端仍返回 `Readable` 流。

### `del(target: string | string[]): Promise<void>`

删除一个或多个文件。接受单个路径字符串或路径数组。S3 后端对多个目标使用批量 `DeleteObjectsCommand`。

### `getMeta(target: string): Promise<{ size, lastModified, etag, metaData }>`

返回文件元数据：`size`（字节）、`lastModified`（Date）、`etag`（string）和 `metaData`（record）。本地后端从 Base64 编码的路径计算 etag。

### `signDownloadLink(target: string, filename?: string, noExpire?: boolean, useAlternativeEndpointFor?: 'user' | 'judge'): Promise<string>`

生成签名下载 URL。S3 后端使用预签名 URL（为兼容阿里云最长 7 天，默认 30 分钟）。本地后端通过 `/storage` 端点生成 HMAC 签名路径。支持为用户或判题机访问使用备用端点路由。

### `signUpload(target: string, size: number): Promise<{ url, fields }>`

生成预签名 POST 用于浏览器直传（仅 S3）。包含 ±50 字节容差的内容长度范围条件。10 分钟有效期。本地后端抛出 `Error('Not implemented')`。

### `isLinkValid(link: string): Promise<boolean>`

验证签名链接的 HMAC 签名。仅在本地后端有效（S3 后端返回 `false`）。

### `status(): Promise<{ type, status, error, ... }>`

返回服务健康信息：`type`（`'S3'` 或 `'Local'`）、`status`（布尔值）、`error`（字符串）及后端特定字段（`bucket`、`dir`）。

---

## 属性

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `client` | `S3Client \| null` | S3 客户端实例（本地后端为 null） |
| `error` | `string` | 最近一次错误消息，健康时为空字符串 |

---

## 导出（命名空间）

| 导出 | 类型 | 说明 |
|--------|------|-------------|
| `Config` | `Schema` | 存储配置 Schema（校验 `type`、`path`/`endPoint`、凭证等） |
| `encodeRFC5987ValueChars` | `(str: string) => string` | 按 RFC 5987 编码文件名用于 `Content-Disposition` 请求头 |
| `apply` | `(ctx, config) => Promise<void>` | 服务生命周期：实例化后端、启动、注册 `/fs` 代理路由、提供 `ctx.storage` |

---

## 配置

`Config` schema 校验以下字段：

| 字段 | 默认值 | 说明 |
|-------|---------|-------------|
| `type` | — | `'file'`（本地）或 `'s3'` |
| `endPointForUser` | `'/fs/'` | 面向用户的文件访问 URL 前缀 |
| `endPointForJudge` | `'/fs/'` | 面向判题机的文件访问 URL 前缀 |

**本地模式（`type: 'file'`）**：

| 字段 | 默认值 | 说明 |
|-------|---------|-------------|
| `path` | `/data/file/hydro` | 本地存储目录 |
| `secret` | `nanoid()` | 签名链接的 HMAC 密钥 |

**S3 模式（`type: 's3'`）**：

| 字段 | 默认值 | 说明 |
|-------|---------|-------------|
| `endPoint` | — | S3 端点 URL |
| `accessKey` | — | Access Key ID |
| `secretKey` | — | Secret Access Key |
| `bucket` | `'hydro'` | 存储桶名称 |
| `region` | `'us-east-1'` | 区域 |
| `pathStyle` | `true` | 使用路径风格寻址 |

---

## 备注

- `ctx.storage` 在启动时通过 `ctx.provide('storage', service)` 提供。
- 两个后端均校验路径以防止遍历攻击（`..`）、双斜杠（`//`）和尾部 `/.`。
- `apply` 函数注册 `/fs/` 代理路由用于直接文件访问。
- 备用端点允许通过不同 URL（CDN、内网等）路由用户/判题机的文件流量。
