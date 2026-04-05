# JudgeHandler

评测系统扩展接口，用于处理评测任务生命周期、结果回调和守护进程通信。

> **源码**: [`packages/hydrooj/src/handler/judge.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/handler/judge.ts)
>
> **导出**: `import { JudgeHandler, JudgeResultCallbackContext, postJudge } from 'hydrooj';`

`JudgeHandler` 是整个模块的命名空间重新导出。单独的命名导出（`JudgeResultCallbackContext`、`postJudge`）也可直接使用。

---

## 类

### `JudgeResultCallbackContext`

管理单个评测任务结果回调的生命周期。通过内部 promise 链序列化所有 `next`/`end` 操作以确保更新有序。实现了 `then` 方法，因此实例可以直接被 await（在 `end()` 被调用时 resolve）。

**构造函数**: `new JudgeResultCallbackContext(ctx: Context, task: Task)`

| 属性 | 类型 | 说明 |
|------|------|------|
| `ctx` | `Context` | 用于广播事件的 Cordis 上下文 |
| `task` | `Task` | 正在处理的评测任务 |

#### 实例方法

| 方法 | 说明 |
|------|------|
| `next(body: Partial<JudgeResultBody>)` | 追加中间评测结果（进度更新）。内部序列化以保证顺序。 |
| `end(body?: Partial<JudgeResultBody>)` | 结束评测任务。设置 `judgeAt`/`judger`，清除 `progress`，触发 `postJudge`，并 resolve 可等待的 promise。不传 body 则直接 resolve 而不更新。 |
| `reset()` | 将记录重置为等待状态并重新入队。当评测守护进程在评测过程中断开连接时使用。 |

#### 静态方法

| 方法 | 说明 |
|------|------|
| `JudgeResultCallbackContext.next(domainId: string, rid: ObjectId, body: Partial<JudgeResultBody>)` | 无需实例即可发送中间结果更新。广播 `record/change`。 |
| `JudgeResultCallbackContext.end(domainId: string, rid: ObjectId, body: Partial<JudgeResultBody>)` | 无需实例即可结束评测任务。设置 `judgeAt`/`judger`，触发 `postJudge`，广播 `record/change`。 |
| `JudgeResultCallbackContext.postJudge(rdoc: RecordDoc, context?: JudgeResultCallbackContext)` | 评测后处理：更新题目/比赛状态，递增通过计数，触发 `record/judge` 生命周期钩子。 |

### `JudgeConnectionHandler`（继承 `ConnectionHandler`）

评测守护进程连接的 WebSocket 处理器。管理任务分发、语言配置同步和守护进程生命周期。

> **备注**: 这是 Hydro 核心注册的内部处理器。插件通常不会继承此类。

### `JudgeFilesDownloadHandler`（继承 `Handler`）

评测文件下载（提交代码和测试数据）的 HTTP 处理器。注册在 `POST /judge/files`，需要 `PRIV_JUDGE`。

### `JudgeFileUpdateHandler`（继承 `Handler`）

评测文件上传（如 hack 测试数据）的 HTTP 处理器。注册在 `POST /judge/upload`，需要 `PRIV_JUDGE`。

---

## 函数

### `processJudgeFileCallback(rid: ObjectId, filename: string, filePath: string): Promise<void>`

验证并上传评测生成的文件作为题目测试数据。在调用 `problem.addTestdata` 之前检查文件数量/大小限制和用户权限。

---

## 已废弃

> 以下内容已废弃，不应在新代码中使用。

| 导出 | 替代方案 | 说明 |
|------|----------|------|
| `postJudge(rdoc: RecordDoc)` | `JudgeResultCallbackContext.postJudge(rdoc)` | 作为独立函数的评测后处理 |
| `next(payload: any)` | `JudgeResultCallbackContext.next(...)` | 使用 payload 对象的静态式 next 回调 |
| `end(payload: any)` | `JudgeResultCallbackContext.end(...)` | 使用 payload 对象的静态式 end 回调 |
| `JudgeHandler.apply.next` | — | `apply` 函数上的已废弃别名 |
| `JudgeHandler.apply.end` | — | `apply` 函数上的已废弃别名 |

---

## 生命周期

`apply(ctx)` 函数在启动时注册以下内容：

- 路由 `judge_files_download` 在 `/judge/files` → `JudgeFilesDownloadHandler`（需要 `PRIV_JUDGE`）
- 路由 `judge_files_upload` 在 `/judge/upload` → `JudgeFileUpdateHandler`（需要 `PRIV_JUDGE`）
- 连接 `judge_conn` 在 `/judge/conn` → `JudgeConnectionHandler`（需要 `PRIV_JUDGE`）
- `record/judge` 事件监听器 —— 处理成功的 hack 提交，自动添加 hack 数据并触发重测

---

## 备注

- `JudgeResultCallbackContext` 通过内部 promise 链序列化 `next`/`end` 调用 —— 调用方无需处理排序问题。
- 受控重测模式（`meta.rejudge === 'controlled'`）将结果写入 `record.collHistory` 而非实时记录，以便审核后再应用。
- 当评测守护进程断开连接（连接清理）时，所有进行中的任务将通过 `reset()` 重置并重新入队。
