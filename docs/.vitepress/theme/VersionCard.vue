<script setup>
import { ref, onMounted } from 'vue';

const BASE_COMMIT = 'bf5533040e8a62c44cc7813ba2648e581c0c4497';
const REPO = 'hydro-dev/Hydro';
const API = 'https://api.github.com';

const short = (sha) => sha.slice(0, 7);
const commitUrl = (sha) => `https://github.com/${REPO}/commit/${sha}`;

const loading = ref(true);
const error = ref(null);
const latestSha = ref(null);
const behindBy = ref(null);
const latestDate = ref(null);

onMounted(async () => {
  try {
    const [compareRes, latestRes] = await Promise.all([
      fetch(`${API}/repos/${REPO}/compare/${BASE_COMMIT}...master`),
      fetch(`${API}/repos/${REPO}/commits/master`),
    ]);

    if (!compareRes.ok || !latestRes.ok) throw new Error('GitHub API rate limited');

    const compare = await compareRes.json();
    const latest = await latestRes.json();

    latestSha.value = latest.sha;
    latestDate.value = latest.commit?.author?.date?.slice(0, 10);
    behindBy.value = compare.behind_by ?? compare.ahead_by ?? 0;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="version-card">
    <div class="version-card-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>
      <span>版本追踪</span>
    </div>
    <div class="version-card-body">
      <div class="v-row">
        <span class="v-key">文档基于</span>
        <span class="v-val">
          <a :href="commitUrl(BASE_COMMIT)" target="_blank" rel="noopener" class="v-link">
            <code>{{ short(BASE_COMMIT) }}</code>
          </a>
        </span>
      </div>

      <div v-if="loading" class="v-row">
        <span class="v-key">最新 Commit</span>
        <span class="v-val loading-text">正在获取...</span>
      </div>

      <template v-else-if="error">
        <div class="v-row">
          <span class="v-key">最新 Commit</span>
          <span class="v-val v-err">获取失败（{{ error }}）</span>
        </div>
      </template>

      <template v-else>
        <div class="v-row">
          <span class="v-key">最新 Commit</span>
          <span class="v-val">
            <a :href="commitUrl(latestSha)" target="_blank" rel="noopener" class="v-link">
              <code>{{ short(latestSha) }}</code>
            </a>
            <span v-if="latestDate" class="v-date">{{ latestDate }}</span>
          </span>
        </div>
        <div class="v-row" :class="{ 'v-row--warn': behindBy > 0, 'v-row--ok': behindBy === 0 }">
          <span class="v-key">落后版本</span>
          <span class="v-val">
            <span v-if="behindBy === 0" class="v-badge v-badge--ok">已是最新</span>
            <span v-else class="v-badge v-badge--warn">{{ behindBy }} 个提交</span>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.version-card {
  margin: 0 auto 32px;
  max-width: 480px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.7;
}

.version-card-header {
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

.version-card-body {
  padding: 12px 16px;
}

.v-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 4px 0;
}

.v-row + .v-row {
  border-top: 1px dashed var(--vp-c-divider);
}

.v-key {
  flex-shrink: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  min-width: 90px;
}

.v-val {
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.v-val code {
  font-size: 13px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
}

.v-link {
  display: inline-flex;
  align-items: center;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.v-link:hover {
  text-decoration: underline;
}

.v-date {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.loading-text {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.v-err {
  font-size: 13px;
  color: var(--vp-c-warning-1);
}

.v-badge {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.v-badge--ok {
  background: rgba(46, 160, 67, 0.12);
  color: var(--vp-c-green-1, #2ea043);
}

.v-badge--warn {
  background: rgba(210, 153, 34, 0.12);
  color: var(--vp-c-warning-1, #d29922);
}
</style>
