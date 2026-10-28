import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import App from '../src/App.vue'

afterEach(() => vi.unstubAllGlobals())

it('首次加载时检查服务并显示真实成功状态', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"status":"ok"}')))
  const wrapper = mount(App)
  expect(wrapper.text()).toContain('正在检查')
  expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  await flushPromises()
  expect(wrapper.text()).toContain('连接正常')
  expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
  wrapper.unmount()
})

it('失败时提供重试，恢复后清除错误', async () => {
  const fetchMock = vi.fn()
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValueOnce(new Response('{"status":"ok"}'))
  vi.stubGlobal('fetch', fetchMock)
  const wrapper = mount(App)
  await flushPromises()
  expect(wrapper.text()).toContain('暂时无法连接')
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(wrapper.text()).toContain('连接正常')
  expect(wrapper.text()).not.toContain('暂时无法连接')
  expect(fetchMock).toHaveBeenCalledTimes(2)
  wrapper.unmount()
})
