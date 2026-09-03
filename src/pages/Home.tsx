import { useRef, useState } from 'react'
import {
  castByTime, castByNumbers, currentHourZhiNum,
  WUXING_COLORS, YAO_NAMES,
  type DivinationResult, type Hexagram,
} from '@/lib/meihua'
import { buildNarrative, verdictColor } from '@/lib/interpret'
import HexagramFigure from '@/components/HexagramFigure'

/* ---------------- 小组件 ---------------- */

function WuXingChip({ wx }: { wx: keyof typeof WUXING_COLORS }) {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white"
      style={{ background: WUXING_COLORS[wx] }}
    >
      {wx}
    </span>
  )
}

function GuaCard({ title, gua, isBen, result }: {
  title: string; gua: Hexagram; isBen?: boolean; result: DivinationResult
}) {
  const tiPos = isBen ? result.ti.pos : undefined
  const yongPos = isBen ? result.yong.pos : undefined
  return (
    <div className="flex flex-col items-center rounded-lg border border-[#d8cdb4] bg-[#faf6ec]/80 p-5">
      <div className="mb-1 text-xs tracking-[.35em] text-[#8a7a5c]">{title}</div>
      <div className="my-4">
        <HexagramFigure lines={gua.lines} dongYao={isBen ? result.dongYao : undefined} width={120} />
      </div>
      <div className="text-lg font-semibold tracking-[.15em] text-[#2a2622]">{gua.name}</div>
      <div className="mt-1 text-center text-xs leading-5 text-[#7a6a4e]">{gua.meaning}</div>
      <div className="mt-3 flex flex-col gap-1 text-xs text-[#5c5040]">
        <span className="flex items-center gap-1.5">
          上卦 {gua.upper.symbol} {gua.upper.name}·{gua.upper.nature}
          <WuXingChip wx={gua.upper.wuxing} />
          {tiPos === '上卦' && <em className="not-italic rounded bg-[#2a2622] px-1.5 py-px text-[10px] text-[#f3edde]">体</em>}
          {yongPos === '上卦' && <em className="not-italic rounded bg-[#a8352c] px-1.5 py-px text-[10px] text-white">用</em>}
        </span>
        <span className="flex items-center gap-1.5">
          下卦 {gua.lower.symbol} {gua.lower.name}·{gua.lower.nature}
          <WuXingChip wx={gua.lower.wuxing} />
          {tiPos === '下卦' && <em className="not-italic rounded bg-[#2a2622] px-1.5 py-px text-[10px] text-[#f3edde]">体</em>}
          {yongPos === '下卦' && <em className="not-italic rounded bg-[#a8352c] px-1.5 py-px text-[10px] text-white">用</em>}
        </span>
      </div>
    </div>
  )
}

/* ---------------- 主页面 ---------------- */

