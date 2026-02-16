export const GearTypes = {
  spur: 'spur',
  helical: 'helical',
  ring: 'ring',
  worm: 'worm',
  bevel: 'bevel'
}

export const defaultBaseInputs = {
  unit: 'mm',
  pressureAngleDeg: 20,
  addendumCoeff: 1,
  dedendumCoeff: 1.25
}

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
