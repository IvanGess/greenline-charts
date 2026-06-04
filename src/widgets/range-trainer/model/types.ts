export interface RangeTrainerExpose {
  startAssignMode: () => void
  canStartAssignMode: () => boolean
  switchToCheckMode: () => void
  switchToRangeMode: () => void
  switchToPositionMode: () => void
}
