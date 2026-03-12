export const GearTypes = {
  spur: 'spur',
  helical: 'helical',
  ring: 'ring',
  worm: 'worm',
  bevel: 'bevel'
} as const

export type GearType = (typeof GearTypes)[keyof typeof GearTypes]
export type LengthUnit = 'mm' | 'in'

export const defaultBaseInputs = {
  unit: 'mm',
  pressureAngleDeg: 20,
  addendumCoeff: 1,
  dedendumCoeff: 1.25
} as const

export interface BaseInputs {
  unit: LengthUnit
  pressureAngleDeg: number
  addendumCoeff: number
  dedendumCoeff: number
}

export interface SpurInputs extends BaseInputs {
  module: number
  teeth: number
}

export interface RingInputs extends BaseInputs {
  module: number
  teeth: number
}

export interface HelicalInputs extends BaseInputs {
  normalModule: number
  teeth: number
  helixAngleDeg: number
}

export interface WormInputs extends BaseInputs {
  axialModule: number
  wormStarts: number
  wheelTeeth: number
  leadAngleDeg: number
}

export interface BevelInputs extends BaseInputs {
  module: number
  pinionTeeth: number
  gearTeeth: number
  shaftAngleDeg: number
}

export type GearInputs = SpurInputs | RingInputs | HelicalInputs | WormInputs | BevelInputs

export const defaultGearOutputs = {
  pitchDiameter: NaN,
  outsideDiameter: NaN,
  rootDiameter: NaN,
  baseCircle: NaN,
  addendum: NaN,
  dedendum: NaN,
  circularPitch: NaN,
  ratio: NaN,
  centerDistance: NaN,
  pitchDiameterWorm: NaN
}

export interface GearOutputs {
  pitchDiameter: number
  outsideDiameter: number
  rootDiameter: number
  baseCircle: number
  addendum: number
  dedendum: number
  circularPitch: number
  ratio: number
  centerDistance: number
  pitchDiameterWorm: number
}

export interface GearCalculator<TInput extends GearInputs> {
  defaults: TInput
  validate: (inputs: TInput) => string[]
  calculate: (inputs: TInput) => GearOutputs
}
