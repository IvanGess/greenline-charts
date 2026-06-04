import { computed, reactive, ref, watch } from 'vue'

import type { CellPaint, ChartAction, HandKey, RangeChartDefinition } from '@shared/lib/poker'
import { normalizeCellPaint, roundCellPercent } from '@shared/lib/poker'

const MAX_ACTIONS_PER_CELL = 2
const TOTAL_CELL_PERCENT = 100
type BrushShare = 50 | 25

export function useRangePainter(chart: () => RangeChartDefinition | undefined) {
  const userCells = reactive<Record<HandKey, CellPaint>>({})
  const userCellShareMemory = reactive<Record<HandKey, Partial<Record<string, BrushShare>>>>({})
  const activeBrush = ref<Set<string>>(new Set())
  const brushShare = ref<BrushShare | null>(null)
  const showCheck = ref(false)

  function applyDefaultBrush(): void {
    const firstActionId = chart()?.actions[0]?.id
    activeBrush.value = firstActionId ? new Set([firstActionId]) : new Set()
  }

  function resetUserCells(): void {
    for (const key of Object.keys(userCells)) {
      delete userCells[key]
    }
    for (const key of Object.keys(userCellShareMemory)) {
      delete userCellShareMemory[key]
    }
    showCheck.value = false
  }

  watch(
    () => chart()?.id,
    () => {
      resetUserCells()
      applyDefaultBrush()
    },
    { immediate: true },
  )

  const actionsById = computed(() => {
    const map = new Map<string, ChartAction>()
    for (const a of chart()?.actions ?? []) {
      map.set(a.id, a)
    }
    return map
  })

  function toggleBrushAction(actionId: string): void {
    activeBrush.value = new Set([actionId])
  }

  function setBrushShare(value: BrushShare): void {
    brushShare.value = brushShare.value === value ? null : value
  }

  function paintCell(key: HandKey): void {
    showCheck.value = false
    const activeActionId = [...activeBrush.value][0]
    if (!activeActionId) return

    const current = normalizeCellPaint({ ...(userCells[key] ?? {}) })

    if (brushShare.value === null) {
      paintCellFullMode(key, current, activeActionId)
      return
    }

    const hasCurrentAction = Number(current[activeActionId] ?? 0) > 0
    const currentIds = Object.keys(current).filter((id) => (current[id] ?? 0) > 0)

    if (!hasCurrentAction && currentIds.length >= MAX_ACTIONS_PER_CELL) return

    const otherIds = currentIds.filter((id) => id !== activeActionId)
    const otherTotal = otherIds.reduce((sum, id) => sum + Number(current[id] ?? 0), 0)

    if (hasCurrentAction) {
      removeActionFromCell(key, activeActionId, otherIds)
      return
    }

    const baseForTransfer = otherTotal > 0 ? otherTotal / 2 : TOTAL_CELL_PERCENT
    const transfer = roundCellPercent(baseForTransfer * (brushShare.value / 100))
    if (transfer <= 0) return

    const reduced = removeFromOthers(current, otherIds, transfer)
    reduced[activeActionId] = Number(reduced[activeActionId] ?? 0) + transfer
    const next = normalizeCellPaint(reduced)
    if (Object.keys(next).length === 0) delete userCells[key]
    else userCells[key] = next
    if (!userCellShareMemory[key]) userCellShareMemory[key] = {}
    userCellShareMemory[key][activeActionId] = brushShare.value
  }

  function removeActionFromCell(key: HandKey, actionId: string, otherIds: string[]): void {
    if (otherIds.length === 0) {
      delete userCells[key]
      delete userCellShareMemory[key]?.[actionId]
      return
    }
    const current = normalizeCellPaint(userCells[key] ?? {})
    const next: CellPaint = {}
    if (otherIds.length === 1) {
      const remainingId = otherIds[0]
      next[remainingId] = userCellShareMemory[key]?.[remainingId] ?? TOTAL_CELL_PERCENT
    } else {
      const share = TOTAL_CELL_PERCENT / otherIds.length
      for (const id of otherIds) next[id] = share
    }
    userCells[key] = normalizeCellPaint(next)
    delete userCellShareMemory[key]?.[actionId]
    // keep unused var from lint: current is checked above via normalizeCellPaint
    void current
  }

  function paintCellFullMode(key: HandKey, current: CellPaint, activeActionId: string): void {
    const ids = Object.keys(current).filter((id) => Number(current[id] ?? 0) > 0)
    const hasCurrentAction = ids.includes(activeActionId)

    if (hasCurrentAction) {
      removeActionFromCell(key, activeActionId, ids.filter((id) => id !== activeActionId))
      return
    }

    if (ids.length === 1) {
      const sourceId = ids[0]
      const sourceValue = Number(current[sourceId] ?? 0)
      const sourceRatio = (userCellShareMemory[key]?.[sourceId] ?? 50) / 100
      const sourceNext = roundCellPercent(sourceValue * sourceRatio)
      const targetNext = roundCellPercent(TOTAL_CELL_PERCENT - sourceNext)
      if (targetNext <= 0) return

      const next: CellPaint = { ...current }
      next[sourceId] = sourceNext
      if ((next[sourceId] ?? 0) <= 0) delete next[sourceId]
      next[activeActionId] = targetNext
      userCells[key] = normalizeCellPaint(next)
      return
    }

    if (ids.length >= MAX_ACTIONS_PER_CELL) {
      const sortedByShare = [...ids].sort(
        (a, b) => Number(current[b] ?? 0) - Number(current[a] ?? 0),
      )
      const kept = sortedByShare[0]
      const nextIds = [kept, activeActionId]
      const share = TOTAL_CELL_PERCENT / nextIds.length
      const next: CellPaint = {}
      for (const id of nextIds) next[id] = share
      userCells[key] = normalizeCellPaint(next)
      if (userCellShareMemory[key]) {
        for (const id of ids) {
          if (id !== kept && id !== activeActionId) delete userCellShareMemory[key][id]
        }
      }
      return
    }

    const nextIds = [...ids, activeActionId]
    const share = TOTAL_CELL_PERCENT / nextIds.length
    const next: CellPaint = {}
    for (const id of nextIds) next[id] = share
    userCells[key] = normalizeCellPaint(next)
  }

  function clearAll(): void {
    resetUserCells()
  }

  return {
    userCells,
    userCellShareMemory,
    activeBrush,
    brushShare,
    showCheck,
    actionsById,
    setBrushShare,
    toggleBrushAction,
    paintCell,
    clearAll,
    applyDefaultBrush,
    resetUserCells,
  }
}

function removeFromOthers(
  source: CellPaint,
  otherIds: string[],
  amountToRemove: number,
): CellPaint {
  const next = { ...source }
  const total = otherIds.reduce((sum, id) => sum + Number(next[id] ?? 0), 0)
  if (total <= 0) return next

  let remaining = amountToRemove
  for (const id of otherIds) {
    const current = Number(next[id] ?? 0)
    if (current <= 0) continue
    const share = current / total
    const rawPart = roundCellPercent(amountToRemove * share)
    const part = Math.min(current, rawPart, remaining)
    next[id] = current - part
    if (next[id] <= 0) delete next[id]
    remaining = roundCellPercent(remaining - part)
  }

  if (remaining > 0) {
    for (const id of otherIds) {
      const current = Number(next[id] ?? 0)
      if (current <= 0) continue
      const part = Math.min(current, remaining)
      next[id] = current - part
      if (next[id] <= 0) delete next[id]
      remaining = roundCellPercent(remaining - part)
      if (remaining <= 0) break
    }
  }

  return next
}
