import { useRef, useState } from 'react'
import {
  castByTime, castByNumbers, currentHourZhiNum,
  WUXING_COLORS, YAO_NAMES,
  type DivinationResult, type Hexagram,
} from '@/lib/meihua'
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
    <div className="flex flex-col items-center rounded-lg border border-[#d8cdb4] bg-[#faf6ec]/80 p-5 shadow-[0_2px_12px_rgba(90,70,40,.08)]">
      <div className="mb-1 text-xs tracking-[.35em] text-[#8a7a5c]">{title}</div>
      <div className="my-4">
        <HexagramFigure lines={gua.lines} dongYao={isBen ? result.dongYao : undefined} width={140} />
      </div>
      <div className="text-xl font-semibold tracking-[.15em] text-[#2a2622]">{gua.name}</div>
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
        setError('请输入两个正整数（可心念所至随口报数）'); return
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

  const scoreColor = (s: number) => (s >= 75 ? '#4a7c59' : s >= 40 ? '#b08d57' : '#a8352c')

  return (
    <div className="min-h-screen bg-[#f3edde] text-[#2a2622] [font-family:'Noto_Serif_SC','STKaiti','KaiTi','SimSun',serif]">
      {/* 宣纸纹理 */}
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
          <p className="mt-3 text-sm tracking-[.3em] text-[#8a7a5c]">觀梅占 · 日用常行 隨問隨占</p>
          <div className="mt-4 h-px w-40 bg-gradient-to-r from-transparent via-[#b08d57] to-transparent" />
        </header>

        {/* 起卦区 */}
        <section className="rounded-xl border border-[#d8cdb4] bg-[#faf6ec]/90 p-6 shadow-[0_4px_24px_rgba(90,70,40,.10)]">
          <label className="mb-2 block text-sm tracking-[.2em] text-[#5c5040]">所問何事</label>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="心中默念所问之事，如：今日出行是否顺利……"
            className="w-full rounded-md border border-[#d8cdb4] bg-white/70 px-4 py-2.5 text-sm outline-none transition focus:border-[#a8352c]/60 focus:ring-2 focus:ring-[#a8352c]/15"
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
              <p className="text-xs leading-5 text-[#8a7a5c]">
                法取《梅花易数》年月日时起卦：年支数＋农历月＋农历日，除以八取上卦；再加时辰数，除以八取下卦、除以六取动爻。
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  value={numA} onChange={e => setNumA(e.target.value.replace(/\D/g, ''))}
                  placeholder="上数" inputMode="numeric"
                  className="w-24 rounded-md border border-[#d8cdb4] bg-white/70 px-3 py-2 text-center text-sm outline-none focus:border-[#a8352c]/60"
                />
                <input
                  value={numB} onChange={e => setNumB(e.target.value.replace(/\D/g, ''))}
                  placeholder="下数" inputMode="numeric"
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
                心念所至，随口报出两个数（或依所见之数）：上数除以八取上卦，下数除以八取下卦，两数之和（加时）除以六取动爻。
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

        {/* 摇卦动画 */}
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
        {result && !casting && (
          <div ref={resultRef} className="mt-10 space-y-6 [animation:fadeUp_.6s_ease]">
            {result.question && (
              <p className="text-center text-sm tracking-[.2em] text-[#5c5040]">
                所問：<span className="text-[#2a2622]">{result.question}</span>
              </p>
            )}

            {/* 起卦依据 */}
            <section className="rounded-lg border border-[#d8cdb4] bg-[#faf6ec]/80 p-5">
              <h3 className="mb-3 text-sm tracking-[.3em] text-[#8a7a5c]">起卦依據</h3>
              {result.timeText && <p className="mb-2 text-sm text-[#2a2622]">{result.timeText}</p>}
              <ul className="space-y-1 text-xs leading-6 text-[#5c5040]">
                {result.basis.map((b, i) => <li key={i}>· {b}</li>)}
              </ul>
            </section>

            {/* 三卦 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <GuaCard title="本卦 · 現狀" gua={result.ben} isBen result={result} />
              <GuaCard title="互卦 · 過程" gua={result.hu} result={result} />
              <GuaCard title="變卦 · 結果" gua={result.bian} result={result} />
            </div>

            {/* 体用生克 */}
            <section className="rounded-lg border border-[#d8cdb4] bg-[#faf6ec]/90 p-6">
              <h3 className="mb-4 text-sm tracking-[.3em] text-[#8a7a5c]">體用生剋</h3>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-md border border-[#2a2622]/30 px-4 py-2">
                  <span className="rounded bg-[#2a2622] px-1.5 py-px text-[10px] text-[#f3edde]">體</span>
                  <span>{result.ti.gua.symbol} {result.ti.gua.name}（{result.ti.gua.nature}）· {result.ti.pos}</span>
                  <WuXingChip wx={result.ti.gua.wuxing} />
                </div>
                <span className="text-xl text-[#a8352c]">{result.relation === '用克体' ? '剋→' : result.relation === '用生体' ? '生→' : result.relation === '体克用' ? '←剋' : result.relation === '体生用' ? '←生' : '比和'}</span>
                <div className="flex items-center gap-2 rounded-md border border-[#a8352c]/40 px-4 py-2">
                  <span className="rounded bg-[#a8352c] px-1.5 py-px text-[10px] text-white">用</span>
                  <span>{result.yong.gua.symbol} {result.yong.gua.name}（{result.yong.gua.nature}）· {result.yong.pos}</span>
                  <WuXingChip wx={result.yong.gua.wuxing} />
                </div>
              </div>

              <div className="mx-auto mt-5 max-w-md">
                <div className="mb-1 flex items-center justify-between text-xs text-[#8a7a5c]">
                  <span>體用關係：{result.relation}</span>
                  <span style={{ color: scoreColor(result.score) }}>{result.level}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e5dcc4]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.score}%`, background: scoreColor(result.score) }}
                  />
                </div>
              </div>
            </section>

            {/* 断语 */}
            <section className="rounded-lg border-2 border-[#a8352c]/50 bg-[#faf6ec] p-6 text-center shadow-[0_4px_24px_rgba(168,53,44,.12)]">
              <div className="mb-2 inline-block rounded-full border border-[#a8352c] px-5 py-1 text-lg tracking-[.4em] text-[#a8352c]">
                {result.level}
              </div>
              <p className="mt-4 text-sm leading-7 text-[#2a2622]">{result.verdictText}</p>
              <p className="mt-2 text-sm leading-7 text-[#7a6a4e]">{result.advice}</p>
              <div className="mt-4 border-t border-dashed border-[#d8cdb4] pt-3 text-xs leading-6 text-[#8a7a5c]">
                動在{YAO_NAMES[result.dongYao - 1]} · 互卦主事之過程，變卦主事之歸宿 · 「{result.ben.name}」之「{result.bian.name}」
              </div>
            </section>

            <p className="text-center text-xs leading-6 text-[#9a8a68]">
              梅花易數源自《易經》，占斷僅供日常參考。卦由心生，事在人為，存善心、行善事，自能趨吉避凶。
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
