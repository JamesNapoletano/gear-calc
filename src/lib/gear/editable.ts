import type { GearOutputs, GearType, LengthUnit } from './types'
import { moduleFieldForGear } from './config'
import { convertLengthValue } from './units'

type MutableInputs = Record<string, number | string>
type Locks = Record<string, boolean>

const toRadians = (deg: number): number => (deg * Math.PI) / 180

const bevelVirtualTeeth = (
  pinionTeeth: number,
  gearTeeth: number,
  shaftAngleDeg: number
): number => {
  const ratio = gearTeeth / pinionTeeth
  const shaftAngleRad = toRadians(shaftAngleDeg)
  const deltaPinion = Math.atan(Math.sin(shaftAngleRad) / (ratio + Math.cos(shaftAngleRad)))
  return pinionTeeth / Math.cos(deltaPinion)
}

const solveMonotonic = ({
  fn,
  target,
  min,
  max,
  iterations = 36
}: {
  fn: (value: number) => number
  target: number
  min: number
  max: number
  iterations?: number
}): number => {
  let lo = min
  let hi = max
  const fLo = fn(lo)
  const fHi = fn(hi)
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi)) return NaN
  const increasing = fHi >= fLo
  for (let i = 0; i < iterations; i += 1) {
    const mid = (lo + hi) / 2
    const value = fn(mid)
    if (!Number.isFinite(value)) return NaN
    if (Math.abs(value - target) < 1e-6) return mid
    if (increasing) {
      if (value < target) lo = mid
      else hi = mid
    } else {
      if (value > target) lo = mid
      else hi = mid
    }
  }
  return (lo + hi) / 2
}

const setModuleByMm = (
  nextInputs: MutableInputs,
  gearKey: GearType,
  moduleMm: number,
  unit: LengthUnit
): boolean => {
  const moduleField = moduleFieldForGear(gearKey)
  if (!moduleField || !Number.isFinite(moduleMm) || moduleMm <= 0) return false
  nextInputs[moduleField] = convertLengthValue(moduleMm, 'mm', unit)
  return true
}

const moduleFromDiameterEdit = (
  gearKey: GearType,
  field: string,
  diameterMm: number,
  nextInputs: MutableInputs
): number => {
  if (!Number.isFinite(diameterMm) || diameterMm <= 0) return NaN
  if (gearKey === 'spur') {
    const z = Number(nextInputs.teeth)
    if (field === 'outsideDiameter') return diameterMm / (z + 2 * Number(nextInputs.addendumCoeff))
    if (field === 'rootDiameter') return diameterMm / (z - 2 * Number(nextInputs.dedendumCoeff))
  }
  if (gearKey === 'ring') {
    const z = Number(nextInputs.teeth)
    if (field === 'outsideDiameter') return diameterMm / (z - 2 * Number(nextInputs.addendumCoeff))
    if (field === 'rootDiameter') return diameterMm / (z + 2 * Number(nextInputs.dedendumCoeff))
  }
  if (gearKey === 'helical') {
    const z = Number(nextInputs.teeth)
    const beta = toRadians(Number(nextInputs.helixAngleDeg))
    const pitchCoeff = z / Math.cos(beta)
    if (field === 'outsideDiameter') return diameterMm / (pitchCoeff + 2 * Number(nextInputs.addendumCoeff))
    if (field === 'rootDiameter') return diameterMm / (pitchCoeff - 2 * Number(nextInputs.dedendumCoeff))
  }
  if (gearKey === 'worm') {
    const z = Number(nextInputs.wheelTeeth)
    if (field === 'outsideDiameter') return diameterMm / (z + 2 * Number(nextInputs.addendumCoeff))
    if (field === 'rootDiameter') return diameterMm / (z - 2 * Number(nextInputs.dedendumCoeff))
  }
  if (gearKey === 'bevel') {
    const virtualTeeth = bevelVirtualTeeth(
      Number(nextInputs.pinionTeeth),
      Number(nextInputs.gearTeeth),
      Number(nextInputs.shaftAngleDeg)
    )
    if (field === 'outsideDiameter') return diameterMm / (virtualTeeth + 2 * Number(nextInputs.addendumCoeff))
    if (field === 'rootDiameter') return diameterMm / (virtualTeeth - 2 * Number(nextInputs.dedendumCoeff))
  }
  return NaN
}

