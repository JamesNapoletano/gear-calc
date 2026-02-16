import { defaultBaseInputs, defaultGearOutputs } from '../types.js'
import { toMillimeters } from '../units.js'

const clampPositive = (value) => (Number.isFinite(value) && value > 0 ? value : NaN)

export const defaults = {
  ...defaultBaseInputs,
  module: 2,
  teeth: 60,
  addendumCoeff: 1,
  dedendumCoeff: 1.157
}

export const validate = (inputs) => {
  const warnings = []
  if (inputs.module <= 0) warnings.push('Module must be greater than 0.')
  if (inputs.teeth <= 0) warnings.push('Teeth count must be greater than 0.')
  if (inputs.addendumCoeff <= 0) warnings.push('Addendum coefficient must be greater than 0.')
  if (inputs.dedendumCoeff <= 0) warnings.push('Dedendum coefficient must be greater than 0.')
  const isStandardPressureAngle =
    Math.abs(inputs.pressureAngleDeg - 14.5) < 0.01 ||
    Math.abs(inputs.pressureAngleDeg - 20) < 0.01
  if (!isStandardPressureAngle) {
    warnings.push('Ring gears typically use a 14.5° or 20° pressure angle.')
  }
  if (Math.abs(inputs.addendumCoeff - 1) > 0.01) {
    warnings.push('Ring gear addendum is typically 1.0 × module.')
  }
  if (Math.abs(inputs.dedendumCoeff - 1.157) > 0.01) {
    warnings.push('Ring gear dedendum is typically 1.157 × module.')
  }
  return warnings
}

export const calculate = (rawInputs) => {
  const moduleMm = clampPositive(toMillimeters(rawInputs.module, rawInputs.unit))
  const teeth = clampPositive(rawInputs.teeth)
  const pressureAngleRad = (rawInputs.pressureAngleDeg * Math.PI) / 180
  const addendum = moduleMm * rawInputs.addendumCoeff
  const dedendum = moduleMm * rawInputs.dedendumCoeff

  const pitchDiameter = moduleMm * teeth
  const outsideDiameter = pitchDiameter - 2 * addendum
  const rootDiameter = pitchDiameter + 2 * dedendum
  const baseCircle = pitchDiameter * Math.cos(pressureAngleRad)
  const circularPitch = Math.PI * moduleMm

  return {
    ...defaultGearOutputs,
    pitchDiameter,
    outsideDiameter,
    rootDiameter,
    baseCircle,
    addendum,
    dedendum,
    circularPitch
  }
}
