# BuiltinModel

内置常量、权限标志、特权标志、评测状态枚举和 UI 元数据，从 `@hydrooj/common` 重新导出并由 Hydro 扩展。

> **源码**: [`packages/hydrooj/src/model/builtin.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/builtin.ts)
> **导出**: `import * as BuiltinModel from 'hydrooj/dist/model/builtin';`（桶式重新导出；也支持单独的命名导入）

---

## 常量

### PERM —— 域级权限位标志

将权限名映射到 `bigint` 值的对象。在域用户角色上用作位掩码。

| 常量 | 位 | 说明 |
|------|-----|------|
| `PERM_NONE` | `0n` | 无权限 |
| `PERM_VIEW` | `1n << 0` | 查看此域 |
| `PERM_EDIT_DOMAIN` | `1n << 1` | 编辑域设置 |
| `PERM_MOD_BADGE` | `1n << 2` | 显示 MOD 徽章 |
| `PERM_CREATE_PROBLEM` | `1n << 4` | 创建题目 |
| `PERM_EDIT_PROBLEM` | `1n << 5` | 编辑任意题目 |
| `PERM_EDIT_PROBLEM_SELF` | `1n << 6` | 编辑自己的题目 |
| `PERM_VIEW_PROBLEM` | `1n << 7` | 查看题目 |
| `PERM_VIEW_PROBLEM_HIDDEN` | `1n << 8` | 查看隐藏题目 |
| `PERM_SUBMIT_PROBLEM` | `1n << 9` | 提交题目解答 |
| `PERM_READ_PROBLEM_DATA` | `1n << 10` | 读取题目测试数据 |
| `PERM_READ_RECORD_CODE` | `1n << 12` | 读取所有记录代码 |
| `PERM_REJUDGE_PROBLEM` | `1n << 13` | 重测题目 |
| `PERM_REJUDGE` | `1n << 14` | 重测记录 |
| `PERM_VIEW_PROBLEM_SOLUTION` | `1n << 15` | 查看题解 |
| `PERM_CREATE_PROBLEM_SOLUTION` | `1n << 16` | 创建题解 |
| `PERM_VOTE_PROBLEM_SOLUTION` | `1n << 17` | 为题解投票 |
| `PERM_EDIT_PROBLEM_SOLUTION` | `1n << 18` | 编辑任意题解 |
| `PERM_EDIT_PROBLEM_SOLUTION_SELF` | `1n << 19` | 编辑自己的题解 |
| `PERM_DELETE_PROBLEM_SOLUTION` | `1n << 20` | 删除任意题解 |
| `PERM_DELETE_PROBLEM_SOLUTION_SELF` | `1n << 21` | 删除自己的题解 |
| `PERM_REPLY_PROBLEM_SOLUTION` | `1n << 22` | 回复题解 |
| `PERM_EDIT_PROBLEM_SOLUTION_REPLY_SELF` | `1n << 24` | 编辑自己的题解回复 |
| `PERM_DELETE_PROBLEM_SOLUTION_REPLY` | `1n << 25` | 删除任意题解回复 |
| `PERM_DELETE_PROBLEM_SOLUTION_REPLY_SELF` | `1n << 26` | 删除自己的题解回复 |
| `PERM_VIEW_DISCUSSION` | `1n << 27` | 查看讨论 |
| `PERM_CREATE_DISCUSSION` | `1n << 28` | 创建讨论 |
| `PERM_HIGHLIGHT_DISCUSSION` | `1n << 29` | 高亮讨论 |
| `PERM_EDIT_DISCUSSION` | `1n << 30` | 编辑任意讨论 |
| `PERM_EDIT_DISCUSSION_SELF` | `1n << 31` | 编辑自己的讨论 |
| `PERM_DELETE_DISCUSSION` | `1n << 32` | 删除任意讨论 |
| `PERM_DELETE_DISCUSSION_SELF` | `1n << 33` | 删除自己的讨论 |
| `PERM_REPLY_DISCUSSION` | `1n << 34` | 回复讨论 |
| `PERM_EDIT_DISCUSSION_REPLY_SELF` | `1n << 36` | 编辑自己的讨论回复 |
| `PERM_DELETE_DISCUSSION_REPLY` | `1n << 38` | 删除任意讨论回复 |
| `PERM_DELETE_DISCUSSION_REPLY_SELF` | `1n << 39` | 删除自己的讨论回复 |
| `PERM_DELETE_DISCUSSION_REPLY_SELF_DISCUSSION` | `1n << 40` | 删除自己讨论中的回复 |
| `PERM_VIEW_CONTEST` | `1n << 41` | 查看比赛 |
| `PERM_VIEW_CONTEST_SCOREBOARD` | `1n << 42` | 查看比赛排行榜 |
| `PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD` | `1n << 43` | 查看隐藏的比赛排行榜 |
| `PERM_CREATE_CONTEST` | `1n << 44` | 创建比赛 |
| `PERM_ATTEND_CONTEST` | `1n << 45` | 参加比赛 |
| `PERM_VIEW_TRAINING` | `1n << 46` | 查看训练计划 |
| `PERM_CREATE_TRAINING` | `1n << 47` | 创建训练计划 |
| `PERM_EDIT_TRAINING` | `1n << 48` | 编辑任意训练计划 |
| `PERM_EDIT_TRAINING_SELF` | `1n << 49` | 编辑自己的训练计划 |
| `PERM_EDIT_CONTEST` | `1n << 50` | 编辑任意比赛 |
| `PERM_EDIT_CONTEST_SELF` | `1n << 51` | 编辑自己的比赛 |
| `PERM_VIEW_HOMEWORK` | `1n << 52` | 查看作业 |
| `PERM_VIEW_HOMEWORK_SCOREBOARD` | `1n << 53` | 查看作业排行榜 |
| `PERM_VIEW_HOMEWORK_HIDDEN_SCOREBOARD` | `1n << 54` | 查看隐藏的作业排行榜 |
| `PERM_CREATE_HOMEWORK` | `1n << 55` | 创建作业 |
| `PERM_ATTEND_HOMEWORK` | `1n << 56` | 认领作业 |
| `PERM_EDIT_HOMEWORK` | `1n << 57` | 编辑任意作业 |
| `PERM_EDIT_HOMEWORK_SELF` | `1n << 58` | 编辑自己的作业 |
| `PERM_VIEW_RANKING` | `1n << 59` | 查看排名 |
| `PERM_NEVER` | `1n << 60` | 占位符：永不授予 |
| `PERM_PIN_DISCUSSION` | `1n << 61` | 置顶讨论 |
| `PERM_ADD_REACTION` | `1n << 62` | 对讨论使用表情回应 |
| `PERM_PIN_TRAINING` | `1n << 63` | 置顶训练计划 |
| `PERM_LOCK_DISCUSSION` | `1n << 64` | 锁定讨论 |
| `PERM_VIEW_PROBLEM_SOLUTION_ACCEPT` | `1n << 65` | 通过后查看题解 |
| `PERM_READ_RECORD_CODE_ACCEPT` | `1n << 66` | 通过后查看记录代码 |
| `PERM_VIEW_USER_PRIVATE_INFO` | `1n << 67` | 查看域用户私有信息 |
| `PERM_VIEW_HIDDEN_CONTEST` | `1n << 68` | 查看所有比赛（含隐藏） |
| `PERM_VIEW_HIDDEN_HOMEWORK` | `1n << 69` | 查看所有作业（含隐藏） |
| `PERM_VIEW_RECORD` | `1n << 70` | 查看其他用户的记录 |

**复合角色**（预计算的组合）：

| 常量 | 值 | 说明 |
|------|-----|------|
| `PERM_ALL` | `-1n` | 所有权限（所有位设为 1） |
| `PERM_BASIC` | 查看权限的并集 | 访客的基础查看权限 |
| `PERM_DEFAULT` | basic + 创建/自己编辑的并集 | 注册用户的默认权限 |
| `PERM_ADMIN` | `-1n` | `PERM_ALL` 的别名 |

### PRIV —— 系统级特权位标志

将特权名映射到 `number`（位移）值的对象。用于站点范围的用户特权。

| 常量 | 位 | 说明 |
|------|-----|------|
| `PRIV_NONE` | `0` | 无特权 |
| `PRIV_EDIT_SYSTEM` | `1 << 0` | 编辑系统设置（从 `PRIV_SET_PRIV` 重命名） |
| `PRIV_SET_PERM` | `1 << 1` | 设置域权限 |
| `PRIV_USER_PROFILE` | `1 << 2` | 编辑用户资料 |
| `PRIV_REGISTER_USER` | `1 << 3` | 注册新用户 |
| `PRIV_READ_PROBLEM_DATA` | `1 << 4` | 读取题目测试数据 |
| `PRIV_READ_RECORD_CODE` | `1 << 7` | 读取所有记录代码 |
| `PRIV_VIEW_HIDDEN_RECORD` | `1 << 8` | 查看隐藏记录 |
| `PRIV_JUDGE` | `1 << 9` | 作为评测节点 |
| `PRIV_CREATE_DOMAIN` | `1 << 10` | 创建新域 |
| `PRIV_VIEW_ALL_DOMAIN` | `1 << 11` | 查看所有域 |
| `PRIV_MANAGE_ALL_DOMAIN` | `1 << 12` | 管理所有域 |
| `PRIV_REJUDGE` | `1 << 13` | 站点范围重测记录 |
| `PRIV_VIEW_USER_SECRET` | `1 << 14` | 查看用户密钥 |
| `PRIV_VIEW_JUDGE_STATISTICS` | `1 << 15` | 查看评测统计 |
| `PRIV_CREATE_FILE` | `1 << 16` | 在存储中创建文件 |
| `PRIV_UNLIMITED_QUOTA` | `1 << 17` | 绕过存储配额限制 |
| `PRIV_DELETE_FILE` | `1 << 18` | 从存储中删除文件 |
| `PRIV_NEVER` | `1 << 20` | 占位符：永不授予 |
| `PRIV_UNLIMITED_ACCESS` | `1 << 22` | 绕过所有访问检查 |
| `PRIV_VIEW_SYSTEM_NOTIFICATION` | `1 << 23` | 查看系统通知 |
| `PRIV_SEND_MESSAGE` | `1 << 24` | 发送消息 |
| `PRIV_MOD_BADGE` | `1 << 25` | 全局显示 MOD 徽章 |

**复合角色**：

| 常量 | 值 | 说明 |
|------|-----|------|
| `PRIV_ALL` | `-1` | 所有特权 |
| `PRIV_DEFAULT` | `USER_PROFILE + CREATE_FILE + SEND_MESSAGE` | 注册用户的默认特权 |

### STATUS —— 评测状态枚举

评测结果状态码枚举。

| 值 | 名称 | 说明 |
|-----|------|------|
| `0` | `STATUS_WAITING` | 等待评测 |
| `1` | `STATUS_ACCEPTED` | 答案正确 |
| `2` | `STATUS_WRONG_ANSWER` | 答案错误 |
| `3` | `STATUS_TIME_LIMIT_EXCEEDED` | 超过时间限制 |
| `4` | `STATUS_MEMORY_LIMIT_EXCEEDED` | 超过内存限制 |
| `5` | `STATUS_OUTPUT_LIMIT_EXCEEDED` | 超过输出限制 |
| `6` | `STATUS_RUNTIME_ERROR` | 运行时错误 |
| `7` | `STATUS_COMPILE_ERROR` | 编译错误 |
| `8` | `STATUS_SYSTEM_ERROR` | 系统错误 |
| `9` | `STATUS_CANCELED` | 提交已取消 |
| `10` | `STATUS_ETC` | 未知错误 |
| `11` | `STATUS_HACKED` | 解法被 Hack |
| `20` | `STATUS_JUDGING` | 正在评测 |
| `21` | `STATUS_COMPILING` | 正在编译 |
| `22` | `STATUS_FETCHED` | 已被评测机获取 |
| `30` | `STATUS_IGNORED` | 提交被忽略 |
| `31` | `STATUS_FORMAT_ERROR` | 格式错误 |
| `32` | `STATUS_HACK_SUCCESSFUL` | Hack 成功 |
| `33` | `STATUS_HACK_UNSUCCESSFUL` | Hack 失败 |

### 状态查找映射

| 导出 | 类型 | 说明 |
|------|------|------|
| `STATUS_TEXTS` | `Record<STATUS, string>` | 每个状态码的完整显示名（如 `"Wrong Answer"`） |
| `STATUS_SHORT_TEXTS` | `Partial<Record<STATUS, string>>` | 每个状态码的缩写（如 `"WA"`、`"TLE"`） |
| `STATUS_CODES` | `Record<STATUS, string>` | 语义类别：`"pending"`、`"pass"`、`"fail"`、`"progress"`、`"ignored"` |
| `NORMAL_STATUS` | `STATUS[]` | 最终结果状态（AC 到 CE）—— 不包括进行中和特殊状态 |

### 用户性别常量

| 导出 | 类型 | 说明 |
|------|------|------|
| `USER_GENDER_MALE` | `0` | 男性常量 |
| `USER_GENDER_FEMALE` | `1` | 女性常量 |
| `USER_GENDER_OTHER` | `2` | 其他性别常量 |
| `USER_GENDERS` | `number[]` | 所有性别值的数组 `[0, 1, 2]` |
| `USER_GENDER_RANGE` | `Record<number, string>` | 显示标签：`"Boy ♂"`、`"Girl ♀"`、`"Other"` |
| `USER_GENDER_ICONS` | `Record<number, string>` | 图标符号：`"♂"`、`"♀"`、`"?"` |

### PERMS

所有域级权限描述符的数组，每个包含 `{ family, key, desc }`。按 family 分组：

| Family | 权限 |
|--------|------|
| `perm_general` | `PERM_VIEW`, `PERM_VIEW_USER_PRIVATE_INFO`, `PERM_EDIT_DOMAIN`, `PERM_MOD_BADGE` |
| `perm_problem` | `PERM_CREATE_PROBLEM`, `PERM_EDIT_PROBLEM`, `PERM_EDIT_PROBLEM_SELF`, `PERM_VIEW_PROBLEM`, `PERM_VIEW_PROBLEM_HIDDEN`, `PERM_SUBMIT_PROBLEM`, `PERM_READ_PROBLEM_DATA` |
| `perm_record` | `PERM_VIEW_RECORD`, `PERM_READ_RECORD_CODE`, `PERM_READ_RECORD_CODE_ACCEPT`, `PERM_REJUDGE_PROBLEM`, `PERM_REJUDGE` |
| `perm_problem_solution` | 题解 CRUD、投票和回复的 13 个权限 |
| `perm_discussion` | 讨论 CRUD、置顶、高亮、锁定、回应和回复的 16 个权限 |
| `perm_contest` | `PERM_VIEW_CONTEST`, `PERM_VIEW_CONTEST_SCOREBOARD`, `PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD`, `PERM_CREATE_CONTEST`, `PERM_ATTEND_CONTEST`, `PERM_EDIT_CONTEST`, `PERM_EDIT_CONTEST_SELF`, `PERM_VIEW_HIDDEN_CONTEST` |
| `perm_homework` | `PERM_VIEW_HOMEWORK`, `PERM_VIEW_HOMEWORK_SCOREBOARD`, `PERM_VIEW_HOMEWORK_HIDDEN_SCOREBOARD`, `PERM_CREATE_HOMEWORK`, `PERM_ATTEND_HOMEWORK`, `PERM_EDIT_HOMEWORK`, `PERM_EDIT_HOMEWORK_SELF`, `PERM_VIEW_HIDDEN_HOMEWORK` |
| `perm_training` | `PERM_VIEW_TRAINING`, `PERM_CREATE_TRAINING`, `PERM_EDIT_TRAINING`, `PERM_PIN_TRAINING`, `PERM_EDIT_TRAINING_SELF` |
| `perm_ranking` | `PERM_VIEW_RANKING` |

### PERMS_BY_FAMILY

`Record<string, PermissionDescriptor[]>` —— 按自动生成的 `family` 索引分组的 `PERMS`。用于按类别渲染权限设置 UI。

### LEVELS

`number[]` —— `[100, 90, 70, 55, 40, 30, 20, 10, 5, 2, 1]` —— 10 个用户等级的百分比阈值。排名百分位低于阈值的用户获得该等级。

### BUILTIN_ROLES

预定义的角色权限集：

| 角色 | 值 | 说明 |
|------|-----|------|
| `guest` | `PERM.PERM_BASIC` | 访客（仅查看）权限 |
| `default` | `PERM.PERM_DEFAULT` | 注册用户默认权限 |
| `root` | `PERM.PERM_ALL` | 完整管理员权限 |

### DEFAULT_NODES

默认讨论节点分类及其子节点（中文标签）。用于为新域填充初始讨论板结构。

### CATEGORIES

题目类别分类 —— 一个 `Record<string, string[]>`，将顶层算法类别映射到子类别标签。用于题目分类。

---

## 方法

### 工具与工厂

#### `getScoreColor(score: number | string): string`

返回数值分数（0–100）对应的十六进制颜色字符串（`#rrggbb`），以 10 分为一档映射红到绿的渐变。非有限值返回 `#000000`。

#### `Permission(family: string, key: string, desc: string): PermissionDescriptor`

工厂函数，创建权限描述符对象 `{ family, key, desc }`。内部用于构建 `PERMS` 数组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `family` | `string` | — | 权限所属分类 |
| `key` | `string` | — | 权限常量名 |
| `desc` | `string` | — | 权限描述 |
| **返回值** | `PermissionDescriptor` | | `{ family, key, desc }` |

---

## 备注

- `PERM` 标志是 `bigint`（域作用域）；`PRIV` 标志是 `number`（系统作用域）。两者都用按位 OR（`|`）组合，按位 AND（`&`）检查。
- `PERM_VIEW_DISPLAYNAME` 已废弃 —— 请使用 `PERM_VIEW_USER_PRIVATE_INFO`（相同位位置 `1n << 67`）。
- `PRIV_EDIT_SYSTEM` 从 `PRIV_SET_PRIV` 重命名而来；`PRIV_JUDGE` 从更早的名称重命名而来。
- 模块在加载时注册自身到 `global.Hydro.model.builtin`。
- 通过 `export * from '@hydrooj/common/permission'` 和 `export * from '@hydrooj/common/status'` 重新导出。
