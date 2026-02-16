export const roundTo = (value, decimals = 3) => {
  if (!Number.isFinite(value)) return ''
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export const formatNumber = (value, decimals = 3) => {
  if (!Number.isFinite(value)) return '—'
  return roundTo(value, decimals).toFixed(decimals)
}

export const formatAngle = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return '—'
  return roundTo(value, decimals).toFixed(decimals)
}

export const labelUnit = (unit) => (unit === 'in' ? 'in' : 'mm')
