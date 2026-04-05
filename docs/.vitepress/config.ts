import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Hydro API Docs',
  description: 'Hydro 在线评测系统 API 文档',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '指南', link: '/' },
      { text: '后端', link: '/backend/context/' },
      { text: 'UI', link: '/ui/page' },
    ],
    sidebar: {
      '/backend/': [
        {
          text: '核心',
          items: [
            { text: 'Context & Service', link: '/backend/context/' },
            { text: 'Event Bus', link: '/backend/event/event-bus' },
            { text: 'Error', link: '/backend/error/' },
          ],
        },
        {
          text: '数据模型',
          collapsed: true,
          items: [
            { text: 'User', link: '/backend/models/user' },
            { text: 'Domain', link: '/backend/models/domain-model' },
            { text: 'Problem', link: '/backend/models/problem-model' },
            { text: 'Contest', link: '/backend/models/contest-model' },
            { text: 'Record', link: '/backend/models/record-model' },
            { text: 'Document', link: '/backend/models/document-model' },
            { text: 'Discussion', link: '/backend/models/discussion-model' },
            { text: 'Solution', link: '/backend/models/solution-model' },
            { text: 'Message', link: '/backend/models/message-model' },
            { text: 'Token', link: '/backend/models/token-model' },
            { text: 'OAuth', link: '/backend/models/oauth-model' },
            { text: 'Task', link: '/backend/models/task-model' },
            { text: 'Schedule', link: '/backend/models/schedule-model' },
            { text: 'Storage', link: '/backend/models/storage-model' },
            { text: 'Setting', link: '/backend/models/setting-model' },
            { text: 'Blacklist', link: '/backend/models/blacklist-model' },
            { text: 'Oplog', link: '/backend/models/oplog-model' },
            { text: 'Opcount', link: '/backend/models/opcount-model' },
            { text: 'Builtin', link: '/backend/models/builtin-model' },
            { text: 'Training', link: '/backend/models/training-model' },
            { text: 'System', link: '/backend/models/system' },
          ],
        },
        {
          text: '服务',
          items: [
            { text: 'Handler', link: '/backend/service/handler' },
            { text: 'Setting Service', link: '/backend/service/setting-service' },
            { text: 'DB & Collections', link: '/backend/services/db-and-collections' },
            { text: 'Storage Service', link: '/backend/services/storage-service' },
          ],
        },
        {
          text: '处理器',
          items: [
            { text: 'Judge', link: '/backend/handler/judge' },
          ],
        },
        {
          text: '框架',
          items: [
            { text: 'Decorators', link: '/backend/framework/decorators' },
            { text: 'Exports', link: '/backend/framework/exports' },
          ],
        },
        {
          text: '工具',
          items: [
            { text: 'Lib', link: '/backend/utils/lib' },
            { text: 'Pipeline Utils', link: '/backend/utils/pipeline-utils' },
          ],
        },
      ],
      '/ui/': [
        {
          text: 'UI 组件',
          items: [
            { text: 'Page', link: '/ui/page' },
            { text: 'Context', link: '/ui/context' },
            { text: 'Dialog', link: '/ui/dialog' },
            { text: 'Socket', link: '/ui/socket' },
            { text: 'LazyLoad', link: '/ui/lazyload' },
            { text: 'PageLoader', link: '/ui/page-loader' },
            { text: 'Third Party', link: '/ui/third-party' },
            { text: 'Upload Files', link: '/ui/upload-files' },
            { text: 'Notification & SelectUser', link: '/ui/notification-rotator-selectuser' },
          ],
        },
        {
          text: '子组件',
          items: [
            { text: 'Autocomplete', link: '/ui/components/autocomplete' },
            { text: 'Monaco', link: '/ui/components/monaco' },
            { text: 'Zip Downloader', link: '/ui/components/zip-downloader' },
          ],
        },
        {
          text: '工具',
          items: [
            { text: 'Common', link: '/ui/utils/common' },
            { text: 'Misc', link: '/ui/utils/misc' },
            { text: 'Request', link: '/ui/utils/request' },
            { text: 'Template', link: '/ui/utils/template' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hydro-dev/Hydro' },
    ],
    search: {
      provider: 'local',
    },
  },
});
