# MessageModel

消息模型，用于发送、查询和删除用户消息及系统通知。

> **源码**: [`packages/hydrooj/src/model/message.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/message.ts)
> **导出**: `import { MessageModel } from 'hydrooj';`

`MessageModel` 是纯静态类。所有方法均通过类本身调用（如 `MessageModel.send(...)`）。

---

## 类型导出

### `MessageDoc`

```typescript
interface MessageDoc {
    from: number;
    to: number | number[];
    content: string;
    flag: number;
}
```

---

## 常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `FLAG_UNREAD` | `1` | 消息未读 |
| `FLAG_ALERT` | `2` | 消息为警报 |
| `FLAG_RICHTEXT` | `4` | 消息包含富文本 |
| `FLAG_INFO` | `8` | 信息性消息 |
| `FLAG_I18N` | `16` | 内容为 i18n 键 |

标志为位掩码值 —— 使用按位 OR 组合（如 `FLAG_INFO | FLAG_I18N`）。

---

## 方法

### 发送

#### `send(from: number, to: number | number[], content: string, flag?: number): Promise<BaseMessage>`

从用户 `from` 向一个或多个接收者发送消息。默认为 `FLAG_UNREAD`。广播 `user/message` 事件并递增接收者的 `unreadMsg` 计数。返回消息文档（如果 `to` 为空则不含 `_id`）。

**@ArgMethod**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `from` | `number` | — | 发送者 UID |
| `to` | `number \| number[]` | — | 接收者 UID 或 UID 数组 |
| `content` | `string` | — | 消息内容 |
| `flag` | `number` | `FLAG_UNREAD` | 标志位掩码 |
| **返回值** | `Promise<BaseMessage>` | | 消息文档 |

#### `sendInfo(to: number, content: string): Promise<void>`

向单个用户发送临时信息/i18n 通知。组合 `FLAG_INFO | FLAG_I18N`。通过 `user/message` 广播，但**不**持久化到数据库。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `to` | `number` | — | 接收者 UID |
| `content` | `string` | — | i18n 键或消息内容 |
| **返回值** | `Promise<void>` | | |

#### `sendNotification(message: string, ...args: any[]): Promise<void[]>`

向所有具有 `PRIV_VIEW_SYSTEM_NOTIFICATION` 的用户发送翻译后的通知。`message` 通过 `app.i18n` 使用每个接收者的 `viewLang` 翻译，`args` 传递给 `format()`。消息以 `FLAG_RICHTEXT` 发送。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `string` | — | i18n 消息键 |
| `args` | `any[]` | — | 传递给 `format()` 的参数 |
| **返回值** | `Promise<void[]>` | | |

### 查询

#### `get(_id: ObjectId): Promise<MessageDoc>`

按 `_id` 获取单个消息。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `ObjectId` | — | 消息 ID |
| **返回值** | `Promise<MessageDoc>` | | |

#### `getByUser(uid: number): Promise<MessageDoc[]>`

获取指定用户发送或接收的最多 1000 条消息，按 `_id` 降序排列（最新在前）。

**@ArgMethod**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 UID |
| **返回值** | `Promise<MessageDoc[]>` | | 最多 1000 条消息 |

#### `getMany(query: Filter<MessageDoc>, sort: any, page: number, limit: number): Promise<MessageDoc[]>`

带自定义过滤和排序的分页消息列表。应用 `skip((page-1)*limit)`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<MessageDoc>` | — | MongoDB 过滤条件 |
| `sort` | `any` | — | 排序条件 |
| `page` | `number` | — | 页码（从 1 开始） |
| `limit` | `number` | — | 每页数量 |
| **返回值** | `Promise<MessageDoc[]>` | | |

#### `getMulti(uid: number): Cursor<MessageDoc>`

获取指定用户发送或接收的所有消息的 MongoDB 游标。无排序或限制 —— 调用方控制迭代。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 UID |
| **返回值** | `Cursor<MessageDoc>` | | |

### 删除

#### `del(_id: ObjectId): Promise<DeleteResult>`

按 `_id` 删除单个消息。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `ObjectId` | — | 消息 ID |
| **返回值** | `Promise<DeleteResult>` | | |

### 统计

#### `count(query?: Filter<MessageDoc>): Promise<number>`

统计匹配给定过滤器的消息数量。默认为所有消息。

**@ArgMethod**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<MessageDoc>` | — | 过滤条件 |
| **返回值** | `Promise<number>` | | |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<MessageDoc>` | MongoDB `message` 集合 |

---

## 备注

- `send` 同时持久化到 MongoDB 并实时广播 `user/message`。
- `sendInfo` 是即发即弃 —— 它广播但不写入数据库。
- `sendNotification` 用于系统级公告（如维护通知）。
- `getByUser` 限制结果为 1000 条；使用 `getMulti` 进行无限制的游标迭代。
- **索引**：`{ to: 1, _id: -1 }`（按接收者查找）、`{ from: 1, _id: -1 }`（按发送者查找）。
