/* 根据名字生成专属色调（同一名字永远同一色） */

export interface NameTheme { key: string; label: string; color: string }

export const NAME_THEMES: NameTheme[] = [
  { key: 'cinnabar', label: '朱砂', color: '#a8352c' },
  { key: 'celadon', label: '青瓷', color: '#4a7c74' },
  { key: 'indigo', label: '黛蓝', color: '#3b6ea5' },
  { key: 'sandalwood', label: '紫檀', color: '#6b4e8e' },
  { key: 'pine', label: '松绿', color: '#4a7c59' },
  { key: 'gold', label: '鎏金', color: '#b08d57' },
]

export function themeForName(name: string): NameTheme {
  if (!name) return NAME_THEMES[0]
  let h = 0
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0
  return NAME_THEMES[h % NAME_THEMES.length]
}
