import { isIP } from 'node:net'

function readPort(value: string | undefined, fallback: number, key: string): number {
  if (value === undefined) return fallback
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    throw new Error(`${key} 必须是 1～65535 的整数`)
  }
  return Number(value)
}

/** 只返回开发代理需要的参数，禁止把完整环境对象传给浏览器。 */
export function readDevSettings(env: Record<string, string | undefined>): {
  apiTarget: string
  port: number
  apiBasePath: string
} {
  const host = env.API_HOST ?? '127.0.0.1'
  if (!isIP(host) && !/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(host)) {
    throw new Error('API_HOST 必须是 IP 地址或主机名，不包含协议、端口或路径')
  }
  // 监听所有网卡的地址不能直接作为浏览器代理目标，改用本机回环地址。
  const targetHost = host === '0.0.0.0' ? '127.0.0.1' : host === '::' ? '::1' : host
  const apiBasePath = env.FRONTEND_API_BASE_PATH ?? '/api'
  if (!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(apiBasePath)) {
    throw new Error('FRONTEND_API_BASE_PATH 必须是 /api 一类的路径，不含末尾斜杠')
  }
  const apiPort = readPort(env.API_PORT, 8000, 'API_PORT')
  return {
    apiTarget: `http://${isIP(targetHost) === 6 ? `[${targetHost}]` : targetHost}:${apiPort}`,
    port: readPort(env.FRONTEND_PORT, 5173, 'FRONTEND_PORT'),
    apiBasePath,
  }
}
