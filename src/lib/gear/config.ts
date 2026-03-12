import type { GearType } from './types'

export const supportsDpMode = (gearKey: GearType): boolean =>
  gearKey === 'spur' || gearKey === 'ring' || gearKey === 'helical' || gearKey === 'bevel'

export const moduleFieldForGear = (gearKey: GearType): string | null => {
  if (gearKey === 'helical') return 'normalModule'
  if (gearKey === 'worm') return 'axialModule'
  if (gearKey === 'spur' || gearKey === 'ring' || gearKey === 'bevel') return 'module'
  return null
}

export const isSpurOrRingGear = (gearKey: GearType): boolean =>
  gearKey === 'spur' || gearKey === 'ring'
