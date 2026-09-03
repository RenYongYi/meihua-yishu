/* 生成卦签图片（Canvas 绘制，可保存分享） */

import type { DivinationResult } from './meihua'
import { YAO_NAMES } from './meihua'

const SERIF = '"Noto Serif SC","STKaiti","KaiTi","SimSun",serif'

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch } else line += ch
  }
  if (line) lines.push(line)
  return lines
}

function drawSeal(ctx: CanvasRenderingContext2D, name: string, cx: number, cy: number, size: number) {
  const chars = (name || '问卦').slice(0, 4).split('')
  const x = cx - size / 2, y = cy - size / 2
  ctx.fillStyle = '#a8352c'
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, 8)
  ctx.fill()
  ctx.fillStyle = '#f7f1e3'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (chars.length <= 2) {
    ctx.font = `bold ${size / (chars.length === 1 ? 1.9 : 2.3)}px ${SERIF}`
    chars.forEach((c, i) => ctx.fillText(c, cx, y + size * (chars.length === 1 ? 0.5 : 0.3 + i * 0.4)))
  } else {
    // 2×2 印面，传统印章从右上起竖读
    const order = chars.length === 3 ? [chars[0], chars[1], chars[2], ''] : chars
    ctx.font = `bold ${size * 0.3}px ${SERIF}`
    const pos = [[0.72, 0.28], [0.72, 0.72], [0.28, 0.28], [0.28, 0.72]]
    order.forEach((c, i) => c && ctx.fillText(c, x + size * pos[i][0], y + size * pos[i][1]))
  }
}

export function renderQian(r: DivinationResult, verdictChar: string, verdictTitle: string, tone: string): HTMLCanvasElement {
  const W = 700, H = 1160
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 宣纸底
  ctx.fillStyle = '#f7f1e3'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#b08d57'
  ctx.lineWidth = 3
  ctx.strokeRect(24, 24, W - 48, H - 48)
  ctx.lineWidth = 1
  ctx.strokeRect(34, 34, W - 68, H - 68)

  // 题头
  ctx.fillStyle = '#8a7a5c'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `24px ${SERIF}`
  ctx.fillText('梅 花 易 數', W / 2, 84)

  // 梅花点饰
  ctx.fillStyle = '#b04a41'
  for (const [fx, fy] of [[150, 84], [550, 84]]) {
    for (let a = 0; a < 5; a++) {
      ctx.beginPath()
      ctx.arc(fx + 9 * Math.cos(a * 1.2566), fy + 9 * Math.sin(a * 1.2566), 4.5, 0, 7)
      ctx.fill()
    }
  }

  // 印章 + 称呼
  if (r.name) drawSeal(ctx, r.name, W / 2, 160, 76)
  ctx.fillStyle = '#2a2622'
  ctx.font = `22px ${SERIF}`
  const whoLine = r.name ? `${r.name} 所问` : '所问之事'
  ctx.fillText(whoLine, W / 2, r.name ? 232 : 170)

  // 问题（自动换行）
  ctx.font = `26px ${SERIF}`
  ctx.fillStyle = '#2a2622'
  let yy = r.name ? 282 : 220
  for (const line of wrapText(ctx, `「${r.question || '心中所念之事'}」`, W - 160)) {
    ctx.fillText(line, W / 2, yy); yy += 40
  }
  if (r.timeText) {
    ctx.font = `18px ${SERIF}`
    ctx.fillStyle = '#8a7a5c'
    ctx.fillText(r.timeText, W / 2, yy + 6)
    yy += 40
  }

  // 卦象
  yy += 40
  const lineW = 220, lineH = 16, gap = 20
  const lx = W / 2 - lineW / 2
  ctx.fillStyle = '#2a2622'
  for (let i = 5; i >= 0; i--) {
    const ly = yy + (5 - i) * (lineH + gap)
    if (r.ben.lines[i] === 1) {
      ctx.fillRect(lx, ly, lineW, lineH)
    } else {
      ctx.fillRect(lx, ly, lineW * 0.42, lineH)
      ctx.fillRect(lx + lineW * 0.58, ly, lineW * 0.42, lineH)
    }
    if (r.dongYao === i + 1) {
      ctx.fillStyle = '#a8352c'
      ctx.beginPath(); ctx.arc(lx + lineW + 26, ly + lineH / 2, 7, 0, 7); ctx.fill()
      ctx.fillStyle = '#2a2622'
    }
  }
  yy += 6 * (lineH + gap) + 24

  // 卦名
  ctx.font = `bold 34px ${SERIF}`
  ctx.fillText(`${r.ben.name}  之  ${r.bian.name}`, W / 2, yy + 20)
  ctx.font = `18px ${SERIF}`
  ctx.fillStyle = '#8a7a5c'
  ctx.fillText(`动在${YAO_NAMES[r.dongYao - 1]} · 体用${r.relation}`, W / 2, yy + 58)
  yy += 100

  // 判字
  ctx.strokeStyle = tone
  ctx.lineWidth = 5
  ctx.beginPath(); ctx.arc(W / 2, yy + 55, 52, 0, 7); ctx.stroke()
  ctx.fillStyle = tone
  ctx.font = `bold 52px ${SERIF}`
  ctx.fillText(verdictChar, W / 2, yy + 58)
  yy += 130

  // 直断
  ctx.font = `bold 24px ${SERIF}`
  for (const line of wrapText(ctx, verdictTitle, W - 160)) {
    ctx.fillText(line, W / 2, yy); yy += 38
  }

  // 底部
  ctx.font = `17px ${SERIF}`
  ctx.fillStyle = '#9a8a68'
  ctx.fillText('卦由心生 · 事在人为 · 仅供参考', W / 2, H - 96)
  ctx.fillText('renyongyi.github.io/meihua-yishu', W / 2, H - 64)

  return canvas
}

export function downloadQian(canvas: HTMLCanvasElement, name?: string) {
  canvas.toBlob(blob => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `梅花易数卦签${name ? '-' + name : ''}.png`
    a.click()
    URL.revokeObjectURL(a.href)
  }, 'image/png')
}
