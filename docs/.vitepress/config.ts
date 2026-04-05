import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Hydro API Docs',
  description: 'Hydro 在线评测系统 API 文档',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '指南', link: '/' },
      { text: 'Models', link: '/models/user' },
      { text: 'UI', link: '/ui/page' },
    ],
    sidebar: {
      '/models/': [
        {
          text: '数据模型',
          items: [
            { text: 'User', link: '/models/user' },
            { text: 'Domain', link: '/models/domain-model' },
            { text: 'Problem', link: '/models/problem-model' },
            { text: 'Contest', link: '/models/contest-model' },
            { text: 'Record', link: '/models/record-model' },
            { text: 'Document', link: '/models/document-model' },
            { text: 'Discussion', link: '/models/discussion-model' },
            { text: 'Solution', link: '/models/solution-model' },
            { text: 'Message', link: '/models/message-model' },
            { text: 'Token', link: '/models/token-model' },
            { text: 'OAuth', link: '/models/oauth-model' },
            { text: 'Task', link: '/models/task-model' },
            { text: 'Schedule', link: '/models/schedule-model' },
            { text: 'Storage', link: '/models/storage-model' },
            { text: 'Setting', link: '/models/setting-model' },
            { text: 'Blacklist', link: '/models/blacklist-model' },
            { text: 'Oplog', link: '/models/oplog-model' },
            { text: 'Opcount', link: '/models/opcount-model' },
            { text: 'Builtin', link: '/models/builtin-model' },
            { text: 'Training', link: '/models/training-model' },
            { text: 'System', link: '/models/system' },
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
          text: 'UI 子组件',
          items: [
            { text: 'Autocomplete', link: '/ui/components/autocomplete' },
            { text: 'Monaco', link: '/ui/components/monaco' },
            { text: 'Zip Downloader', link: '/ui/components/zip-downloader' },
          ],
        },
        {
          text: 'UI 工具',
          items: [
            { text: 'Common', link: '/ui/utils/common' },
            { text: 'Misc', link: '/ui/utils/misc' },
            { text: 'Request', link: '/ui/utils/request' },
            { text: 'Template', link: '/ui/utils/template' },
          ],
        },
      ],
      '/context/': [
        { text: 'Context 与 Service', link: '/context/' },
      ],
      '/framework/': [
        {
          text: 'Framework',
          items: [
            { text: 'Decorators', link: '/framework/decorators' },
            { text: 'Exports', link: '/framework/exports' },
          ],
        },
      ],
      '/service/': [
        {
          text: 'Service',
          items: [
            { text: 'Handler', link: '/service/handler' },
            { text: 'Setting Service', link: '/service/setting-service' },
          ],
        },
      ],
      '/services/': [
        {
          text: 'Services',
          items: [
            { text: 'DB & Collections', link: '/services/db-and-collections' },
            { text: 'Storage Service', link: '/services/storage-service' },
          ],
        },
      ],
      '/error/': [
        { text: 'Error', link: '/error/' },
      ],
      '/event/': [
        { text: 'Event Bus', link: '/event/event-bus' },
      ],
      '/handler/': [
        { text: 'Judge Handler', link: '/handler/judge' },
      ],
      '/utils/': [
        {
          text: 'Utils',
          items: [
            { text: 'Lib', link: '/utils/lib' },
            { text: 'Pipeline Utils', link: '/utils/pipeline-utils' },
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