export const canEditPitchDiameter = (gearKey: GearType, locks: Locks): boolean => {
  if (gearKey === 'worm') return !locks.wheelTeeth || !locks.axialModule
  if (gearKey === 'bevel') return !locks.module || !locks.pinionTeeth || !locks.gearTeeth
  if (gearKey === 'helical') return !locks.teeth || !locks.normalModule
  return !locks.teeth || !locks.module
}

export const canEditCircularPitch = (gearKey: GearType, locks: Locks): boolean => {
  const moduleField = moduleFieldForGear(gearKey)
  if (moduleField && !locks[moduleField]) return true
  if (gearKey === 'spur' || gearKey === 'ring' || gearKey === 'helical') {
    return !locks.teeth
  }
  return false
}

export const applyResultEditToInputs = ({
  field,
  displayValue,
  gearKey,
  inputs,
  locks,
  results,
  unit,
  calculate
}: {
  field: string
  displayValue: number
  gearKey: GearType
  inputs: MutableInputs
  locks: Locks
  results: GearOutputs
  unit: LengthUnit
  calculate: (nextInputs: MutableInputs) => GearOutputs
}): MutableInputs => {
  if (!Number.isFinite(displayValue)) return inputs
  const nextInputs = { ...inputs }
  const moduleField = moduleFieldForGear(gearKey)
  const moduleValue = moduleField ? Number(nextInputs[moduleField]) : NaN
  const displayValueMm = convertLengthValue(displayValue, unit, 'mm')
  const moduleValueMm = Number.isFinite(moduleValue) ? convertLengthValue(moduleValue, unit, 'mm') : NaN
  const helixAngleRad = toRadians(Number(nextInputs.helixAngleDeg ?? 0))

  const transverseModuleMm = gearKey === 'helical' ? moduleValueMm / Math.cos(helixAngleRad) : moduleValueMm
  const activeModuleMm =
    gearKey === 'helical'
      ? convertLengthValue(Number(nextInputs.normalModule), unit, 'mm')
      : gearKey === 'worm'
        ? convertLengthValue(Number(nextInputs.axialModule), unit, 'mm')
        : moduleValueMm

  if (field === 'pitchDiameter') {
    if (gearKey === 'worm') {
      const axialModuleMm = convertLengthValue(Number(nextInputs.axialModule), unit, 'mm')
      if (!locks.wheelTeeth) {
        nextInputs.wheelTeeth = displayValueMm / axialModuleMm
      } else if (!locks.axialModule) {
        const nextModuleMm = displayValueMm / Number(nextInputs.wheelTeeth)
        setModuleByMm(nextInputs, gearKey, nextModuleMm, unit)
      } else {
        return inputs
      }
      return nextInputs
    }

    if (gearKey === 'bevel') {
      if (!locks.module) {
        const virtualTeeth = bevelVirtualTeeth(
          Number(nextInputs.pinionTeeth),
          Number(nextInputs.gearTeeth),
          Number(nextInputs.shaftAngleDeg)
        )
        nextInputs.module = displayValueMm / virtualTeeth
        return nextInputs
      }

      const moduleMm = convertLengthValue(Number(nextInputs.module), unit, 'mm')
      const targetVirtual = displayValueMm / moduleMm

      if (!locks.pinionTeeth) {
        const currentRatio = Number(nextInputs.gearTeeth) / Number(nextInputs.pinionTeeth)
        const solvedPinion = solveMonotonic({
          min: 4,
          max: 300,
          target: targetVirtual,
          fn: (z1) => {
            const z2 = locks.gearTeeth ? Number(nextInputs.gearTeeth) : Math.max(6, z1 * currentRatio)
            return bevelVirtualTeeth(z1, z2, Number(nextInputs.shaftAngleDeg))
          }
        })
        if (Number.isFinite(solvedPinion)) {
          nextInputs.pinionTeeth = Math.max(1, Math.round(solvedPinion))
          if (!locks.gearTeeth) {
            nextInputs.gearTeeth = Math.max(1, Math.round(Number(nextInputs.pinionTeeth) * currentRatio))
          }
          return nextInputs
        }
        return inputs
      }

      if (!locks.gearTeeth) {
        const solvedGear = solveMonotonic({
          min: 6,
          max: 600,
          target: targetVirtual,
          fn: (z2) => bevelVirtualTeeth(Number(nextInputs.pinionTeeth), z2, Number(nextInputs.shaftAngleDeg))
        })
        if (Number.isFinite(solvedGear)) {
          nextInputs.gearTeeth = Math.max(1, Math.round(solvedGear))
          return nextInputs
        }
      }

      return inputs
    }

    if (!locks.teeth) {
      nextInputs.teeth = displayValueMm / transverseModuleMm
    } else if (moduleField && !locks[moduleField]) {
      if (gearKey === 'helical') {
        nextInputs.normalModule = (displayValueMm * Math.cos(helixAngleRad)) / Number(nextInputs.teeth)
      } else {
        nextInputs[moduleField] = displayValueMm / Number(nextInputs.teeth)
      }
    } else {
      return inputs
    }
    return nextInputs
  }

  if (field === 'outsideDiameter') {
    if (!locks.addendumCoeff) {
      const pitch = calculate(nextInputs).pitchDiameter
      const addendum = gearKey === 'ring' ? (pitch - displayValueMm) / 2 : (displayValueMm - pitch) / 2
      nextInputs.addendumCoeff = addendum / activeModuleMm
      return nextInputs
    }

    if (moduleField && !locks[moduleField]) {
      const solvedModuleMm = moduleFromDiameterEdit(gearKey, field, displayValueMm, nextInputs)
      if (setModuleByMm(nextInputs, gearKey, solvedModuleMm, unit)) {
        return nextInputs
      }
    }
    return inputs
  }

  if (field === 'rootDiameter') {
    if (!locks.dedendumCoeff) {
      const pitch = calculate(nextInputs).pitchDiameter
      const dedendum = gearKey === 'ring' ? (displayValueMm - pitch) / 2 : (pitch - displayValueMm) / 2
      nextInputs.dedendumCoeff = dedendum / activeModuleMm
      return nextInputs
    }

    if (moduleField && !locks[moduleField]) {
      const solvedModuleMm = moduleFromDiameterEdit(gearKey, field, displayValueMm, nextInputs)
      if (setModuleByMm(nextInputs, gearKey, solvedModuleMm, unit)) {
        return nextInputs
      }
    }
    return inputs
  }

  if (field === 'addendum') {
    if (!locks.addendumCoeff) {
      nextInputs.addendumCoeff = displayValueMm / activeModuleMm
      return nextInputs
    }

    if (moduleField && !locks[moduleField]) {
      const coeff = Number(nextInputs.addendumCoeff)
      if (Number.isFinite(coeff) && coeff > 0) {
        const nextModuleMm = displayValueMm / coeff
        if (setModuleByMm(nextInputs, gearKey, nextModuleMm, unit)) {
          return nextInputs
        }
      }
    }
    return inputs
  }

  if (field === 'dedendum') {
    if (!locks.dedendumCoeff) {
      nextInputs.dedendumCoeff = displayValueMm / activeModuleMm
      return nextInputs
    }

    if (moduleField && !locks[moduleField]) {
      const coeff = Number(nextInputs.dedendumCoeff)
      if (Number.isFinite(coeff) && coeff > 0) {
        const nextModuleMm = displayValueMm / coeff
        if (setModuleByMm(nextInputs, gearKey, nextModuleMm, unit)) {
          return nextInputs
        }
      }
    }
    return inputs
  }

  if (field === 'circularPitch') {
    if (moduleField && !locks[moduleField]) {
      const transverseModule = displayValueMm / Math.PI
      if (gearKey === 'helical') {
        nextInputs.normalModule = transverseModule * Math.cos(helixAngleRad)
      } else if (gearKey === 'worm') {
        nextInputs.axialModule = transverseModule
      } else {
        nextInputs[moduleField] = transverseModule
      }
      return nextInputs
    }

    if (
      (gearKey === 'spur' || gearKey === 'ring' || gearKey === 'helical') &&
      !locks.teeth &&
      Number.isFinite(results.pitchDiameter) &&
      results.pitchDiameter > 0
    ) {
      const circumference = Math.PI * results.pitchDiameter
      nextInputs.teeth = circumference / displayValueMm
      return nextInputs
    }

    return inputs
  }

  return nextInputs
}
