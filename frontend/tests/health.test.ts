import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkHealth } from '../src/api/health'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('健康接口请求', () => {
  it('请求同源接口并接受约定的响应', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"status":"ok"}'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(checkHealth('/api')).resolves.toEqual({ status: 'ok' })
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/health')
  })

  it('拒绝非成功状态码', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
    await expect(checkHealth('/api')).rejects.toThrow('503')
  })

  it.each(['{"status":"down"}', 'null', '<html>not json</html>'])(
    '拒绝无效响应 %s', async (body) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body)))
      await expect(checkHealth('/api')).rejects.toThrow('响应格式')
    },
  )

  it('请求超时后取消等待', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
      }),
    ))
    const result = expect(checkHealth('/api')).rejects.toThrow('超时')
    await vi.advanceTimersByTimeAsync(5000)
    await result
  })
})
