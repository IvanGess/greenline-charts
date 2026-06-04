import type { HandKey } from './types'

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const

export type Rank = (typeof RANKS)[number]

export interface MatrixCell {
  key: HandKey
  row: number
  col: number
  label: string
}

/** 13×13: диагональ пары, выше suited, ниже offsuit. */
export function buildHandMatrix(): MatrixCell[][] {
  const matrix: MatrixCell[][] = []

  for (let row = 0; row < 13; row += 1) {
    const line: MatrixCell[] = []
    for (let col = 0; col < 13; col += 1) {
      const high = RANKS[row]
      const low = RANKS[col]
      let key: HandKey
      let label: string

      if (row === col) {
        key = `${high}${low}`
        label = key
      } else if (row < col) {
        key = `${high}${low}s`
        label = key
      } else {
        key = `${low}${high}o`
        label = key
      }

      line.push({ key, row, col, label })
    }
    matrix.push(line)
  }

  return matrix
}

export const HAND_MATRIX = buildHandMatrix()

export const ALL_HAND_KEYS: HandKey[] = HAND_MATRIX.flat().map((c) => c.key)
