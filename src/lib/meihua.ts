import { Solar } from 'lunar-typescript'

/* ================= 基础数据 ================= */

export type WuXing = '金' | '木' | '水' | '火' | '土'

export interface Trigram {
  num: number          // 先天卦数 1-8
  name: string         // 乾 兑 离 震 巽 坎 艮 坤
  symbol: string       // ☰
  nature: string       // 天 泽 火 雷 风 水 山 地
  wuxing: WuXing
  lines: [number, number, number] // 自下而上，1 阳 0 阴
  imagery: string
}

export const TRIGRAMS: Trigram[] = [
  { num: 1, name: '乾', symbol: '☰', nature: '天', wuxing: '金', lines: [1, 1, 1], imagery: '刚健、君父、圆满' },
  { num: 2, name: '兑', symbol: '☱', nature: '泽', wuxing: '金', lines: [1, 1, 0], imagery: '喜悦、口舌、少女' },
  { num: 3, name: '离', symbol: '☲', nature: '火', wuxing: '火', lines: [1, 0, 1], imagery: '光明、文书、中女' },
  { num: 4, name: '震', symbol: '☳', nature: '雷', wuxing: '木', lines: [1, 0, 0], imagery: '发动、长男、惊起' },
  { num: 5, name: '巽', symbol: '☴', nature: '风', wuxing: '木', lines: [0, 1, 1], imagery: '谦逊、进退、长女' },
  { num: 6, name: '坎', symbol: '☵', nature: '水', wuxing: '水', lines: [0, 1, 0], imagery: '险陷、智谋、中男' },
  { num: 7, name: '艮', symbol: '☶', nature: '山', wuxing: '土', lines: [0, 0, 1], imagery: '静止、阻隔、少男' },
  { num: 8, name: '坤', symbol: '☷', nature: '地', wuxing: '土', lines: [0, 0, 0], imagery: '柔顺、包容、母众' },
]

/** 取先天卦数：n mod 8，余 0 为坤 8 */
export function trigramByNumber(n: number): Trigram {
  const r = n % 8 === 0 ? 8 : n % 8
  return TRIGRAMS[r - 1]
}

/* 六十四卦卦名表 [上卦-1][下卦-1] */
const HEX_NAMES: string[][] = [
  ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
  ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
  ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
  ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
  ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
  ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
  ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
  ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地'],
]

const HEX_MEANINGS: Record<string, string> = {
  '乾为天': '刚健中正，自强不息', '天泽履': '如履虎尾，谨慎前行', '天火同人': '志同道合，聚众成事',
  '天雷无妄': '顺其自然，勿存妄想', '天风姤': '不期而遇，防微杜渐', '天水讼': '争讼之象，以和为贵',
  '天山遁': '急流勇退，避其锋芒', '天地否': '闭塞不通，守静待时', '泽天夬': '当机立断，果决除弊',
  '兑为泽': '喜悦和悦，朋友讲习', '泽火革': '变革维新，顺时而动', '泽雷随': '随顺时势，择善而从',
  '泽风大过': '负重过甚，非常之举', '泽水困': '身处困境，守志待援', '泽山咸': '两情相感，交感亨通',
  '泽地萃': '荟萃聚集，聚众合力', '火天大有': '大获所有，丰盛亨通', '火泽睽': '乖背离异，小事可成',
  '离为火': '光明依附，文明之象', '火雷噬嗑': '咬合排障，明正法度', '火风鼎': '鼎新之象，稳重图成',
  '火水未济': '事未竟成，审慎收尾', '火山旅': '行旅在外，柔顺谨慎', '火地晋': '旭日东升，进取晋升',
  '雷天大壮': '壮盛之时，守正勿妄', '雷泽归妹': '婚嫁之象，知敝守常', '雷火丰': '丰盛至极，宜照天下',
  '震为雷': '惊雷动荡，临危不惧', '雷风恒': '恒久之道，持久有成', '雷水解': '险难得解，赦过宥罪',
  '雷山小过': '小有越过，宜小不宜大', '雷地豫': '安乐和悦，备豫不虞', '风天小畜': '小有蓄积，密云不雨',
  '风泽中孚': '诚信在中，感化万物', '风火家人': '家道有序，各正其位', '风雷益': '增益之象，利有攸往',
  '巽为风': '谦逊如风，申命行事', '风水涣': '涣散之象，聚以济涣', '风山渐': '循序渐进，稳步前行',
  '风地观': '观瞻省察，以德化人', '水天需': '耐心等待，需时而进', '水泽节': '节制有度，适可而止',
  '水火既济': '事已成济，慎终如始', '水雷屯': '初创艰难，蓄积待时', '水风井': '井养不穷，修己惠人',
  '坎为水': '险陷重重，行险守信', '水山蹇': '前有险阻，知难而退', '水地比': '亲比辅佐，众心归附',
  '山天大畜': '大有蓄积，养贤蓄德', '山泽损': '损下益上，损而有孚', '山火贲': '文饰之美，质实为本',
  '山雷颐': '颐养之道，慎言节欲', '山风蛊': '积弊生蛊，整饬更新', '山水蒙': '蒙昧初开，启蒙发智',
  '艮为山': '止而不动，知止不殆', '山地剥': '剥落侵蚀，硕果仅存', '地天泰': '天地交泰，通泰吉祥',
  '地泽临': '居高临下，教思无穷', '地火明夷': '光明入地，晦而转明', '地雷复': '一阳来复，反复其道',
  '地风升': '顺势上升，积小成大', '地水师': '兴师动众，以正率众', '地山谦': '谦谦君子，功成不居',
  '坤为地': '厚德载物，柔顺包容',
}

