import type { BaseLog, LogsByMember } from '@/types/common'
import type { AlertColor } from '@mui/material'

// New Stuff
export function SendNotification(message: string, severity: AlertColor = 'info'): void {
  const event = new CustomEvent('notify', { detail: { message, severity } })

  dispatchEvent(event)
}
export function startCase(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
export function stripAllButNumbers(str: string): string {
  return str.replace(/[^0-9]/gi, '')
}
export function stringToColor(string: string): string {
  let hash = 0
  let i

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#'

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  /* eslint-enable no-bitwise */

  return color
}
export function getContrastTextColor(color: string | number[]): '#000' | '#FFF' {
  return luma(color) >= 165 ? '#000' : '#FFF'
}
function luma(color: string | number[]): number {
  const rgb = typeof color === 'string' ? hexToRGBArray(color) : color

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}
function hexToRGBArray(colorStr: string): number[] {
  let color = colorStr.startsWith('#') ? colorStr.slice(1) : colorStr
  if (color.length === 3)
    color =
      color.charAt(0) +
      color.charAt(0) +
      color.charAt(1) +
      color.charAt(1) +
      color.charAt(2) +
      color.charAt(2)
  else if (color.length !== 6) throw new Error('Invalid hex color: ' + color)

  const rgb = []
  for (let i = 0; i <= 2; i++) rgb[i] = parseInt(color.slice(i * 2, i * 2 + 2), 16)

  return rgb
}

// Old Stuff
export function formatMoney(number: string | number): string {
  const toFormat = typeof number === 'string' ? parseFloat(number) : number

  return toFormat.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
export function formatNumber(num: number, decimail = 1): number {
  const dec = decimail * 10

  if (dec) return Math.floor(num) + Math.round((num % 1) * dec) / dec

  return Math.floor(num)
}
export function flattenBreakdown(
  breakdown: LogsByMember['breakdown'],
): ({ name: string } & BaseLog)[] {
  const arr = []
  for (const [key, value] of Object.entries(breakdown)) {
    arr.push({ name: key, ...value })
  }

  return arr.sort((a, b) => a.name.localeCompare(b.name))
}
