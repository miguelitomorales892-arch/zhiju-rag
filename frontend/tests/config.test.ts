import { describe, expect, it } from 'vitest'
import { readDevSettings } from '../config/dev'

describe('开发代理配置', () => {
  it('提供本地默认值', () => {
    expect(readDevSettings({})).toEqual({ apiTarget: 'http://127.0.0.1:8000', port: 5173, apiBasePath: '/api' })
  })
  it('使用指定端口和路径，并且不透传私有配置', () => {
    expect(readDevSettings({ API_HOST: '0.0.0.0', API_PORT: '8001', FRONTEND_PORT: '5174', FRONTEND_API_BASE_PATH: '/gateway/api', LLM_API_KEY: 'test-secret' }))
      .toEqual({ apiTarget: 'http://127.0.0.1:8001', port: 5174, apiBasePath: '/gateway/api' })
  })
  it('支持 IPv6 回环地址', () => {
    expect(readDevSettings({ API_HOST: '::' }).apiTarget).toBe('http://[::1]:8000')
  })
  it.each(['0', '70000', 'abc', '', '8000.5'])(
    '拒绝非法 API 端口 %s', (API_PORT) => {
      expect(() => readDevSettings({ API_PORT })).toThrow('API_PORT')
    },
  )
  it.each(['/', '//other.test', '/api?key=x', '/api/', '/a.b'])(
    '拒绝不明确的 API 前缀 %s', (FRONTEND_API_BASE_PATH) => {
      expect(() => readDevSettings({ FRONTEND_API_BASE_PATH })).toThrow('FRONTEND_API_BASE_PATH')
    },
  )
  it('拒绝把 URL 或路径当作主机名', () => {
    expect(() => readDevSettings({ API_HOST: 'https://example.com/path' })).toThrow('API_HOST')
  })
})
