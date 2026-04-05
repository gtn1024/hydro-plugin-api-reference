<script setup>
import { useData } from 'vitepress';
import { computed } from 'vue';

const { frontmatter, page } = useData();

const mdLink = computed(() => {
  const path = page.value.relativePath;
  return path ? `/${path}` : null;
});

const meta = computed(() => {
  const fm = frontmatter.value;
  if (!fm || fm.layout === 'home') return null;

  const items = [];
  if (fm.description) items.push({ label: '描述', value: fm.description, icon: '📝' });
  if (fm.source) {
    const href = fm.source_url || null;
    items.push({ label: '源码', value: fm.source, href, icon: '📦' });
  }
  if (mdLink.value) items.push({ label: '文档', value: mdLink.value, href: mdLink.value, icon: '📄', md: true });
  if (fm.exports) items.push({ label: '导出', value: fm.exports, icon: '📤' });
  if (fm.category) items.push({ label: '分类', value: fm.category, icon: '🏷️' });
  if (fm.since) items.push({ label: '版本', value: `≥ ${fm.since}`, icon: '🔖' });
  if (fm.deprecated) items.push({ label: '已弃用', value: fm.deprecated, icon: '⚠️', warn: true });

  return items.length ? items : null;
});
</script>

<template>
  <div v-if="meta" class="meta-card">
    <div class="meta-card-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>页面信息</span>
    </div>
    <div class="meta-card-body">
      <div
        v-for="item in meta"
        :key="item.label"
        class="meta-row"
        :class="{ 'meta-row--warn': item.warn }"
      >
        <span class="meta-key">{{ item.icon }} {{ item.label }}</span>
        <span class="meta-val">
          <a v-if="item.href" :href="item.href" target="_blank" rel="noopener" class="meta-link">
            <code>{{ item.value }}</code>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <template v-else-if="item.label === '描述'">
            {{ item.value }}
          </template>
          <code v-else>{{ item.value }}</code>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meta-card {
  margin: 0 0 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.7;
}

.meta-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--vp-c-default-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-weight: 600;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.meta-card-body {
  padding: 12px 16px;
}

.meta-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 4px 0;
}

.meta-row + .meta-row {
  border-top: 1px dashed var(--vp-c-divider);
}

.meta-row--warn {
  color: var(--vp-c-warning-1);
}

.meta-key {
  flex-shrink: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  min-width: 80px;
}

.meta-val {
  color: var(--vp-c-text-1);
}

.meta-val code {
  font-size: 13px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
}

.meta-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.meta-link:hover {
  text-decoration: underline;
}

.link-icon {
  opacity: 0.6;
}
</style>
