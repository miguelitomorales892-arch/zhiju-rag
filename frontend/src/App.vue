<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { checkHealth } from './api/health'

const state = ref<'checking' | 'connected' | 'error'>('checking')
const errorMessage = ref('')
const checkedAt = ref('尚未完成检查')
const elapsedMs = ref<number | null>(null)
const endpoint = `${__API_BASE_PATH__}/health`
const title = computed(() => ({ checking: '正在检查连接', connected: '连接正常', error: '暂时无法连接' })[state.value])
let activeRequest: AbortController | undefined

async function refreshConnection(): Promise<void> {
  if (activeRequest) return
  const controller = new AbortController()
  activeRequest = controller
  state.value = 'checking'
  errorMessage.value = ''
  elapsedMs.value = null
  const startedAt = performance.now()
  try {
    await checkHealth(__API_BASE_PATH__, controller.signal)
    if (controller.signal.aborted) return
    elapsedMs.value = Math.round(performance.now() - startedAt)
    state.value = 'connected'
  } catch (error) {
    if (controller.signal.aborted) return
    errorMessage.value = error instanceof Error ? error.message : '检查失败，请稍后重试。'
    state.value = 'error'
  } finally {
    if (!controller.signal.aborted) checkedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    activeRequest = undefined
  }
}

onMounted(refreshConnection)
onBeforeUnmount(() => activeRequest?.abort())
</script>

<template>
  <div class="workspace">
    <header class="topbar">
      <a class="brand" href="/" aria-label="知据首页">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>知据<span class="brand-en">ZHIJU</span></span>
      </a>
      <span class="workspace-label"><span class="small-dot"></span>开发工作区</span>
    </header>

    <main>
      <section class="intro" aria-labelledby="page-title">
        <p class="eyebrow">WORKSPACE / 服务连接</p>
        <h1 id="page-title">让知识，<br />有据可循<span class="heading-dot">。</span></h1>
        <p class="intro-copy">从一次可靠的连接开始。<br class="mobile-break" />在这里确认知据 API 是否可以正常响应。</p>
      </section>

      <section class="connection-layout" aria-label="服务连接检查">
        <div class="connection-card" :class="state" :aria-busy="state === 'checking'">
          <div class="card-top"><span class="eyebrow">API CONNECTION</span><span class="check-mode">实时检查</span></div>
          <div class="connection-map" aria-hidden="true">
            <span class="map-node browser-node"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M3 8h18"/></svg></span>
            <span class="map-line"><span class="map-flow"></span></span>
            <span class="map-node api-node"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/></svg></span>
          </div>
          <div class="connection-status" role="status" aria-live="polite" aria-atomic="true">
            <span class="status-badge"><span class="small-dot"></span>{{ state === 'connected' ? '已连通' : state === 'checking' ? '检查中' : '未连通' }}</span>
            <h2>{{ title }}</h2>
            <p v-if="state === 'connected'">浏览器已收到 API 的正常响应。</p>
            <p v-else-if="state === 'checking'">正在向服务发送请求，请稍候。</p>
            <p v-else>{{ errorMessage }}</p>
          </div>
          <button class="check-button" :disabled="state === 'checking'" @click="refreshConnection">
            <svg viewBox="0 0 24 24" aria-hidden="true" :class="{ spinning: state === 'checking' }"><path d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/></svg>
            {{ state === 'checking' ? '正在检查…' : state === 'error' ? '重新连接' : '重新检查' }}
          </button>
          <div class="check-footer"><span>最近检查 <time>{{ checkedAt }}</time></span><span>{{ elapsedMs === null ? '—' : `${elapsedMs} ms` }}</span></div>
        </div>

        <aside class="details-card" aria-label="连接详情">
          <div class="details-heading"><span class="section-number">01</span><h2>连接详情</h2></div>
          <dl class="details-list">
            <div><dt>检查对象</dt><dd>知据 API</dd></div>
            <div><dt>请求方式</dt><dd><span class="method">GET</span></dd></div>
            <div><dt>请求路径</dt><dd><code>{{ endpoint }}</code></dd></div>
          </dl>
          <div class="response-panel">
            <div class="response-heading"><span>响应结果</span><span v-if="state === 'connected'" class="response-ok">正常</span></div>
            <pre v-if="state === 'connected'">{ "status": "ok" }</pre>
            <p v-else>{{ state === 'checking' ? '等待服务响应…' : '本次未获得正常响应' }}</p>
          </div>
          <div class="scope-note"><span class="note-icon" aria-hidden="true">i</span><p>此检查仅确认 API 可以响应。<br />数据库、模型与检索服务将在接入后分别验证。</p></div>
        </aside>
      </section>
      <p class="page-note">技术文档与项目知识 · 从连接到理解</p>
    </main>
    <footer class="footer"><span>知据 / ZhiJu RAG</span><span>连接是起点，证据是答案。</span></footer>
  </div>
</template>
