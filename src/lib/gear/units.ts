import type { LengthUnit } from './types'

export const MM_PER_IN = 25.4

export const toMillimeters = (value: number, unit: LengthUnit): number => {
  if (!Number.isFinite(value)) return NaN
  return unit === 'in' ? value * MM_PER_IN : value
}

export const fromMillimeters = (value: number, unit: LengthUnit): number => {
  if (!Number.isFinite(value)) return NaN
  return unit === 'in' ? value / MM_PER_IN : value
}

export const convertLengthValue = (
  value: number,
  fromUnit: LengthUnit,
  toUnit: LengthUnit
): number => {
  if (!Number.isFinite(value)) return value
  if (fromUnit === toUnit) return value
  return fromMillimeters(toMillimeters(value, fromUnit), toUnit)
}

export const moduleToDiametralPitch = (moduleValue: number, unit: LengthUnit): number => {
  if (!Number.isFinite(moduleValue) || moduleValue <= 0) return NaN
  const moduleInches = unit === 'in' ? moduleValue : moduleValue / MM_PER_IN
  return 1 / moduleInches
}

export const diametralPitchToModule = (diametralPitch: number, unit: LengthUnit): number => {
  if (!Number.isFinite(diametralPitch) || diametralPitch <= 0) return NaN
  const moduleInches = 1 / diametralPitch
  return unit === 'in' ? moduleInches : moduleInches * MM_PER_IN
}
