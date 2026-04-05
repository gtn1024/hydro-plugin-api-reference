# HydroApis.agents

Hydro 在线评测系统插件开发文档站点，基于 VitePress 构建。

## 项目结构

```
docs/
├── backend/          # 后端 API 文档
│   ├── context/      # 上下文
│   ├── error/        # 错误处理
│   ├── event/        # 事件总线
│   ├── framework/    # 框架（装饰器、导出）
│   ├── handler/      # 处理器
│   ├── models/       # 数据模型
│   ├── service/      # 服务层
│   ├── services/     # 基础服务（数据库、存储）
│   └── utils/        # 工具函数
├── ui/               # 前端 UI 文档
│   ├── components/   # 组件
│   └── utils/        # 工具函数
└── meta/             # LLM 与技能文档
```

## 常用命令

- `pnpm docs:dev` — 启动开发服务器
- `pnpm docs:build` — 构建生产站点
- `pnpm docs:preview` — 预览构建结果

## 对齐 Hydro 源码

对齐 Hydro 代码后，务必更新 `docs/.vitepress/theme/VersionCard.vue` 中的 `BASE_COMMIT` 为对应的 commit SHA，以保持版本追踪卡片与文档实际对齐的版本一致。

## 开发约定

- 文档格式：VitePress Markdown（支持 frontmatter、Vue 组件）
- 包管理器：pnpm
