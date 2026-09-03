/* 把起卦参数编码进 URL，用于分享 */

export interface ShareState {
  n?: string   // 称呼
  q?: string   // 问题
  r?: string   // 原委
  m: 'time' | 'number'
  t?: string   // 起卦时间文本
  a?: string   // 数字起卦 上数
  b?: string   // 数字起卦 下数
  h?: boolean  // 是否加时辰
}

export function encodeShare(s: ShareState): string {
  const json = JSON.stringify(s)
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)))
}

export function decodeShare(str: string): ShareState | null {
  try {
    const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export function buildShareUrl(s: ShareState): string {
  const base = location.origin + location.pathname
  return `${base}#s=${encodeShare(s)}`
}

export function readShareFromHash(): ShareState | null {
  const m = location.hash.match(/#s=([A-Za-z0-9+/=]+)/)
  return m ? decodeShare(m[1]) : null
}
