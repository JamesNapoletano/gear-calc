import { GearTypes } from './types.js'
import * as spur from './calc/spur.js'
import * as helical from './calc/helical.js'
import * as ring from './calc/ring.js'
import * as worm from './calc/worm.js'
import * as bevel from './calc/bevel.js'

export const gearRegistry = {
  [GearTypes.spur]: {
    key: GearTypes.spur,
    label: 'Spur',
    calculator: spur
  },
  [GearTypes.helical]: {
    key: GearTypes.helical,
    label: 'Helical',
    calculator: helical
  },
  [GearTypes.ring]: {
    key: GearTypes.ring,
    label: 'Ring (Internal)',
    calculator: ring
  },
  [GearTypes.worm]: {
    key: GearTypes.worm,
    label: 'Worm',
    calculator: worm
  },
  [GearTypes.bevel]: {
    key: GearTypes.bevel,
    label: 'Bevel',
    calculator: bevel
  }
}

export const gearList = Object.values(gearRegistry)
