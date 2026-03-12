import { defaultBaseInputs, defaultGearOutputs, type GearOutputs, type WormInputs } from '../types'
import { toMillimeters } from '../units'

const clampPositive = (value: number): number => (Number.isFinite(value) && value > 0 ? value : NaN)

export const defaults = {
  ...defaultBaseInputs,
  axialModule: 2,
  wormStarts: 1,
  wheelTeeth: 30,
  leadAngleDeg: 20
} satisfies WormInputs

export const validate = (inputs: WormInputs): string[] => {
  const warnings: string[] = []
  if (inputs.axialModule <= 0) warnings.push('Axial module must be greater than 0.')
  if (inputs.wormStarts <= 0) warnings.push('Worm starts must be greater than 0.')
  if (inputs.wheelTeeth <= 0) warnings.push('Wheel teeth must be greater than 0.')
  if (inputs.leadAngleDeg <= 0 || inputs.leadAngleDeg >= 45) {
    warnings.push('Lead angle should be between 0° and 45°.')
  }
  return warnings
}

export const calculate = (rawInputs: WormInputs): GearOutputs => {
  const axialModuleMm = clampPositive(toMillimeters(rawInputs.axialModule, rawInputs.unit))
  const wormStarts = clampPositive(rawInputs.wormStarts)
  const wheelTeeth = clampPositive(rawInputs.wheelTeeth)
  const leadAngleRad = (rawInputs.leadAngleDeg * Math.PI) / 180
  const addendum = axialModuleMm * rawInputs.addendumCoeff
  const dedendum = axialModuleMm * rawInputs.dedendumCoeff

  const pitchDiameterWorm =
    Number.isFinite(leadAngleRad) && Math.tan(leadAngleRad) > 0
      ? (axialModuleMm * wormStarts) / Math.tan(leadAngleRad)
      : NaN
  const pitchDiameterWheel = axialModuleMm * wheelTeeth
  const outsideDiameter = pitchDiameterWheel + 2 * addendum
  const rootDiameter = pitchDiameterWheel - 2 * dedendum
  const baseCircle = pitchDiameterWheel * Math.cos((rawInputs.pressureAngleDeg * Math.PI) / 180)
  const circularPitch = Math.PI * axialModuleMm
  const ratio = wheelTeeth / wormStarts
  const centerDistance = (pitchDiameterWorm + pitchDiameterWheel) / 2

  return {
    ...defaultGearOutputs,
    pitchDiameter: pitchDiameterWheel,
    outsideDiameter,
    rootDiameter,
    baseCircle,
    addendum,
    dedendum,
    circularPitch,
    ratio,
    centerDistance,
    pitchDiameterWorm
  }
}
