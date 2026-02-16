import { defaultBaseInputs, defaultGearOutputs } from '../types.js'
import { toMillimeters } from '../units.js'

const clampPositive = (value) => (Number.isFinite(value) && value > 0 ? value : NaN)

export const defaults = {
  ...defaultBaseInputs,
  module: 2,
  pinionTeeth: 20,
  gearTeeth: 40,
  shaftAngleDeg: 90
}

export const validate = (inputs) => {
  const warnings = []
  if (inputs.module <= 0) warnings.push('Module must be greater than 0.')
  if (inputs.pinionTeeth <= 0 || inputs.gearTeeth <= 0) {
    warnings.push('Teeth counts must be greater than 0.')
  }
  if (inputs.shaftAngleDeg <= 0 || inputs.shaftAngleDeg >= 180) {
    warnings.push('Shaft angle should be between 0° and 180°.')
  }
  warnings.push('Bevel calculations are approximations using virtual teeth.')
  return warnings
}

const toRadians = (deg) => (deg * Math.PI) / 180

export const calculate = (rawInputs) => {
  const moduleMm = clampPositive(toMillimeters(rawInputs.module, rawInputs.unit))
  const pinionTeeth = clampPositive(rawInputs.pinionTeeth)
  const gearTeeth = clampPositive(rawInputs.gearTeeth)
  const shaftAngleRad = toRadians(rawInputs.shaftAngleDeg)
  const pressureAngleRad = toRadians(rawInputs.pressureAngleDeg)
  const addendum = moduleMm * rawInputs.addendumCoeff
  const dedendum = moduleMm * rawInputs.dedendumCoeff

  const ratio = gearTeeth / pinionTeeth
  const deltaPinion = Math.atan(
    Math.sin(shaftAngleRad) / (ratio + Math.cos(shaftAngleRad))
  )
  const virtualTeeth = pinionTeeth / Math.cos(deltaPinion)

  const pitchDiameter = moduleMm * virtualTeeth
  const outsideDiameter = pitchDiameter + 2 * addendum
  const rootDiameter = pitchDiameter - 2 * dedendum
  const baseCircle = pitchDiameter * Math.cos(pressureAngleRad)
  const circularPitch = Math.PI * moduleMm
  const centerDistance = (moduleMm * (pinionTeeth + gearTeeth)) / 2

  return {
    ...defaultGearOutputs,
    pitchDiameter,
    outsideDiameter,
    rootDiameter,
    baseCircle,
    addendum,
    dedendum,
    circularPitch,
    ratio,
    centerDistance
  }
}
