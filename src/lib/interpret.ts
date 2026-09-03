import type { DivinationResult, Relation } from './meihua'
import { YAO_NAMES } from './meihua'
import { HEX_DETAIL, CATEGORIES, OVERALL, WARNINGS } from './guatext'

export interface Block {
  title: string
  paras?: string[]
  bullets?: string[]
}

export interface Narrative {
  verdictChar: string
  verdictTitle: string
  blocks: Block[]
  consequenceDo: string
  consequenceDont: string
  tip: string
}

const VERDICT: Record<Relation, { char: string; tone: string; title: string }> = {
  '用生体': { char: '宜', tone: '#4a7c59', title: '放心去做——这卦是事情来成就你的格局。' },
  '比和': { char: '顺', tone: '#4a7c59', title: '可以做——你和这件事气场相合，多半水到渠成。' },
  '体克用': { char: '为', tone: '#b08d57', title: '做得，但要亲力亲为——能成，只是省不了力气。' },
  '体生用': { char: '慎', tone: '#b08d57', title: '不太划算——做成了也可能是你吃亏，三思而后行。' },
  '用克体': { char: '止', tone: '#a8352c', title: '先别做——眼下阻力正冲着你来，缓一缓是上策。' },
}

const RELATION_STORY: Record<Relation, string> = {
  '用生体': '体卦是你，用卦是事。这一卦用卦生体卦——事情反过来滋养你，外力主动来帮扶。好比顺水行舟，水推船走；又像有人在你背后托一把，不用太费力，事情自会往好里走。',
  '比和': '体卦是你，用卦是事。这一卦体用同气比和——你和这件事谁也不克谁，像老朋友见面，脾气相投。做事多半顺顺当当，若涉及他人，也容易两厢情愿、合作愉快。',
  '体克用': '体卦是你，用卦是事。这一卦体卦克用卦——主动权握在你手里，事情能被你看住、推动。但"克"是用力制服的意思：能成，却要靠你一点一点去磨、去盯、去张罗。',
  '体生用': '体卦是你，用卦是事。这一卦体卦生用卦——你的精气神在往外流，去喂养这件事。你要源源不断地搭时间、搭钱、搭人情，事情却未必回头滋养你。',
  '用克体': '体卦是你，用卦是事。这一卦用卦克体卦——事情压着你来，外在的阻力正冲着你。硬往前闯，好比顶风行船、逆水爬坡，容易碰壁吃亏。',
}

const CONSEQUENCE: Record<Relation, { do: string; dont: string }> = {
  '用生体': {
    do: '多得外力成全，往往事半功倍。办成的过程里还可能借势结识贵人、打开新局面，收获超出事情本身。',
    dont: '错过的是送上门来的机缘。这种"事情来找你"的好格局不常有，时过境迁，未必再来。',
  },
  '比和': {
    do: '进展平顺，少有磕绊；与人共事则两利，自己办事则心安。顺着走下去，该有的都会有。',
    dont: '也没什么大损失，只是事情原地踏步，机会平平淡淡地过去了。',
  },
  '体克用': {
    do: '能成，但全程要自己盯着、推着、催着，费心费力。成在坚持，败在半撒手——要么不做，要做就做到底。',
    dont: '省了力气，但事情也就搁下了。若它对你真的重要，绕过今天，迟早还得回头来做。',
  },
  '体生用': {
    do: '容易花钱出力不见回头，重则替人作嫁：你操持一场，好处落在别人那里，自己落一身疲惫。',
    dont: '守住了精力和财力，没有任何损失。对这种卦象来说，"不做"本身就是赢。',
  },
  '用克体': {
    do: '容易碰壁受阻：轻则破财费神、徒劳无功，重则惹出纠纷麻烦，把自己搭进去。',
    dont: '避其锋芒，是最稳妥的选择。不是永远不做，是等这阵克你的风过去。',
  },
}

