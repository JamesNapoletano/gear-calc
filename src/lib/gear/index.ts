import { GearTypes } from './types'
import type {
  BevelInputs,
  GearCalculator,
  GearType,
  HelicalInputs,
  RingInputs,
  SpurInputs,
  WormInputs
} from './types'
import * as spur from './calc/spur'
import * as helical from './calc/helical'
import * as ring from './calc/ring'
import * as worm from './calc/worm'
import * as bevel from './calc/bevel'

type RegistryEntry<TInput extends SpurInputs | RingInputs | HelicalInputs | WormInputs | BevelInputs> = {
  key: GearType
  label: string
  calculator: GearCalculator<TInput>
}

export const gearRegistry = {
  [GearTypes.spur]: {
    key: GearTypes.spur,
    label: 'Spur',
    calculator: spur
  } satisfies RegistryEntry<SpurInputs>,
  [GearTypes.helical]: {
    key: GearTypes.helical,
    label: 'Helical',
    calculator: helical
  } satisfies RegistryEntry<HelicalInputs>,
  [GearTypes.ring]: {
    key: GearTypes.ring,
    label: 'Ring (Internal)',
    calculator: ring
  } satisfies RegistryEntry<RingInputs>,
  [GearTypes.worm]: {
    key: GearTypes.worm,
    label: 'Worm',
    calculator: worm
  } satisfies RegistryEntry<WormInputs>,
  [GearTypes.bevel]: {
    key: GearTypes.bevel,
    label: 'Bevel',
    calculator: bevel
  } satisfies RegistryEntry<BevelInputs>
}

export const gearList = Object.values(gearRegistry)
