# UserModel

用户管理模型，提供增删改查操作、认证辅助和用户组管理。

> **源码**: [`packages/hydrooj/src/model/user.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/user.ts)
> **导出**: `import { UserModel } from 'hydrooj';`

`UserModel` 是一个纯静态类。所有方法直接在类上调用（如 `UserModel.getById(...)`）。它封装了 `user`、`vuser` 和 `user.group` MongoDB 集合，并带有 LRU 缓存。

---

## 方法

### 查找

#### `getById(domainId: string, _id: number, scope?: bigint | string): Promise<User | null>`

在域内通过数字 ID 获取单个用户。返回完整初始化的 `User` 实例或 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `_id` | `number` | — | 用户 ID（负数 ID 查找虚拟用户） |
| `scope` | `bigint \| string` | `PERM.PERM_ALL` | 权限范围掩码 |
| **返回值** | `Promise<User \| null>` | | |

#### `getByUname(domainId: string, uname: string): Promise<User | null>`

在域内通过用户名获取单个用户。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `uname` | `string` | — | 用户名（不区分大小写） |
| **返回值** | `Promise<User \| null>` | | |

#### `getByEmail(domainId: string, mail: string): Promise<User | null>`

在域内通过邮箱地址获取单个用户。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `mail` | `string` | — | 邮箱地址（不区分大小写，应用 Gmail 规范化） |
| **返回值** | `Promise<User \| null>` | | |

#### `getList(domainId: string, uids: number[]): Promise<Udict>`

以 UID 为键获取多个用户的字典。缺失用户回退为 `defaultUser`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `uids` | `number[]` | — | 用户 ID 数组 |
| **返回值** | `Promise<Udict>` | | `Record<number, User>` |

#### `getPrefixList(domainId: string, prefix: string, limit?: number): Promise<User[]>`

通过用户名或显示名前缀搜索用户。同时搜索 `unameLower` 和域显示名。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `prefix` | `string` | — | 搜索前缀（不区分大小写） |
| `limit` | `number` | `50` | 最大结果数 |
| **返回值** | `Promise<User[]>` | | |

#### `getMulti(params?: Filter<Udoc>, projection?: (keyof Udoc)[]): MongoDB.Cursor<Udoc>`

获取用于查询用户的 MongoDB 游标，支持可选过滤和字段投影。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `params` | `Filter<Udoc>` | — | MongoDB 查询过滤器 |
| `projection` | `(keyof Udoc)[]` | — | 要包含的字段 |
| **返回值** | `MongoDB.Cursor<Udoc>` | | |

#### `getListForRender(domainId: string, uids: number[], showPrivateInfo?: boolean, extraFields?: string[]): Promise<BaseUserDict>`

获取为前端渲染优化的用户信息字典。合并用户文档、虚拟用户文档和域用户文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `uids` | `number[]` | — | 要获取的用户 ID |
| `showPrivateInfo` | `boolean` | — | 是否包含私有字段 |
| `extraFields` | `string[]` | — | 额外要包含的字段 |
| **返回值** | `Promise<BaseUserDict>` | | |

### 创建

#### `create(mail: string, uname: string, password: string, uid?: number, regip?: string, priv?: number): Promise<number>`

注册新用户。若未提供则自动分配 UID。等待数据库同步后返回。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mail` | `string` | — | 邮箱地址 |
| `uname` | `string` | — | 显示名 |
| `password` | `string` | — | 明文密码 |
| `uid` | `number?` | auto | 强制指定 UID，或自动分配 |
| `regip` | `string` | `'127.0.0.1'` | 注册 IP |
| `priv` | `number` | `system.get('default.priv')` | 初始权限等级 |
| **返回值** | `Promise<number>` | | 分配的用户 ID |

```typescript
// 注册新用户
const uid = await UserModel.create(
  'user@example.com',   // mail
  '张三',                // uname
  'securePassword123',  // password
);

// 指定 UID 和初始权限
const adminUid = await UserModel.create(
  'admin@example.com',
  '管理员',
  'adminPassword',
  1000,                 // uid（强制指定）
  '127.0.0.1',          // regip
  PRIV.PRIV_ALL,        // priv
);
```

#### `ensureVuser(uname: string): Promise<number>`

确保存在用于比赛显示的虚拟用户。若不存在则创建一个递减负数 ID。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uname` | `string` | — | 虚拟用户显示名 |
| **返回值** | `Promise<number>` | | 虚拟用户 ID |

### 变更

#### `setById(uid: number, $set?: Partial<Udoc>, $unset?: Partial<Udoc>, $push?: object): Promise<Udoc | null>`

使用 MongoDB 更新操作符更新用户文档。自动使缓存失效。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `$set` | `Partial<Udoc>` | — | 要设置的字段 |
| `$unset` | `Partial<Udoc>` | — | 要取消设置的字段 |
| `$push` | `object` | — | 要追加的字段（数组追加） |
| **返回值** | `Promise<Udoc \| null>` | | 更新后的文档（虚拟用户返回 null） |

#### `setUname(uid: number, uname: string): Promise<void>`

更改用户的显示名。同时更新 `uname` 和 `unameLower`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `uname` | `string` | — | 新的显示名 |

#### `setEmail(uid: number, mail: string): Promise<void>`

更改用户的邮箱。应用 Gmail 规范化（`handleMailLower`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `mail` | `string` | — | 新的邮箱地址 |

#### `setPassword(uid: number, password: string): Promise<void>`

重置用户密码。生成新的盐值并使用 `hydro` 哈希类型重新哈希。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `password` | `string` | — | 新的明文密码 |

#### `setPriv(uid: number, priv: number): Promise<Udoc>`

直接设置用户的权限等级。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `priv` | `number` | — | 权限位掩码（参见 `PRIV` 常量） |
| **返回值** | `Promise<Udoc>` | | 更新后的文档 |

#### `setSuperAdmin(uid: number): Promise<void>`

将用户提升为超级管理员（`PRIV.PRIV_ALL`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |

#### `setJudge(uid: number): Promise<void>`

将用户设置为评测员并赋予相应权限（`USER_PROFILE | JUDGE | VIEW_ALL_DOMAIN | READ_PROBLEM_DATA | UNLIMITED_ACCESS`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |

#### `ban(uid: number, reason?: string): Promise<void>`

封禁用户：将权限设为 `PRIV_NONE` 并撤销所有令牌。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `reason` | `string` | `''` | 封禁原因，存储在 `banReason` 中 |

```typescript
// 封禁用户并记录原因
await UserModel.ban(uid, '违反社区规范');

// 封禁用户（无原因）
await UserModel.ban(uid);
```

#### `inc(_id: number | number[], field: string, n?: number): Promise<Udoc[] | null>`

递增一个或多个用户的数字字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `number \| number[]` | — | 用户 ID |
| `field` | `string` | — | 要递增的字段名 |
| `n` | `number` | `1` | 递增量（负数为递减） |
| **返回值** | `Promise<Udoc[] \| null>` | | 递增前的文档 |

### 用户组

#### `listGroup(domainId: string, uid?: number): Promise<any>`

列出域中的用户组。若提供 `uid`，则仅返回包含该用户的组及隐式的自身组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `uid` | `number` | — | 可选，筛选包含该用户的组 |

#### `delGroup(domainId: string, name: string): Promise<void>`

按名称删除用户组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `name` | `string` | — | 用户组名称 |

#### `updateGroup(domainId: string, name: string, uids: number[]): Promise<void>`

创建或更新包含指定成员 UID 的用户组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `name` | `string` | — | 用户组名称 |
| `uids` | `number[]` | — | 成员 UID 数组 |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<Udoc>` | `user` MongoDB 集合 |
| `collGroup` | `Collection<GDoc>` | `user.group` MongoDB 集合 |
| `cache` | `LRUCache<string, User>` | LRU 缓存（最大 10000，TTL 5 分钟），以 `type/key/domainId` 为键 |
| `defaultUser` | `Udoc` | 缺失用户的默认用户文档模板 |

---

## User 类

`getById` 等方法返回 `User` 实例。`User` 类封装了 `Udoc` + 域用户文档，并提供：

| 方法 | 说明 |
|------|------|
| `own(doc, arg?)` | 检查用户是否拥有（或维护）某个文档。传入 `bigint` 权限以限定检查条件，或 `true` 表示仅限拥有者。 |
| `hasPerm(...perms)` | 检查用户是否拥有给定权限位中的**任一**权限（与范围取交集）。 |
| `hasPriv(...privs)` | 检查用户是否拥有给定特权位中的**任一**特权。 |
| `checkPassword(password)` | 用存储的哈希验证明文密码。 |
| `private()` | 返回清洗后的私有视图（头像已解析，置顶域已展开）。 |
| `getFields(type?)` | 获取 `'public'` 或 `'private'` 序列化的字段名。 |
| `serialize(h)` | 序列化为 JSON，根据查看者权限过滤字段。 |

### User 关键属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `_id` | `number` | 用户 ID |
| `uname` | `string` | 显示名 |
| `mail` | `string` | 邮箱地址 |
| `priv` | `number` | 全局特权位掩码 |
| `perm` | `bigint` | 域范围权限位掩码 |
| `role` | `string` | 域角色（如 `'default'`） |
| `scope` | `bigint` | 权限范围掩码 |
| `regat` | `Date` | 注册时间 |
| `loginat` | `Date` | 最后登录时间 |
| `tfa` | `boolean` | 是否启用了两步验证 |
| `group` | `string[]?` | 域组成员关系 |