/* ================= 五行生克 ================= */

const SHENG: Record<WuXing, WuXing> = { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' } // a 生 SHENG[a]
const KE: Record<WuXing, WuXing> = { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' }     // a 克 KE[a]

export type Relation = '用生体' | '体克用' | '比和' | '体生用' | '用克体'

export function relationOf(ti: WuXing, yong: WuXing): Relation {
  if (ti === yong) return '比和'
  if (SHENG[yong] === ti) return '用生体'
  if (KE[ti] === yong) return '体克用'
  if (SHENG[ti] === yong) return '体生用'
  return '用克体'
}

const VERDICTS: Record<Relation, { level: string; score: number; text: string; advice: string }> = {
  '用生体': {
    level: '大吉', score: 95,
    text: '用卦生扶体卦，有外来之助，所谋顺遂，易得贵人扶持、外力成全。',
    advice: '宜把握时机，乘势而为，凡事多得助力，可大胆推进。',
  },
  '体克用': {
    level: '小吉', score: 75,
    text: '体卦克制用卦，事在人为，主动权在己，付出努力可以成事，但需费心费力。',
    advice: '宜主动作为，不可坐待；过程虽有操劳，终能掌握局面。',
  },
  '比和': {
    level: '吉', score: 85,
    text: '体用比和，气势相合，主事情平顺和谐，与人合作两利，所求多有共鸣。',
    advice: '宜顺其自然、和合共事；保持现状稳步前行即可。',
  },
  '体生用': {
    level: '小凶', score: 40,
    text: '体卦生扶用卦，自身之气外泄，主耗力、破费，付出多而回报少，宜防损耗。',
    advice: '宜收敛保守，量入为出；不宜大额投入，谨防为人作嫁。',
  },
  '用克体': {
    level: '凶', score: 20,
    text: '用卦克制体卦，外来压力侵身，主有阻碍、损耗或不顺，宜守不宜进。',
    advice: '宜退守观望，暂缓行动；凡事多加谨慎，待时而动。',
  },
}

/* ================= 起卦 ================= */

export interface Hexagram {
  upper: Trigram
  lower: Trigram
  name: string
  meaning: string
  lines: number[] // 6 爻，自下而上
}

export interface DivinationResult {
  question: string
  method: 'time' | 'number'
  basis: string[]              // 起卦依据的每一行说明
  ben: Hexagram
  hu: Hexagram
  bian: Hexagram
  dongYao: number              // 1-6，自下而上
  ti: { gua: Trigram; pos: '上卦' | '下卦' }
  yong: { gua: Trigram; pos: '上卦' | '下卦' }
  relation: Relation
  level: string
  score: number
  verdictText: string
  advice: string
  timeText?: string            // 时间起卦时的农历说明
}

function buildHexagram(upper: Trigram, lower: Trigram): Hexagram {
  const name = HEX_NAMES[upper.num - 1][lower.num - 1]
  return {
    upper, lower, name,
    meaning: HEX_MEANINGS[name] ?? '',
    lines: [...lower.lines, ...upper.lines],
  }
}

function hexagramFromLines(lines: number[]): Hexagram {
  const lower = TRIGRAMS.find(t => t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2])!
  const upper = TRIGRAMS.find(t => t.lines[0] === lines[3] && t.lines[1] === lines[4] && t.lines[2] === lines[5])!
  return buildHexagram(upper, lower)
}

function assemble(question: string, method: 'time' | 'number', benLines: number[], dongYao: number, basis: string[], timeText?: string): DivinationResult {
  const ben = hexagramFromLines(benLines)

  // 变卦：动爻阴阳互换
  const bianLines = [...benLines]
  bianLines[dongYao - 1] = bianLines[dongYao - 1] === 1 ? 0 : 1
  const bian = hexagramFromLines(bianLines)

  // 互卦：二三四爻为下互，三四五爻为上互
  const hu = buildHexagram(
    TRIGRAMS.find(t => t.lines[0] === benLines[2] && t.lines[1] === benLines[3] && t.lines[2] === benLines[4])!,
    TRIGRAMS.find(t => t.lines[0] === benLines[1] && t.lines[1] === benLines[2] && t.lines[2] === benLines[3])!,
  )

  // 体用：动爻所在之卦为用，另一卦为体
  const yongIsUpper = dongYao >= 4
  const tiGua = yongIsUpper ? ben.lower : ben.upper
  const yongGua = yongIsUpper ? ben.upper : ben.lower
  const relation = relationOf(tiGua.wuxing, yongGua.wuxing)
  const v = VERDICTS[relation]

  return {
    question, method, basis, ben, hu, bian, dongYao,
    ti: { gua: tiGua, pos: yongIsUpper ? '下卦' : '上卦' },
    yong: { gua: yongGua, pos: yongIsUpper ? '上卦' : '下卦' },
    relation, level: v.level, score: v.score, verdictText: v.text, advice: v.advice,
    timeText,
  }
}

const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 时间起卦：以农历年月日时起卦 */
export function castByTime(date: Date, question: string): DivinationResult {
  const lunar = Solar.fromDate(date).getLunar()
  const yearZhiNum = ZHI.indexOf(lunar.getYearZhi()) + 1          // 年支数
  const month = Math.abs(lunar.getMonth())                        // 农历月
  const day = lunar.getDay()                                      // 农历日
  const timeZhi = ZHI[Math.floor(((date.getHours() + 1) % 24) / 2)]
  const timeZhiNum = ZHI.indexOf(timeZhi) + 1                     // 时辰数

  const sumUp = yearZhiNum + month + day
  const sumAll = sumUp + timeZhiNum
  const upper = trigramByNumber(sumUp)
  const lower = trigramByNumber(sumAll)
  const dongYao = sumAll % 6 === 0 ? 6 : sumAll % 6

  const benLines = [...lower.lines, ...upper.lines]
  const monthText = lunar.getMonth() < 0 ? `闰${lunar.getMonthInChinese()}` : lunar.getMonthInChinese()
  const timeText = `农历${lunar.getYearInChinese()}年 ${monthText}月${lunar.getDayInChinese()} ${timeZhi}时`

  const basis = [
    `年支数 ${yearZhiNum}（${lunar.getYearZhi()}年）＋ 月数 ${month} ＋ 日数 ${day} ＝ ${sumUp}`,
    `${sumUp} ÷ 8 余 ${sumUp % 8 === 0 ? '0（取 8）' : sumUp % 8} → 上卦 ${upper.name}${upper.symbol}（${upper.nature}）`,
    `${sumUp} ＋ 时辰数 ${timeZhiNum}（${timeZhi}时）＝ ${sumAll}`,
    `${sumAll} ÷ 8 余 ${sumAll % 8 === 0 ? '0（取 8）' : sumAll % 8} → 下卦 ${lower.name}${lower.symbol}（${lower.nature}）`,
    `${sumAll} ÷ 6 余 ${sumAll % 6 === 0 ? '0（取 6）' : sumAll % 6} → 第 ${['一', '二', '三', '四', '五', '六'][dongYao - 1]} 爻动`,
  ]
  return assemble(question, 'time', benLines, dongYao, basis, timeText)
}

/** 数字起卦：两数定上下卦，两数之和（加时）定动爻 */
export function castByNumbers(a: number, b: number, hourZhiNum: number | null, question: string): DivinationResult {
  const upper = trigramByNumber(a)
  const lower = trigramByNumber(b)
  const sum = a + b + (hourZhiNum ?? 0)
  const dongYao = sum % 6 === 0 ? 6 : sum % 6

  const benLines = [...lower.lines, ...upper.lines]
  const basis = [
    `上数 ${a} ÷ 8 余 ${a % 8 === 0 ? '0（取 8）' : a % 8} → 上卦 ${upper.name}${upper.symbol}（${upper.nature}）`,
    `下数 ${b} ÷ 8 余 ${b % 8 === 0 ? '0（取 8）' : b % 8} → 下卦 ${lower.name}${lower.symbol}（${lower.nature}）`,
    hourZhiNum
      ? `${a} ＋ ${b} ＋ 时辰数 ${hourZhiNum} ＝ ${sum}，÷ 6 余 ${sum % 6 === 0 ? '0（取 6）' : sum % 6} → 第 ${['一', '二', '三', '四', '五', '六'][dongYao - 1]} 爻动`
      : `${a} ＋ ${b} ＝ ${sum}，÷ 6 余 ${sum % 6 === 0 ? '0（取 6）' : sum % 6} → 第 ${['一', '二', '三', '四', '五', '六'][dongYao - 1]} 爻动`,
  ]
  return assemble(question, 'number', benLines, dongYao, basis)
}

/** 当前时辰数（子 1 … 亥 12） */
export function currentHourZhiNum(date = new Date()): number {
  return Math.floor(((date.getHours() + 1) % 24) / 2) + 1
}

export const WUXING_COLORS: Record<WuXing, string> = {
  金: '#b08d57', 木: '#4a7c59', 水: '#3b6ea5', 火: '#b03a2e', 土: '#8a6d3b',
}

export const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