const TIP: Record<Relation, string> = {
  '用生体': '好运来时别端着——别人帮你要领情，机会来了要接住。顺势把事情做扎实，别辜负了这卦好局。',
  '比和': '越是顺的时候越要稳。别因为顺利就贪多求快、掉以轻心，守住节奏，好局才能走到底。',
  '体克用': '做好打持久战的准备。定个计划一步一步来，急不得也懒不得——这卦成的关键全在"亲为"二字。',
  '体生用': '若实在推不掉、非做不可，先想清楚"我愿意付出到什么限度"，给自己设一条止损线，过线就停。',
  '用克体': '若是不得不做的事，宜守不宜攻：能拖则拖、能让则让，重要的决定和投入往后挪一挪，等卦气转了再说。',
}

const DONG_YAO_TEXT = [
  '动在初爻——变数刚刚萌芽，一切都还来得及调整，此时一个小小的改动，往往能影响全局。',
  '动在二爻——变化生在事情的里子，外人还看不出来，自己心里要有数，宜早做打算。',
  '动在三爻——正处在不上不下的关口，进也难退也难，这时候最忌莽撞，稳住就是赢。',
  '动在四爻——变化来自外部环境或上头的人，不全由你做主，要留意外面的风向。',
  '动在五爻——变在关键位置，牵一发而动全身，这一步走对走错，分量都比平时重。',
  '动在上爻——事情已到顶点，物极必反，正是翻篇的时候，旧的去了，新的局面就要展开。',
]

function detail(name: string): string {
  return HEX_DETAIL[name] ?? ''
}

export function detectCategory(text: string) {
  return CATEGORIES.find(c => c.keywords.test(text))
}

export function buildNarrative(r: DivinationResult): Narrative {
  const v = VERDICT[r.relation]
  const c = CONSEQUENCE[r.relation]
  const who = r.name || '你'
  const q = r.question || '心里念的这件事'
  const reasonPart = r.reason ? `事情的原委是这样：${r.reason}。` : ''

  const blocks: Block[] = [
    { title: '整 体 总 断', paras: [`${who}问的是「${q}」。${reasonPart}${OVERALL[r.relation]}`] },
    {
      title: `现 状 · 「${r.ben.name}」`,
      paras: [
        `本卦「${r.ben.name}」——上卦${r.ben.upper.name}为${r.ben.upper.nature}，主${r.ben.upper.imagery}；下卦${r.ben.lower.name}为${r.ben.lower.nature}，主${r.ben.lower.imagery}。${detail(r.ben.name)}`,
        DONG_YAO_TEXT[r.dongYao - 1],
      ],
    },
    {
      title: `过 程 · 「${r.hu.name}」`,
      paras: [`往事情深处再看一层，互卦是「${r.hu.name}」，这是过程与隐情的写照。${detail(r.hu.name)}`],
    },
    {
      title: `归 宿 · 「${r.bian.name}」`,
      paras: [`${YAO_NAMES[r.dongYao - 1]}一动，终成「${r.bian.name}」，这是事情的走向与归宿。${detail(r.bian.name)}`, RELATION_STORY[r.relation]],
    },
  ]

  const cat = detectCategory(`${r.question ?? ''} ${r.reason ?? ''}`)
  if (cat) {
    blocks.push({
      title: `分 事 而 断 · ${cat.label}`,
      paras: [`落在「${cat.label}」上，这卦这样说：${cat.dynamics[r.relation]}`],
    })
  }

  blocks.push({ title: '需 要 提 防 的 问 题', bullets: WARNINGS[r.relation] })

  return {
    verdictChar: v.char,
    verdictTitle: v.title,
    blocks,
    consequenceDo: c.do,
    consequenceDont: c.dont,
    tip: `${TIP[r.relation]}「${r.bian.name}」是这事的归宿——朝着这个方向，把眼下的每一步走稳。`,
  }
}

export function verdictColor(r: Relation): string {
  return VERDICT[r].tone
}
