export const MM_PER_IN = 25.4

export const toMillimeters = (value, unit) => {
  if (!Number.isFinite(value)) return NaN
  return unit === 'in' ? value * MM_PER_IN : value
}

export const fromMillimeters = (value, unit) => {
  if (!Number.isFinite(value)) return NaN
  return unit === 'in' ? value / MM_PER_IN : value
}

export const convertLengthValue = (value, fromUnit, toUnit) => {
  if (!Number.isFinite(value)) return value
  if (fromUnit === toUnit) return value
  return fromMillimeters(toMillimeters(value, fromUnit), toUnit)
}
