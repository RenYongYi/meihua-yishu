import { useEffect, useRef, useState } from 'react'
import {
  castByTime, castByNumbers, currentHourZhiNum,
  WUXING_COLORS, YAO_NAMES,
  type DivinationResult, type Hexagram,
} from '@/lib/meihua'
import { buildNarrative, verdictColor } from '@/lib/interpret'
import { themeForName } from '@/lib/theme'
import { buildShareUrl, readShareFromHash, type ShareState } from '@/lib/share'
import { renderQian, downloadQian } from '@/lib/qian'
import HexagramFigure from '@/components/HexagramFigure'

/* ---------------- 时间解析 ---------------- */

function formatTimeText(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日${p(d.getHours())}:${p(d.getMinutes())}`
}

function parseTimeText(text: string): Date | null {
  const m = text.match(/(\d{4})\s*[年\-/.]\s*(\d{1,2})\s*[月\-/.]\s*(\d{1,2})\s*[日号]?\s+?(\d{1,2})\s*[时:：点]\s*(\d{1,2})?/)
    || text.match(/(\d{4})\s*[年\-/.]\s*(\d{1,2})\s*[月\-/.]\s*(\d{1,2})\s*[日号]?(\d{1,2})\s*[时:：点]\s*(\d{1,2})?/)
  if (!m) return null
  const [, y, mo, d, h, mi] = m
  const date = new Date(+y, +mo - 1, +d, +h, +(mi ?? 0))
  if (isNaN(date.getTime())) return null
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31 || +h > 23 || +(mi ?? 0) > 59) return null
  return date
}

/* ---------------- 小组件 ---------------- */

function WuXingChip({ wx }: { wx: keyof typeof WUXING_COLORS }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white" style={{ background: WUXING_COLORS[wx] }}>
      {wx}
    </span>
  )
}

/** 姓名印章 */
function NameSeal({ name }: { name: string }) {
  const chars = (name || '問卦').slice(0, 4).split('')
  return (
    <div className="inline-flex h-[68px] w-[68px] flex-wrap content-center justify-center gap-0.5 rounded-md bg-[#a8352c] p-1.5 shadow-[0_2px_8px_rgba(168,53,44,.4)]">
      {chars.length <= 2 ? (
        <div className="flex h-full flex-col items-center justify-center leading-none">
          {chars.map((c, i) => <span key={i} className="text-[24px] font-bold leading-tight text-[#f7f1e3]">{c}</span>)}
        </div>
      ) : (
        <div className="grid h-full w-full grid-cols-2 place-items-center">
          {/* 传统印章读序：右上→右下→左上→左下，grid 行优先排列做映射 */}
          {[chars[2] ?? '', chars[0], chars[3] ?? '', chars[1]].map((c, i) => (
            <span key={i} className="text-[20px] font-bold leading-none text-[#f7f1e3]">{c}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function GuaCard({ title, gua, isBen, result }: { title: string; gua: Hexagram; isBen?: boolean; result: DivinationResult }) {
  const tiPos = isBen ? result.ti.pos : undefined
  const yongPos = isBen ? result.yong.pos : undefined
  return (
    <div className="flex flex-col items-center rounded-lg border border-[#d8cdb4] bg-[#faf6ec]/80 p-5">
      <div className="mb-1 text-xs tracking-[.35em] text-[#8a7a5c]">{title}</div>
      <div className="my-4"><HexagramFigure lines={gua.lines} dongYao={isBen ? result.dongYao : undefined} width={120} /></div>
      <div className="text-lg font-semibold tracking-[.15em] text-[#2a2622]">{gua.name}</div>
      <div className="mt-1 text-center text-xs leading-5 text-[#7a6a4e]">{gua.meaning}</div>
      <div className="mt-3 flex flex-col gap-1 text-xs text-[#5c5040]">
        <span className="flex items-center gap-1.5">
          上卦 {gua.upper.symbol} {gua.upper.name}·{gua.upper.nature}<WuXingChip wx={gua.upper.wuxing} />
          {tiPos === '上卦' && <em className="not-italic rounded bg-[#2a2622] px-1.5 py-px text-[10px] text-[#f3edde]">体</em>}
          {yongPos === '上卦' && <em className="not-italic rounded bg-[#a8352c] px-1.5 py-px text-[10px] text-white">用</em>}
        </span>
        <span className="flex items-center gap-1.5">
          下卦 {gua.lower.symbol} {gua.lower.name}·{gua.lower.nature}<WuXingChip wx={gua.lower.wuxing} />
          {tiPos === '下卦' && <em className="not-italic rounded bg-[#2a2622] px-1.5 py-px text-[10px] text-[#f3edde]">体</em>}
          {yongPos === '下卦' && <em className="not-italic rounded bg-[#a8352c] px-1.5 py-px text-[10px] text-white">用</em>}
        </span>
      </div>
    </div>
  )
}

/* ---------------- 主页面 ---------------- */

export default function Home() {
  const [name, setName] = useState('')
  const [question, setQuestion] = useState('')
  const [reason, setReason] = useState('')
  const [method, setMethod] = useState<'time' | 'number'>('time')
  const [timeText, setTimeText] = useState(() => formatTimeText(new Date()))
  const [numA, setNumA] = useState('')
  const [numB, setNumB] = useState('')
  const [addHour, setAddHour] = useState(true)
  const [casting, setCasting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DivinationResult | null>(null)
  const [shared, setShared] = useState(false)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const randomFill = () => {
    setNumA(String(1 + Math.floor(Math.random() * 99)))
    setNumB(String(1 + Math.floor(Math.random() * 99)))
  }

  const doCast = (s: ShareState): { ok: boolean; err?: string } => {
    const nm = s.n?.trim() || undefined
    const rs = s.r?.trim() || undefined
    let r: DivinationResult
    if (s.m === 'time') {
      const d = parseTimeText((s.t ?? '').trim())
      if (!d) return { ok: false, err: '时间格式没看懂，试试这样写：2026年9月3日14:06' }
      r = castByTime(d, (s.q ?? '').trim(), nm, rs)
    } else {
      const a = parseInt(s.a ?? '', 10), b = parseInt(s.b ?? '', 10)
      if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) {
        return { ok: false, err: '请输入两个正整数（心念所至，随口报数即可）' }
      }
      r = castByNumbers(a, b, s.h ? currentHourZhiNum() : null, (s.q ?? '').trim(), nm, rs)
    }
    setCasting(true)
    setResult(null)
    window.setTimeout(() => {
      setCasting(false)
      setResult(r)
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    }, 900)
    return { ok: true }
  }

  const cast = () => {
    setError('')
    const out = doCast({ n: name, q: question, r: reason, m: method, t: timeText, a: numA, b: numB, h: addHour })
    if (!out.ok) setError(out.err!)
  }

  // 分享链接进入：自动起卦
  useEffect(() => {
    const s = readShareFromHash()
    if (!s) return
    setShared(true)
    setName(s.n ?? ''); setQuestion(s.q ?? ''); setReason(s.r ?? '')
    setMethod(s.m); setTimeText(s.t ?? formatTimeText(new Date()))
    setNumA(s.a ?? ''); setNumB(s.b ?? ''); setAddHour(s.h ?? true)
    doCast(s)
  }, [])

  const exitShared = () => {
    location.hash = ''
    setShared(false)
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyShareLink = async () => {
    const url = buildShareUrl({ n: name, q: question, r: reason, m: method, t: timeText, a: numA, b: numB, h: addHour })
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('复制这个链接发给朋友：', url)
    }
  }

  const saveQian = () => {
    if (!result || !narrative) return
    downloadQian(renderQian(result, narrative.verdictChar, narrative.verdictTitle, tone), result.name)
  }

  const narrative = result ? buildNarrative(result) : null
  const tone = result ? verdictColor(result.relation) : '#a8352c'
  const theme = themeForName(result?.name ?? '')

  return (
    <div className="min-h-screen bg-[#f3edde] text-[#2a2622] [font-family:'Noto_Serif_SC','STKaiti','KaiTi','SimSun',serif]">
      <div className="pointer-events-none fixed inset-0 opacity-60 [background:radial-gradient(circle_at_20%_10%,rgba(176,141,87,.08),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(168,53,44,.06),transparent_45%)]" />

      <div className="relative mx-auto max-w-3xl px-4 pb-20">
        <header className="flex flex-col items-center pt-12 pb-8">
          <svg width="120" height="60" viewBox="0 0 120 60" className="mb-2 opacity-90">
            <path d="M8 52 C 30 40, 45 30, 70 22 C 85 17, 100 12, 114 6" stroke="#5c4a35" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M52 32 C 58 26, 62 24, 66 16" stroke="#5c4a35" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            {[[70, 20], [86, 14], [66, 12], [98, 9], [56, 30]].map(([x, y], k) => (
              <g key={k}>
                {[0, 72, 144, 216, 288].map(a => (
                  <circle key={a} cx={x + 4.6 * Math.cos(a * Math.PI / 180)} cy={y + 4.6 * Math.sin(a * Math.PI / 180)} r="3.1" fill="#b04a41" opacity="0.9" />
                ))}
                <circle cx={x} cy={y} r="1.6" fill="#e8c46a" />
              </g>
            ))}
          </svg>
          <h1 className="text-4xl font-bold tracking-[.4em] text-[#2a2622]">梅花易數</h1>
          <p className="mt-3 text-sm tracking-[.3em] text-[#8a7a5c]">心裡有件事拿不定？起一卦，聽聽怎麼說</p>
          <div className="mt-4 h-px w-40" style={{ background: `linear-gradient(to right, transparent, ${result ? theme.color : '#b08d57'}, transparent)` }} />
        </header>

        {/* 分享进入的横幅 */}
        {shared && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#b08d57] bg-[#faf6ec] p-4">
            <p className="text-sm text-[#5c5040]">📜 这是 <b>{name || '一位朋友'}</b> 分享给你的一卦</p>
            <button onClick={exitShared} className="rounded-md bg-[#a8352c] px-4 py-1.5 text-sm text-white transition hover:bg-[#8f2b24]">
              我也要占一卦
            </button>
          </div>
        )}

        {/* 起卦区（分享模式下收起） */}
        {!shared && (
        <section className="rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/90 p-6 shadow-[0_4px_24px_rgba(90,70,40,.10)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm tracking-[.2em] text-[#5c5040]">你的稱呼</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="怎么称呼你（可不填）"
                className="w-full rounded-md border border-[#d8cdb4] bg-white/70 px-4 py-2.5 text-sm outline-none transition focus:border-[#a8352c]/60 focus:ring-2 focus:ring-[#a8352c]/15"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm tracking-[.2em] text-[#5c5040]">起卦時間</label>
              <input
                value={timeText} onChange={e => setTimeText(e.target.value)}
                placeholder="2026年9月3日14:06"
                className="w-full rounded-md border border-[#d8cdb4] bg-white/70 px-4 py-2.5 text-sm outline-none transition focus:border-[#a8352c]/60 focus:ring-2 focus:ring-[#a8352c]/15"
              />
            </div>
          </div>
          <p className="mt-1.5 text-right text-xs text-[#9a8a68]">默认是现在，也可以改成别的时间</p>

          <label className="mt-3 mb-2 block text-sm tracking-[.2em] text-[#5c5040]">你想問什麼？</label>
          <textarea
            value={question} onChange={e => setQuestion(e.target.value)} rows={2}
            placeholder="比如：老师下节课会不会点名？这笔钱该不该借？"
            className="w-full resize-none rounded-md border border-[#d8cdb4] bg-white/70 px-4 py-2.5 text-sm leading-6 outline-none transition focus:border-[#a8352c]/60 focus:ring-2 focus:ring-[#a8352c]/15"
          />

          <label className="mt-3 mb-2 block text-sm tracking-[.2em] text-[#5c5040]">事情的原委<span className="ml-2 text-xs text-[#9a8a68]">（來龍去脈，說得越清楚卦越貼切）</span></label>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)} rows={2}
            placeholder="比如：我现在想翘课回宿舍玩游戏，又怕老师突击点名……"
            className="w-full resize-none rounded-md border border-[#d8cdb4] bg-white/70 px-4 py-2.5 text-sm leading-6 outline-none transition focus:border-[#a8352c]/60 focus:ring-2 focus:ring-[#a8352c]/15"
          />

          <div className="mt-5 mb-2 text-sm tracking-[.2em] text-[#5c5040]">起卦方式</div>
          <div className="flex gap-2">
            {([['time', '時間起卦'], ['number', '數字起卦']] as const).map(([m, label]) => (
              <button
                key={m} onClick={() => setMethod(m)}
                className={`flex-1 rounded-md border px-4 py-2.5 text-sm tracking-[.25em] transition ${
                  method === m ? 'border-[#a8352c] bg-[#a8352c] text-white shadow' : 'border-[#d8cdb4] bg-white/60 text-[#5c5040] hover:border-[#a8352c]/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {method === 'number' && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <input value={numA} onChange={e => setNumA(e.target.value.replace(/\D/g, ''))} placeholder="第一个数" inputMode="numeric"
                  className="w-24 rounded-md border border-[#d8cdb4] bg-white/70 px-3 py-2 text-center text-sm outline-none focus:border-[#a8352c]/60" />
                <input value={numB} onChange={e => setNumB(e.target.value.replace(/\D/g, ''))} placeholder="第二个数" inputMode="numeric"
                  className="w-24 rounded-md border border-[#d8cdb4] bg-white/70 px-3 py-2 text-center text-sm outline-none focus:border-[#a8352c]/60" />
                <button onClick={randomFill} className="rounded-md border border-[#b08d57] px-3 py-2 text-xs text-[#8a6d3b] transition hover:bg-[#b08d57]/10">隨機取數</button>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#5c5040]">
                <input type="checkbox" checked={addHour} onChange={e => setAddHour(e.target.checked)} className="accent-[#a8352c]" />
                求动爻时加当前时辰数（传统算法）
              </label>
              <p className="text-xs leading-5 text-[#8a7a5c]">心里默念所问之事，随口报出两个数就行——不用想，脱口而出的最灵。</p>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-[#a8352c]">{error}</p>}

          <button
            onClick={cast} disabled={casting}
            className="mt-6 w-full rounded-md bg-[#a8352c] py-3 text-base tracking-[.5em] text-white shadow-[0_4px_16px_rgba(168,53,44,.35)] transition hover:bg-[#8f2b24] disabled:opacity-60"
          >
            {casting ? '搖卦中…' : '誠心起卦'}
          </button>
        </section>
        )}

        {casting && (
          <div className="mt-10 flex justify-center">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-3 w-3 animate-bounce rounded-full bg-[#a8352c]" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* 结果区 */}
        {result && narrative && !casting && (
          <div ref={resultRef} className="mt-10 space-y-6 [animation:fadeUp_.6s_ease]">

            {/* 直断 */}
            <section className="rounded-xl border-2 bg-[#faf6ec] p-6 text-center shadow-[0_4px_24px_rgba(90,70,40,.12)]" style={{ borderColor: tone }}>
              {result.name && (
                <div className="mb-4 flex items-center justify-center gap-3">
                  <NameSeal name={result.name} />
                  <div className="text-left">
                    <p className="text-sm text-[#5c5040]">此卦為 <b>{result.name}</b> 而起</p>
                    <p className="text-xs" style={{ color: theme.color }}>命屬{theme.label}色</p>
                  </div>
                </div>
              )}
              <p className="mb-4 text-sm text-[#7a6a4e]">问：{result.question || '心中所念之事'}</p>
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 text-5xl font-bold"
                style={{ borderColor: tone, color: tone, background: `${tone}14`, boxShadow: `0 0 0 6px ${theme.color}22` }}
              >
                {narrative.verdictChar}
              </div>
              <p className="mt-4 text-lg leading-8 font-semibold" style={{ color: tone }}>{narrative.verdictTitle}</p>
              <p className="mt-2 text-xs tracking-[.2em] text-[#8a7a5c]">
                「{result.ben.name}」之「{result.bian.name}」 · 動在{YAO_NAMES[result.dongYao - 1]} · 體用{result.relation}
              </p>
            </section>

            {/* 分板块解读 */}
            {narrative.blocks.map((b, i) => (
              <section key={i} className="rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/90 p-7">
                <h3 className="mb-4 flex items-center gap-2 text-sm tracking-[.3em] text-[#8a7a5c]">
                  <span className="inline-block h-4 w-1 rounded" style={{ background: theme.color }} />
                  {b.title}
                </h3>
                {b.paras && (
                  <div className="space-y-4">
                    {b.paras.map((p, j) => (
                      <p key={j} className="text-[15px] leading-8 text-[#2a2622]" style={{ textIndent: '2em' }}>{p}</p>
                    ))}
                  </div>
                )}
                {b.bullets && (
                  <ul className="space-y-3">
                    {b.bullets.map((w, j) => (
                      <li key={j} className="flex gap-3 text-[15px] leading-7 text-[#2a2622]">
                        <span className="mt-1 font-bold" style={{ color: tone }}>{j + 1}.</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* 做与不做 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/90 p-6">
                <h4 className="mb-3 text-sm font-semibold tracking-[.25em]" style={{ color: tone }}>若 做</h4>
                <p className="text-sm leading-7 text-[#2a2622]">{narrative.consequenceDo}</p>
              </section>
              <section className="rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/90 p-6">
                <h4 className="mb-3 text-sm font-semibold tracking-[.25em] text-[#7a6a4e]">若 不 做</h4>
                <p className="text-sm leading-7 text-[#2a2622]">{narrative.consequenceDont}</p>
              </section>
            </div>

            {/* 叮嘱 */}
            <section className="rounded-xl border-l-4 bg-[#faf6ec]/90 p-6" style={{ borderLeftColor: tone }}>
              <h4 className="mb-2 text-sm tracking-[.25em] text-[#8a7a5c]">叮 囑 一 句</h4>
              <p className="text-sm leading-7 text-[#2a2622]">{narrative.tip}</p>
            </section>

            {/* 分享 */}
            <section className="flex flex-col gap-3 sm:flex-row">
              <button onClick={copyShareLink}
                className="flex-1 rounded-md border-2 border-[#b08d57] bg-[#faf6ec] py-3 text-sm tracking-[.2em] text-[#8a6d3b] transition hover:bg-[#b08d57]/10">
                {copied ? '✓ 已複製，發給朋友吧' : '🔗 複製這卦的專屬鏈接'}
              </button>
              <button onClick={saveQian}
                className="flex-1 rounded-md border-2 border-[#a8352c] bg-[#a8352c] py-3 text-sm tracking-[.2em] text-white transition hover:bg-[#8f2b24]">
                🖼️ 生成卦簽圖片（可保存分享）
              </button>
            </section>

            {/* 卦象详参（折叠） */}
            <details className="group rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/70 p-5">
              <summary className="cursor-pointer text-center text-sm tracking-[.3em] text-[#8a7a5c] transition hover:text-[#5c5040]">
                卦 象 詳 參（本卦 · 互卦 · 變卦）<span className="inline-block transition group-open:rotate-180">▾</span>
              </summary>
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <GuaCard title="本卦 · 現狀" gua={result.ben} isBen result={result} />
                  <GuaCard title="互卦 · 過程" gua={result.hu} result={result} />
                  <GuaCard title="變卦 · 結果" gua={result.bian} result={result} />
                </div>
                <div className="rounded-lg border border-[#d8cdb4] bg-white/40 p-4">
                  <h4 className="mb-2 text-xs tracking-[.3em] text-[#8a7a5c]">起卦依據</h4>
                  {result.timeText && <p className="mb-1 text-sm text-[#2a2622]">{result.timeText}</p>}
                  <ul className="space-y-1 text-xs leading-6 text-[#5c5040]">
                    {result.basis.map((b, i) => <li key={i}>· {b}</li>)}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-dashed border-[#d8cdb4] pt-3 text-xs text-[#5c5040]">
                    <span className="flex items-center gap-1.5">
                      <em className="not-italic rounded bg-[#2a2622] px-1.5 py-px text-[10px] text-[#f3edde]">體</em>
                      {result.ti.gua.symbol} {result.ti.gua.name}（{result.ti.gua.nature}）<WuXingChip wx={result.ti.gua.wuxing} />
                    </span>
                    <span className="text-[#a8352c]">{result.relation}</span>
                    <span className="flex items-center gap-1.5">
                      <em className="not-italic rounded bg-[#a8352c] px-1.5 py-px text-[10px] text-white">用</em>
                      {result.yong.gua.symbol} {result.yong.gua.name}（{result.yong.gua.nature}）<WuXingChip wx={result.yong.gua.wuxing} />
                    </span>
                  </div>
                </div>
              </div>
            </details>

            <p className="text-center text-xs leading-6 text-[#9a8a68]">
              卦由心生，事在人為。占斷是給你多一個看事情的角度，路終究是自己走出來的。
            </p>
          </div>
        )}

        <footer className="mt-16 text-center text-xs tracking-[.3em] text-[#b3a585]">
          梅花易數 · 宋 邵康節 遺法
        </footer>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
