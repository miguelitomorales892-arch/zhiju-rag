/** 校验健康接口的真实响应；该接口只表示 API 可响应，不代表下游服务就绪。 */
export async function checkHealth(basePath: string, signal?: AbortSignal): Promise<{ status: 'ok' }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`${basePath}/health`, {
      signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`服务返回 HTTP ${response.status}，请确认后端运行正常。`)
    let body: unknown
    try {
      body = await response.json()
    } catch {
      throw new Error('服务响应格式不正确，请确认 API 地址。')
    }
    if (typeof body !== 'object' || body === null || !('status' in body) || body.status !== 'ok') {
      throw new Error('服务响应格式不正确，未收到约定的健康状态。')
    }
    return { status: 'ok' }
  } catch (error) {
    if (controller.signal.aborted) throw new Error('请求超时，请确认后端已启动后重试。')
    if (error instanceof TypeError) throw new Error('无法连接服务，请确认后端已启动后重试。')
    throw error
  } finally {
    clearTimeout(timer)
  }
}
