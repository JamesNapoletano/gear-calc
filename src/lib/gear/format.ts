import type { LengthUnit } from './types'

export const roundTo = (value: number, decimals = 3): number | '' => {
  if (!Number.isFinite(value)) return ''
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export const formatNumber = (value: number, decimals = 3): string => {
  if (!Number.isFinite(value)) return '—'
  const rounded = roundTo(value, decimals)
  return typeof rounded === 'number' ? rounded.toFixed(decimals) : '—'
}

export const formatAngle = (value: number, decimals = 2): string => {
  if (!Number.isFinite(value)) return '—'
  const rounded = roundTo(value, decimals)
  return typeof rounded === 'number' ? rounded.toFixed(decimals) : '—'
}

export const labelUnit = (unit: LengthUnit): LengthUnit => (unit === 'in' ? 'in' : 'mm')
