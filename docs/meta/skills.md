---
title: Skills
description: 通过 hydro-dev-skills 让 AI 快速掌握 Hydro 插件编写模式
---

# Hydro Dev Skills

[hydro-dev-skills](https://github.com/gtn1024/hydro-dev-skills) 是一组面向 AI 编程助手的 Hydro 插件开发 Skill，配合 [Skills](https://github.com/gtn1024/skills) CLI 使用，可让 AI 快速掌握 Hydro 插件的编写模式。

## 安装

```shell
npx skills add https://github.com/gtn1024/hydro-dev-skills.git
```

## 包含的 Skills

| Skill | 说明 |
|-------|------|
| `hydro-plugin-overview` | 插件基础：入口函数、import 约定、包结构、最小示例 |
| `hydro-plugin-handler` | HTTP 路由与 WebSocket：Handler 生命周期、参数装饰器、响应构建 |
| `hydro-plugin-hooks` | 事件系统：ctx.on/emit/broadcast、60+ 事件类型、定时任务 |
| `hydro-plugin-frontend` | 前端开发：NamedPage/AutoloadPage、模板注入、i18n |
| `hydro-plugin-services` | 服务 API：Setting、Storage、Task、Schedule、OAuth |
