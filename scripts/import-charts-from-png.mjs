import fs from 'node:fs'
import path from 'node:path'
import { createCanvas, loadImage } from '@napi-rs/canvas'

import layouts from './chart-layouts.json' with { type: 'json' }

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

function buildHandMatrix() {
  const matrix = []
  for (let row = 0; row < 13; row += 1) {
    const line = []
    for (let col = 0; col < 13; col += 1) {
      const high = RANKS[row]
      const low = RANKS[col]
      let key
      if (row === col) key = `${high}${low}`
      else if (row < col) key = `${high}${low}s`
      else key = `${low}${high}o`
      line.push({ key, row, col })
    }
    matrix.push(line)
  }
  return matrix
}

const MATRIX = buildHandMatrix()
const RENDER_DIR = path.join(process.cwd(), 'docs', 'rendered')
const OUT_DIR = path.join(process.cwd(), 'src', 'entities', 'range', 'model', 'charts')

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function colorDist(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
}

function isBackground(rgb) {
  if (rgb.r > 200 && rgb.g > 200 && rgb.b > 200) return true
  return false
}

function classifyPixel(rgb, actions) {
  if (isBackground(rgb)) return null
  const strong =
    (rgb.r > 210 && rgb.g < 110 && rgb.b < 110) ||
    (rgb.g > 190 && rgb.r < 110 && rgb.b < 110) ||
    (rgb.r > 210 && rgb.g > 190 && rgb.b < 90) ||
    (rgb.b > 150 && rgb.r > 90 && rgb.g < 90)
  if (!strong) return null
  let best = null
  let bestD = Infinity
  for (const action of actions) {
    const ref = hexToRgb(action.color)
    const d = colorDist(rgb, ref)
    if (d < bestD) {
      bestD = d
      best = action.id
    }
  }
  return bestD < 85 ? best : null
}

function sampleRgb(imageData, x, y) {
  const { width, height, data } = imageData
  const ix = Math.min(width - 1, Math.max(0, Math.round(x)))
  const iy = Math.min(height - 1, Math.max(0, Math.round(y)))
  const i = (iy * width + ix) * 4
  return { r: data[i], g: data[i + 1], b: data[i + 2] }
}

function extractChart(imageData, imgW, imgH, chartDef, actions) {
  const [fx, fy, fw, fh] = chartDef.bbox
  const x0 = fx * imgW
  const y0 = fy * imgH
  const w = fw * imgW
  const h = fh * imgH
  const cellW = w / 13
  const cellH = h / 13
  const solution = {}

  for (const row of MATRIX) {
    for (const cell of row) {
      const cx = x0 + (cell.col + 0.5) * cellW
      const cy = y0 + (cell.row + 0.5) * cellH
      const points = [
        [cx, cy],
        [x0 + (cell.col + 0.35) * cellW, y0 + (cell.row + 0.35) * cellH],
        [x0 + (cell.col + 0.65) * cellW, y0 + (cell.row + 0.35) * cellH],
        [x0 + (cell.col + 0.35) * cellW, y0 + (cell.row + 0.65) * cellH],
        [x0 + (cell.col + 0.65) * cellW, y0 + (cell.row + 0.65) * cellH],
      ]
      const found = new Set()
      for (const [px, py] of points) {
        const rgb = sampleRgb(imageData, px, py)
        const id = classifyPixel(rgb, actions)
        if (id) found.add(id)
      }
      if (found.size > 0) {
        solution[cell.key] = [...found].sort()
      }
    }
  }

  return solution
}

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const [pageKey, page] of Object.entries(layouts)) {
  const pngPath = path.join(RENDER_DIR, `${pageKey}.png`)
  if (!fs.existsSync(pngPath)) {
    console.warn('skip missing', pngPath)
    continue
  }
  const img = await loadImage(pngPath)
  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)

  for (const chart of page.charts) {
    const solution = extractChart(imageData, img.width, img.height, chart, page.actions)
    const handCount = Object.keys(solution).length
    const out = {
      id: chart.id,
      title: chart.title,
      position: chart.position,
      situation: page.situation,
      sourcePage: page.sourcePdf,
      actions: page.actions,
      solution,
    }
    const file = path.join(OUT_DIR, `${chart.id}.json`)
    fs.writeFileSync(file, JSON.stringify(out, null, 2))
    console.log('wrote', path.basename(file), 'hands', handCount)
  }
}
