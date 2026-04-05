---
title: download / ZipDownloader
description: 流式创建并传输 ZIP 压缩包到浏览器，支持并发文件下载和重试
source: packages/ui-default/components/zipDownloader/index.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/zipDownloader/index.ts
---
# download / ZipDownloader

源码: [`packages/ui-default/components/zipDownloader/index.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/zipDownloader/index.ts)

使用 `streamsaver` 创建并流式传输 ZIP 压缩包到浏览器，支持并发文件下载和重试逻辑。

## 函数

### download

```ts
async function download(
  filename: string,
  targets: { filename: string; url?: string; content?: string }[]
): Promise<void>
```

下载包含给定目标文件的 ZIP 压缩包。使用 `streamsaver` 将 ZIP 直接流式写入磁盘，无需将整个压缩包保存在内存中。文件以并发方式获取（最多 5 个并行），失败时自动重试。

**参数:**
- `filename` — 生成的 ZIP 文件名（如 `"Export.zip"`）。
- `targets` — 要包含的文件数组。每个目标必须包含 `filename` 以及 `url`（要获取的远程文件）或 `content`（内存中的字符串）之一。

**行为:**
1. 确保浏览器有 `WritableStream`（必要时加载 polyfill）。
2. 通过 `streamsaver.createWriteStream` 创建写入流。
3. 以并发数 5 排队所有文件下载。每个失败的下载最多重试 5 次，间隔 3 秒。
4. 将 ZIP 流（通过 `createZipStream`）管道传输到文件流。
5. 下载期间通过 `beforeunload` / `unload` 监听器阻止浏览器关闭。
6. 遇到不可恢复的错误时：记录到 Sentry，停止下载，显示错误通知。

### downloadProblemSet

```ts
async function downloadProblemSet(
  pids: number[],
  name?: string
): Promise<void>
```

将一个或多个题目导出为 ZIP 压缩包。收集题目元数据、内容、测试数据和附加文件，然后委托给 `download`。触发 `problemset/download` 生命周期钩子，以便插件注入额外文件。

**参数:**
- `pids` — 要导出的题目数字 ID 数组。
- `name`（默认 `"Export"`）— ZIP 文件的基本名称（变为 `{name}.zip`）。

**行为:**
1. 触发 `ctx.serial('problemset/download', pids, name, targets)` — 插件可推送额外目标。
2. 对每个题目：
   - 通过 `api('problem', ...)` 获取题目元数据并序列化为 `problem.yaml`。
   - 解析内容：若为 JSON 对象，将每个键拆分为 `problem_{key}.md`；否则写入 `problem.md`。
   - 获取测试数据和附加文件的签名下载链接。
3. 调用 `download(name + '.zip', targets)` 流式输出 ZIP。
4. 出错时：记录到 Sentry 并显示错误通知。

## EventMap 扩展

模块在前端 `EventMap` 上声明了 `problemset/download` 事件：

```ts
interface EventMap {
  'problemset/download': (
    pids: number[],
    name: string,
    targets: { filename: string; url?: string; content?: string }[]
  ) => void;
}
```

插件可通过 `ctx.on('problemset/download', ...)` 监听，在下载开始前向 ZIP 注入额外文件。
