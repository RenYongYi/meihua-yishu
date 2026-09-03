import { YAO_NAMES } from '@/lib/meihua'

interface Props {
  lines: number[]          // 6 爻，自下而上（index 0 = 初爻）
  dongYao?: number         // 1-6
  width?: number           // px
}

/** 卦象图：六爻自上而下绘制，动爻以朱砂圆点标记 */
export default function HexagramFigure({ lines, dongYao, width = 150 }: Props) {
  const barH = Math.round(width / 13)
  const gap = Math.round(barH * 1.15)
  const order = [5, 4, 3, 2, 1, 0] // 自上爻至初爻

  return (
    <div className="inline-flex items-start gap-3">
      <div className="flex flex-col" style={{ gap, width }}>
        {order.map(i => (
          <div key={i} className="relative flex items-center" style={{ height: barH }}>
            {lines[i] === 1 ? (
              <div className="w-full rounded-[2px] bg-[#2a2622]" style={{ height: barH }} />
            ) : (
              <div className="flex w-full justify-between" style={{ height: barH }}>
                <div className="rounded-[2px] bg-[#2a2622]" style={{ height: barH, width: '42%' }} />
                <div className="rounded-[2px] bg-[#2a2622]" style={{ height: barH, width: '42%' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      {dongYao !== undefined && (
        <div className="flex flex-col" style={{ gap }}>
          {order.map(i => (
            <div key={i} className="flex w-12 items-center" style={{ height: barH }}>
              {dongYao === i + 1 && (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#a8352c] shadow-[0_0_6px_rgba(168,53,44,.6)]" />
                  <span className="text-[11px] tracking-wide text-[#a8352c]">{YAO_NAMES[i]}动</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
