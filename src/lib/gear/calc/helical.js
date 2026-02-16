import { defaultBaseInputs, defaultGearOutputs } from '../types.js'
import { toMillimeters } from '../units.js'

const clampPositive = (value) => (Number.isFinite(value) && value > 0 ? value : NaN)

export const defaults = {
  ...defaultBaseInputs,
  normalModule: 2,
  teeth: 20,
  helixAngleDeg: 15
}

export const validate = (inputs) => {
  const warnings = []
  if (inputs.normalModule <= 0) warnings.push('Normal module must be greater than 0.')
  if (inputs.teeth <= 0) warnings.push('Teeth count must be greater than 0.')
  if (inputs.helixAngleDeg <= 0 || inputs.helixAngleDeg >= 45) {
    warnings.push('Helix angle should be between 0° and 45°.')
  }
  return warnings
}

export const calculate = (rawInputs) => {
  const normalModuleMm = clampPositive(toMillimeters(rawInputs.normalModule, rawInputs.unit))
  const teeth = clampPositive(rawInputs.teeth)
  const helixAngleRad = (rawInputs.helixAngleDeg * Math.PI) / 180
  const pressureAngleRad = (rawInputs.pressureAngleDeg * Math.PI) / 180

  const transverseModule = normalModuleMm / Math.cos(helixAngleRad)
  const transversePressureAngle = Math.atan(Math.tan(pressureAngleRad) / Math.cos(helixAngleRad))
  const addendum = transverseModule * rawInputs.addendumCoeff
  const dedendum = transverseModule * rawInputs.dedendumCoeff

  const pitchDiameter = transverseModule * teeth
  const outsideDiameter = pitchDiameter + 2 * addendum
  const rootDiameter = pitchDiameter - 2 * dedendum
  const baseCircle = pitchDiameter * Math.cos(transversePressureAngle)
  const circularPitch = Math.PI * transverseModule

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