export default function Home() {
  const [question, setQuestion] = useState('')
  const [method, setMethod] = useState<'time' | 'number'>('time')
  const [timeMode, setTimeMode] = useState<'now' | 'custom'>('now')
  const [customTime, setCustomTime] = useState('')
  const [numA, setNumA] = useState('')
  const [numB, setNumB] = useState('')
  const [addHour, setAddHour] = useState(true)
  const [casting, setCasting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DivinationResult | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const randomFill = () => {
    setNumA(String(1 + Math.floor(Math.random() * 99)))
    setNumB(String(1 + Math.floor(Math.random() * 99)))
  }

  const cast = () => {
    setError('')
    let r: DivinationResult
    if (method === 'time') {
      let d = new Date()
      if (timeMode === 'custom') {
        if (!customTime) { setError('请先选择起卦时间'); return }
        d = new Date(customTime)
        if (isNaN(d.getTime())) { setError('时间格式不正确'); return }
      }
      r = castByTime(d, question.trim())
    } else {
      const a = parseInt(numA, 10), b = parseInt(numB, 10)
      if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) {
        setError('请输入两个正整数（心念所至，随口报数即可）'); return
      }
      r = castByNumbers(a, b, addHour ? currentHourZhiNum() : null, question.trim())
    }
    setCasting(true)
    setResult(null)
    window.setTimeout(() => {
      setCasting(false)
      setResult(r)
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    }, 900)
  }

  const narrative = result ? buildNarrative(result) : null
  const tone = result ? verdictColor(result.relation) : '#a8352c'

  return (
    <div className="min-h-screen bg-[#f3edde] text-[#2a2622] [font-family:'Noto_Serif_SC','STKaiti','KaiTi','SimSun',serif]">
      <div className="pointer-events-none fixed inset-0 opacity-60 [background:radial-gradient(circle_at_20%_10%,rgba(176,141,87,.08),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(168,53,44,.06),transparent_45%)]" />

      <div className="relative mx-auto max-w-3xl px-4 pb-20">
        {/* 题头 */}
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
          <div className="mt-4 h-px w-40 bg-gradient-to-r from-transparent via-[#b08d57] to-transparent" />
        </header>

        {/* 起卦区 */}
        <section className="rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/90 p-6 shadow-[0_4px_24px_rgba(90,70,40,.10)]">
          <label className="mb-2 block text-sm tracking-[.2em] text-[#5c5040]">你想問什麼？</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={2}
            placeholder="比如：明天去面试能成吗？这笔钱该不该借？最近要不要换工作……"
            className="w-full resize-none rounded-md border border-[#d8cdb4] bg-white/70 px-4 py-2.5 text-sm leading-6 outline-none transition focus:border-[#a8352c]/60 focus:ring-2 focus:ring-[#a8352c]/15"
          />

          <div className="mt-5 mb-2 text-sm tracking-[.2em] text-[#5c5040]">起卦方式</div>
          <div className="flex gap-2">
            {([['time', '時間起卦'], ['number', '數字起卦']] as const).map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`flex-1 rounded-md border px-4 py-2.5 text-sm tracking-[.25em] transition ${
                  method === m
                    ? 'border-[#a8352c] bg-[#a8352c] text-white shadow'
                    : 'border-[#d8cdb4] bg-white/60 text-[#5c5040] hover:border-[#a8352c]/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {method === 'time' ? (
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 text-sm text-[#5c5040]">
                <input type="radio" checked={timeMode === 'now'} onChange={() => setTimeMode('now')} className="accent-[#a8352c]" />
                以此刻起卦（当下时辰）
              </label>
              <label className="flex items-center gap-2 text-sm text-[#5c5040]">
                <input type="radio" checked={timeMode === 'custom'} onChange={() => setTimeMode('custom')} className="accent-[#a8352c]" />
                指定时间
                <input
                  type="datetime-local"
                  value={customTime}
                  onChange={e => setCustomTime(e.target.value)}
                  disabled={timeMode !== 'custom'}
                  className="rounded border border-[#d8cdb4] bg-white/70 px-2 py-1 text-xs outline-none disabled:opacity-40"
                />
              </label>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  value={numA} onChange={e => setNumA(e.target.value.replace(/\D/g, ''))}
                  placeholder="第一个数" inputMode="numeric"
                  className="w-24 rounded-md border border-[#d8cdb4] bg-white/70 px-3 py-2 text-center text-sm outline-none focus:border-[#a8352c]/60"
                />
                <input
                  value={numB} onChange={e => setNumB(e.target.value.replace(/\D/g, ''))}
                  placeholder="第二个数" inputMode="numeric"
                  className="w-24 rounded-md border border-[#d8cdb4] bg-white/70 px-3 py-2 text-center text-sm outline-none focus:border-[#a8352c]/60"
                />
                <button onClick={randomFill} className="rounded-md border border-[#b08d57] px-3 py-2 text-xs text-[#8a6d3b] transition hover:bg-[#b08d57]/10">
                  隨機取數
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#5c5040]">
                <input type="checkbox" checked={addHour} onChange={e => setAddHour(e.target.checked)} className="accent-[#a8352c]" />
                求动爻时加当前时辰数（传统算法）
              </label>
              <p className="text-xs leading-5 text-[#8a7a5c]">
                心里默念所问之事，随口报出两个数就行——不用想，脱口而出的最灵。
              </p>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-[#a8352c]">{error}</p>}

          <button
            onClick={cast}
            disabled={casting}
            className="mt-6 w-full rounded-md bg-[#a8352c] py-3 text-base tracking-[.5em] text-white shadow-[0_4px_16px_rgba(168,53,44,.35)] transition hover:bg-[#8f2b24] disabled:opacity-60"
          >
            {casting ? '搖卦中…' : '誠心起卦'}
          </button>
        </section>

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
              {result.question && (
                <p className="mb-4 text-sm text-[#7a6a4e]">你问：{result.question}</p>
              )}
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 text-5xl font-bold"
                style={{ borderColor: tone, color: tone, background: `${tone}14` }}
              >
                {narrative.verdictChar}
              </div>
              <p className="mt-4 text-lg leading-8 font-semibold" style={{ color: tone }}>
                {narrative.verdictTitle}
              </p>
              <p className="mt-2 text-xs tracking-[.2em] text-[#8a7a5c]">
                「{result.ben.name}」之「{result.bian.name}」 · 動在{YAO_NAMES[result.dongYao - 1]} · 體用{result.relation}
              </p>
            </section>

            {/* 娓娓道来 */}
            <section className="rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/90 p-7">
              <h3 className="mb-4 text-sm tracking-[.3em] text-[#8a7a5c]">卦 怎 麼 說</h3>
              <div className="space-y-4">
                {narrative.story.map((p, i) => (
                  <p key={i} className="text-[15px] leading-8 text-[#2a2622] first:font-medium" style={{ textIndent: '2em' }}>
                    {p}
                  </p>
                ))}
              </div>
            </section>

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
